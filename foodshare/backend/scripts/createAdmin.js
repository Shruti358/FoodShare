/**
 * Seeds an initial Admin account (admins can't self-register via the API).
 * Run with:  node scripts/createAdmin.js "Admin Name" admin@foodshare.org StrongPass123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

(async () => {
  const [, , name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js "Admin Name" admin@foodshare.org StrongPass123');
    process.exit(1);
  }

  const existing = await User.findUserByEmail(email);
  if (existing) {
    console.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.createUser({ name, email, passwordHash, role: 'admin' });
  console.log('✓ Admin account created:', { userId: user.userId, email: user.email });
  process.exit(0);
})();
