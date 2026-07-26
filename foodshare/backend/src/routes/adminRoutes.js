const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  listUsers,
  updateUserStatus,
  deleteUser,
  listAllDonations,
  getStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/users', listUsers);
router.patch(
  '/users/:id/status',
  [body('status').isIn(['active', 'blocked'])],
  validate,
  updateUserStatus
);
router.delete('/users/:id', deleteUser);

router.get('/donations', listAllDonations);
router.get('/stats', getStats);

module.exports = router;
