require('dotenv').config();
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { s3Client, region } = require('../config/aws');
const logger = require('./logger');

const BUCKET = process.env.S3_BUCKET_NAME || 'foodshare-food-images';
let s3Available = true;

/**
 * Uploads a food image buffer (from multer memoryStorage) to S3
 * under donations/<uuid>.<ext> and returns the public object URL.
 * Fallbacks to data URL / default placeholder if S3 is unavailable.
 */
async function uploadFoodImage(fileBuffer, mimeType, originalName) {
  const ext = (originalName ? originalName.split('.').pop() : 'jpg').toLowerCase();
  const key = `donations/${uuidv4()}.${ext}`;

  if (s3Available) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        })
      );

      logger.info('Uploaded image to S3', { key });
      const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
      return { key, url };
    } catch (err) {
      s3Available = false;
      logger.warn(`S3 upload failed (${err.message}). Falling back to local data/placeholder URL.`);
    }
  }

  const base64 = fileBuffer ? fileBuffer.toString('base64') : '';
  const url = mimeType && base64 ? `data:${mimeType};base64,${base64}` : `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600`;
  return { key, url };
}

async function deleteFoodImage(key) {
  if (!key || !s3Available) return;
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    logger.info('Deleted image from S3', { key });
  } catch (err) {
    s3Available = false;
    logger.error('Failed to delete S3 object', { key, error: err.message });
  }
}

/** Optional: generate a temporary signed URL for private buckets. */
async function getSignedImageUrl(key, expiresInSeconds = 3600) {
  if (!s3Available) return null;
  try {
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  } catch (err) {
    return null;
  }
}

module.exports = { uploadFoodImage, deleteFoodImage, getSignedImageUrl, BUCKET };

