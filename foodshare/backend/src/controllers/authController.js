const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { notify } = require('../utils/sns');
const logger = require('../utils/logger');

function signToken(user) {
  return jwt.sign(
    { userId: user.userId, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, address, organizationName } = req.body;

    const existing = await User.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    if (!['donor', 'ngo'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be donor or ngo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.createUser({
      name,
      email,
      passwordHash,
      role,
      phone,
      address,
      organizationName,
    });

    const token = signToken(user);
    logger.info('New user registered', { userId: user.userId, role: user.role });
    notify.userRegistered(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: User.sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'This account has been blocked by admin' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    logger.info('User logged in', { userId: user.userId });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: User.sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await User.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: User.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
