/**
 * Central AWS SDK v3 client configuration.
 * Credentials are resolved automatically by the SDK's default provider chain:
 *  - On EC2: the attached IAM Role (no keys needed, recommended for production)
 *  - Locally: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from .env
 */
require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { CloudWatchLogsClient } = require('@aws-sdk/client-cloudwatch-logs');

const region = process.env.AWS_REGION || 'ap-south-1';

const baseConfig = { region };

// Only pass explicit credentials when provided (local dev).
// On EC2 with an IAM Role attached, leave this undefined so the SDK
// picks up the instance role automatically.
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  baseConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const ddbClient = new DynamoDBClient(baseConfig);
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const s3Client = new S3Client(baseConfig);
const snsClient = new SNSClient(baseConfig);
const cwLogsClient = new CloudWatchLogsClient(baseConfig);

module.exports = {
  region,
  ddbClient,
  ddbDocClient,
  s3Client,
  snsClient,
  cwLogsClient,
};
