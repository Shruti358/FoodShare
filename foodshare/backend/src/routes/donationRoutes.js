const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDonation,
  listAvailableDonations,
  listMyDonations,
  getDonation,
  acceptDonation,
  rejectDonation,
  completeDonation,
  cancelDonation,
} = require('../controllers/donationController');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('donor'),
  upload.single('image'),
  [
    body('foodName').trim().notEmpty().withMessage('Food name is required'),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  ],
  validate,
  createDonation
);

router.get('/', authenticate, authorize('ngo', 'admin'), listAvailableDonations);
router.get('/mine', authenticate, listMyDonations);
router.get('/:id', authenticate, getDonation);

router.patch('/:id/accept', authenticate, authorize('ngo'), acceptDonation);
router.patch('/:id/reject', authenticate, authorize('ngo'), rejectDonation);
router.patch('/:id/complete', authenticate, authorize('ngo', 'donor'), completeDonation);

router.delete('/:id', authenticate, authorize('donor'), cancelDonation);

module.exports = router;
