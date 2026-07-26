require('dotenv').config();

module.exports = {
  USERS_TABLE: process.env.DDB_TABLE_USERS || 'FoodShare_Users',
  DONATIONS_TABLE: process.env.DDB_TABLE_DONATIONS || 'FoodShare_Donations',
};
