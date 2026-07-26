const User = require('../models/User');
const Donation = require('../models/Donation');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// GET /api/admin/users
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const users = await User.listUsers({ role });
    res.json({ success: true, count: users.length, users: users.map(User.sanitizeUser) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/status  { status: 'active' | 'blocked' }
async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      throw new AppError('status must be active or blocked', 400);
    }
    const user = await User.findUserById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    const updated = await User.updateUser(req.params.id, { status });
    logger.info('Admin updated user status', { userId: req.params.id, status });
    res.json({ success: true, message: `User ${status}`, user: User.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const user = await User.findUserById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    await User.deleteUser(req.params.id);
    logger.info('Admin deleted user', { userId: req.params.id });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/donations
async function listAllDonations(req, res, next) {
  try {
    const donations = await Donation.listAllDonations();
    res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [users, donations] = await Promise.all([
      User.listUsers(),
      Donation.listAllDonations(),
    ]);

    const stats = {
      totalUsers: users.length,
      totalDonors: users.filter((u) => u.role === 'donor').length,
      totalNgos: users.filter((u) => u.role === 'ngo').length,
      blockedUsers: users.filter((u) => u.status === 'blocked').length,
      totalDonations: donations.length,
      availableDonations: donations.filter((d) => d.status === 'available').length,
      acceptedDonations: donations.filter((d) => d.status === 'accepted').length,
      completedDonations: donations.filter((d) => d.status === 'completed').length,
    };

    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUserStatus, deleteUser, listAllDonations, getStats };
