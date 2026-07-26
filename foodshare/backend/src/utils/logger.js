/**
 * Lightweight logger that writes to stdout (captured by CloudWatch Agent
 * when running on EC2) AND pushes structured events directly to
 * Amazon CloudWatch Logs via the SDK if AWS credentials are available.
 */
require('dotenv').config();
const {
  PutLogEventsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');
const { cwLogsClient } = require('../config/aws');

const LOG_GROUP = process.env.CW_LOG_GROUP || '/foodshare/backend';
const LOG_STREAM = process.env.CW_LOG_STREAM || 'app-logs';

let sequenceToken = null;
let initialized = false;
let initializing = null;
let cwDisabled = false;

function disableCloudWatch(reason) {
  if (!cwDisabled) {
    cwDisabled = true;
    console.warn(`[CloudWatch] Logging disabled (${reason}). Continuing with console-only logs.`);
  }
}

/**
 * Ensures log group and stream exist and retrieves sequence token.
 * Disables CloudWatch logging if credentials or network are unavailable.
 */
async function ensureLogStream() {
  if (cwDisabled) return false;
  if (initialized) return true;
  if (initializing) return initializing;

  initializing = (async () => {
    try {
      // 1. Create Log Group
      try {
        await cwLogsClient.send(new CreateLogGroupCommand({ logGroupName: LOG_GROUP }));
      } catch (err) {
        if (err.name !== 'ResourceAlreadyExistsException') {
          disableCloudWatch(err.message || 'AWS credentials not available');
          return false;
        }
      }

      if (cwDisabled) return false;

      // 2. Create Log Stream
      try {
        await cwLogsClient.send(
          new CreateLogStreamCommand({ logGroupName: LOG_GROUP, logStreamName: LOG_STREAM })
        );
      } catch (err) {
        if (err.name !== 'ResourceAlreadyExistsException') {
          disableCloudWatch(err.message || 'AWS credentials not available');
          return false;
        }
      }

      if (cwDisabled) return false;

      // 3. Describe Log Stream
      try {
        const desc = await cwLogsClient.send(
          new DescribeLogStreamsCommand({
            logGroupName: LOG_GROUP,
            logStreamNamePrefix: LOG_STREAM,
          })
        );
        const stream = desc.logStreams?.find((s) => s.logStreamName === LOG_STREAM);
        sequenceToken = stream?.uploadSequenceToken || null;
      } catch (err) {
        disableCloudWatch(err.message || 'AWS credentials not available');
        return false;
      }

      initialized = true;
      return true;
    } catch (err) {
      disableCloudWatch(err.message || 'Failed to initialize CloudWatch stream');
      return false;
    } finally {
      initializing = null;
    }
  })();

  return initializing;
}

async function pushToCloudWatch(level, message, meta) {
  if (cwDisabled) return;

  try {
    const isReady = await ensureLogStream();
    if (!isReady || cwDisabled) return;

    const logEvent = {
      timestamp: Date.now(),
      message: JSON.stringify({ level, message, meta, ts: new Date().toISOString() }),
    };

    const command = new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [logEvent],
      sequenceToken: sequenceToken || undefined,
    });

    const res = await cwLogsClient.send(command);
    if (res && res.nextSequenceToken) {
      sequenceToken = res.nextSequenceToken;
    }
  } catch (err) {
    if (err.name === 'InvalidSequenceTokenException' || err.name === 'DataAlreadyAcceptedException') {
      if (err.expectedSequenceToken) {
        sequenceToken = err.expectedSequenceToken;
      } else {
        initialized = false;
      }
    } else {
      disableCloudWatch(err.message || 'CloudWatch push failed');
    }
  }
}

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
    pushToCloudWatch('INFO', message, meta).catch(() => {});
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
    pushToCloudWatch('WARN', message, meta).catch(() => {});
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, meta);
    pushToCloudWatch('ERROR', message, meta).catch(() => {});
  },
};

module.exports = logger;

