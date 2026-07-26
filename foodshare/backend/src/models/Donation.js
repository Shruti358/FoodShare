const { v4: uuidv4 } = require('uuid');
const {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const { DONATIONS_TABLE } = require('../config/tables');
const logger = require('../utils/logger');

const memoryDonationsMap = new Map();
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
 * Table schema (FoodShare_Donations):
 *   Partition key: donationId (String)
 *   GSI: donorId-index -> partition key: donorId
 *   GSI: status-index   -> partition key: status
 *   GSI: ngoId-index    -> partition key: ngoId
 *
 * Item shape:
 * {
 *   donationId, donorId, donorName, donorPhone,
 *   foodName, category, quantity, description,
 *   imageKey, imageUrl,
 *   pickupLocation, expiryTime,
 *   status: 'available' | 'accepted' | 'rejected' | 'completed' | 'cancelled',
 *   ngoId, ngoName,
 *   createdAt, updatedAt, acceptedAt, completedAt
 * }
 */

async function createDonation(data) {
  const now = new Date().toISOString();
  const donation = {
    donationId: uuidv4(),
    donorId: data.donorId,
    donorName: data.donorName,
    donorPhone: data.donorPhone || '',
    foodName: data.foodName,
    category: data.category || 'General',
    quantity: data.quantity,
    description: data.description || '',
    imageKey: data.imageKey || null,
    imageUrl: data.imageUrl || null,
    pickupLocation: data.pickupLocation,
    expiryTime: data.expiryTime || null,
    status: 'available',
    ngoId: null,
    ngoName: null,
    createdAt: now,
    updatedAt: now,
    acceptedAt: null,
    completedAt: null,
  };

  memoryDonationsMap.set(donation.donationId, donation);

  if (awsAvailable) {
    try {
      await ddbDocClient.send(
        new PutCommand({ TableName: DONATIONS_TABLE, Item: donation })
      );
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory donation store.`);
      } else {
        throw err;
      }
    }
  }

  return donation;
}

async function findDonationById(donationId) {
  if (awsAvailable) {
    try {
      const result = await ddbDocClient.send(
        new GetCommand({ TableName: DONATIONS_TABLE, Key: { donationId } })
      );
      if (result.Item) return result.Item;
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory donation store.`);
      } else {
        throw err;
      }
    }
  }

  return memoryDonationsMap.get(donationId) || null;
}

async function listAllDonations() {
  if (awsAvailable) {
    try {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: DONATIONS_TABLE }));
      return (result.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory donation store.`);
      } else {
        throw err;
      }
    }
  }

  return Array.from(memoryDonationsMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function listDonationsByDonor(donorId) {
  const all = await listAllDonations();
  return all.filter((d) => d.donorId === donorId);
}

async function listDonationsByNgo(ngoId) {
  const all = await listAllDonations();
  return all.filter((d) => d.ngoId === ngoId);
}

async function listAvailableDonations() {
  const all = await listAllDonations();
  return all.filter((d) => d.status === 'available');
}

async function updateDonation(donationId, updates) {
  const now = new Date().toISOString();
  const existing = memoryDonationsMap.get(donationId) || (await findDonationById(donationId)) || {};
  const updated = { ...existing, ...updates, updatedAt: now };
  memoryDonationsMap.set(donationId, updated);

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
          TableName: DONATIONS_TABLE,
          Key: { donationId },
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
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory donation store.`);
      } else {
        throw err;
      }
    }
  }

  return updated;
}

async function deleteDonation(donationId) {
  memoryDonationsMap.delete(donationId);

  if (awsAvailable) {
    try {
      await ddbDocClient.send(new DeleteCommand({ TableName: DONATIONS_TABLE, Key: { donationId } }));
    } catch (err) {
      if (isAwsError(err)) {
        awsAvailable = false;
        logger.warn(`DynamoDB unavailable (${err.message}). Using in-memory donation store.`);
      } else {
        throw err;
      }
    }
  }
}

module.exports = {
  createDonation,
  findDonationById,
  listAllDonations,
  listDonationsByDonor,
  listDonationsByNgo,
  listAvailableDonations,
  updateDonation,
  deleteDonation,
};

