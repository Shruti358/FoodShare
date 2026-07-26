/**
 * One-time setup script: creates the DynamoDB tables + GSIs required by FoodShare.
 * Run with:  node scripts/createTables.js
 */
require('dotenv').config();
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { ddbClient } = require('../src/config/aws');
const { USERS_TABLE, DONATIONS_TABLE } = require('../src/config/tables');

async function tableExists(name) {
  try {
    await ddbClient.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
}

async function createUsersTable() {
  if (await tableExists(USERS_TABLE)) {
    console.log(`✓ Table ${USERS_TABLE} already exists`);
    return;
  }
  await ddbClient.send(
    new CreateTableCommand({
      TableName: USERS_TABLE,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' },
      ],
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'email-index',
          KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
    })
  );
  console.log(`✓ Created table ${USERS_TABLE}`);
}

async function createDonationsTable() {
  if (await tableExists(DONATIONS_TABLE)) {
    console.log(`✓ Table ${DONATIONS_TABLE} already exists`);
    return;
  }
  await ddbClient.send(
    new CreateTableCommand({
      TableName: DONATIONS_TABLE,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [
        { AttributeName: 'donationId', AttributeType: 'S' },
        { AttributeName: 'donorId', AttributeType: 'S' },
        { AttributeName: 'status', AttributeType: 'S' },
      ],
      KeySchema: [{ AttributeName: 'donationId', KeyType: 'HASH' }],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'donorId-index',
          KeySchema: [{ AttributeName: 'donorId', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
        {
          IndexName: 'status-index',
          KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
        },
      ],
    })
  );
  console.log(`✓ Created table ${DONATIONS_TABLE}`);
}

(async () => {
  try {
    await createUsersTable();
    await createDonationsTable();
    console.log('DynamoDB setup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create tables:', err);
    process.exit(1);
  }
})();
