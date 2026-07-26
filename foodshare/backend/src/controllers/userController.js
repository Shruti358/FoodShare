const bcrypt = require('bcryptjs');
const User = require('../models/User');

// GET /api/users/profile
async function getProfile(req, res, next) {
  try {
    const user = await User.findUserById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: User.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, organizationName, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (organizationName !== undefined) updates.organizationName = organizationName;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    const updated = await User.updateUser(req.user.userId, updates);
    res.json({ success: true, message: 'Profile updated', user: User.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
