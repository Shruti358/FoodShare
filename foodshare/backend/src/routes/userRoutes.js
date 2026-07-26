const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticate, getProfile);

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('password').optional().isLength({ min: 6 }),
  ],
  validate,
  updateProfile
);

module.exports = router;
