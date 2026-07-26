require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  logger.info(`FoodShare backend listening on port ${PORT}`);
  console.log(`🚀 FoodShare API running at http://localhost:${PORT}`);

  try {
    const admin = await User.findUserByEmail('admin@foodshare.org');
    if (!admin) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await User.createUser({
        name: 'Platform Admin',
        email: 'admin@foodshare.org',
        passwordHash,
        role: 'admin',
      });
      console.log('✓ Default Admin account ready (admin@foodshare.org / Admin123!)');
    }
  } catch (err) {
    // Non-critical startup seeding error
  }
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message, stack: err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

