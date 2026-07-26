const Donation = require('../models/Donation');
const User = require('../models/User');
const { uploadFoodImage, deleteFoodImage } = require('../utils/s3');
const { notify } = require('../utils/sns');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

// POST /api/donations  (donor only)
async function createDonation(req, res, next) {
  try {
    const { foodName, category, quantity, description, pickupLocation, expiryTime } = req.body;

    let imageKey = null;
    let imageUrl = null;
    if (req.file) {
      const uploaded = await uploadFoodImage(req.file.buffer, req.file.mimetype, req.file.originalname);
      imageKey = uploaded.key;
      imageUrl = uploaded.url;
    }

    const donor = await User.findUserById(req.user.userId);

    const donation = await Donation.createDonation({
      donorId: req.user.userId,
      donorName: donor.name,
      donorPhone: donor.phone,
      foodName,
      category,
      quantity,
      description,
      pickupLocation,
      expiryTime,
      imageKey,
      imageUrl,
    });

    logger.info('Donation created', { donationId: donation.donationId, donorId: req.user.userId });
    notify.newDonation(donation);

    res.status(201).json({ success: true, message: 'Donation posted successfully', donation });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations  (available donations - NGO view, supports ?status=)
async function listAvailableDonations(req, res, next) {
  try {
    const donations = await Donation.listAvailableDonations();
    res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/mine (donor: their own donations | ngo: donations they accepted)
async function listMyDonations(req, res, next) {
  try {
    let donations;
    if (req.user.role === 'donor') {
      donations = await Donation.listDonationsByDonor(req.user.userId);
    } else if (req.user.role === 'ngo') {
      donations = await Donation.listDonationsByNgo(req.user.userId);
    } else {
      donations = await Donation.listAllDonations();
    }
    res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    next(err);
  }
}

// GET /api/donations/:id
async function getDonation(req, res, next) {
  try {
    const donation = await Donation.findDonationById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    res.json({ success: true, donation });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/accept  (ngo only)
async function acceptDonation(req, res, next) {
  try {
    const donation = await Donation.findDonationById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    if (donation.status !== 'available') {
      throw new AppError('This donation is no longer available', 400);
    }

    const ngo = await User.findUserById(req.user.userId);
    const updated = await Donation.updateDonation(donation.donationId, {
      status: 'accepted',
      ngoId: req.user.userId,
      ngoName: ngo.organizationName || ngo.name,
      acceptedAt: new Date().toISOString(),
    });

    logger.info('Donation accepted', { donationId: donation.donationId, ngoId: req.user.userId });
    notify.donationAccepted(updated);

    res.json({ success: true, message: 'Donation accepted', donation: updated });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/reject (ngo only) - releases donation back to pool
async function rejectDonation(req, res, next) {
  try {
    const donation = await Donation.findDonationById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);

    const updated = await Donation.updateDonation(donation.donationId, {
      status: 'available',
      ngoId: null,
      ngoName: null,
      acceptedAt: null,
    });

    logger.info('Donation rejected', { donationId: donation.donationId, ngoId: req.user.userId });
    notify.donationRejected(donation);

    res.json({ success: true, message: 'Donation rejected', donation: updated });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/donations/:id/complete (ngo or donor) - marks pickup as done
async function completeDonation(req, res, next) {
  try {
    const donation = await Donation.findDonationById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    if (donation.status !== 'accepted') {
      throw new AppError('Only accepted donations can be marked completed', 400);
    }

    const updated = await Donation.updateDonation(donation.donationId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    logger.info('Donation completed', { donationId: donation.donationId });
    notify.donationCompleted(updated);

    res.json({ success: true, message: 'Donation marked as completed', donation: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/donations/:id (donor - only if still available)
async function cancelDonation(req, res, next) {
  try {
    const donation = await Donation.findDonationById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    if (donation.donorId !== req.user.userId) {
      throw new AppError('You can only cancel your own donations', 403);
    }
    if (donation.status === 'completed') {
      throw new AppError('Completed donations cannot be cancelled', 400);
    }

    if (donation.imageKey) await deleteFoodImage(donation.imageKey);
    await Donation.deleteDonation(donation.donationId);

    logger.info('Donation cancelled', { donationId: donation.donationId });
    res.json({ success: true, message: 'Donation cancelled' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createDonation,
  listAvailableDonations,
  listMyDonations,
  getDonation,
  acceptDonation,
  rejectDonation,
  completeDonation,
  cancelDonation,
};
