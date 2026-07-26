const { v4: uuidv4 } = require('uuid');
const {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const { USERS_TABLE } = require('../config/tables');
const logger = require('../utils/logger');

// In-memory fallback store for offline/local development without AWS DynamoDB
const memoryUsersMap = new Map();
let awsAvailable = true;

function isAwsError(err) {
  if (!err) return false;
  const name = err.name || '';
  const msg = (err.message || '').toLowerCase();
  return (
    name === 'ResourceNotFoundException' ||
    name === 'CredentialsProviderError' ||
    name === 'UnrecognizedClientException' ||
    name === 'ExpiredTokenException' ||
    name === 'AccessDeniedException' ||
    msg.includes('credentials') ||
    msg.includes('table') ||
    msg.includes('accesskey')
  );
}

/**
 * Table schema (FoodShare_Users):
 *   Partition key: userId (String)
 *   GSI: email-index -> partition key: email (String)
 *
 * Item shape:
 * {
 *   userId, name, email, passwordHash, role ('donor'|'ngo'|'admin'),
 *   phone, address, organizationName (for NGOs), status ('active'|'blocked'),
 *   createdAt, updatedAt
 * }
 */

async function createUser({ name, email, passwordHash, role, phone, address, organizationName }) {
  const now = new Date().toISOString();
  const user = {
    userId: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role, // 'donor' | 'ngo' | 'admin'
    phone: phone || '',
    address: address || '',
    organizationName: organizationName || '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  memoryUsersMap.set(user.userId, user);

  if (awsAvailable) {
    try {
      await ddbDocClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: user,
          ConditionExpression: 'attribute_not_exists(userId)',
        })
      );
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }

  return user;
}

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  if (awsAvailable) {
    try {
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: USERS_TABLE,
          IndexName: 'email-index',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: { ':email': normalizedEmail },
          Limit: 1,
        })
      );
      if (result.Items && result.Items[0]) return result.Items[0];
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }

  for (const user of memoryUsersMap.values()) {
    if (user.email === normalizedEmail) return user;
  }
  return null;
}

async function findUserById(userId) {
  if (awsAvailable) {
    try {
      const result = await ddbDocClient.send(
        new GetCommand({ TableName: USERS_TABLE, Key: { userId } })
      );
      if (result.Item) return result.Item;
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }

  return memoryUsersMap.get(userId) || null;
}

async function listUsers({ role } = {}) {
  if (awsAvailable) {
    try {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: USERS_TABLE }));
      let items = result.Items || [];
      if (role) items = items.filter((u) => u.role === role);
      return items;
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }

  let items = Array.from(memoryUsersMap.values());
  if (role) items = items.filter((u) => u.role === role);
  return items;
}

async function updateUser(userId, updates) {
  const now = new Date().toISOString();
  const existing = memoryUsersMap.get(userId) || (await findUserById(userId)) || {};
  const updatedUser = { ...existing, ...updates, updatedAt: now };
  memoryUsersMap.set(userId, updatedUser);

  if (awsAvailable) {
    try {
      const fields = { ...updates, updatedAt: now };
      const names = {};
      const values = {};
      const setParts = [];

      Object.entries(fields).forEach(([key, value], idx) => {
        const nameKey = `#f${idx}`;
        const valueKey = `:v${idx}`;
        names[nameKey] = key;
        values[valueKey] = value;
        setParts.push(`${nameKey} = ${valueKey}`);
      });

      const result = await ddbDocClient.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: { userId },
          UpdateExpression: `SET ${setParts.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: 'ALL_NEW',
        })
      );
      return result.Attributes;
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }

  return updatedUser;
}

async function deleteUser(userId) {
  memoryUsersMap.delete(userId);

  if (awsAvailable) {
    try {
      await ddbDocClient.send(new DeleteCommand({ TableName: USERS_TABLE, Key: { userId } }));
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory user store.`);
      } else {
        throw err;
      }
    }
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUser,
  deleteUser,
  sanitizeUser,
};

