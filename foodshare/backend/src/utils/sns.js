require('dotenv').config();
const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient } = require('../config/aws');
const logger = require('./logger');

const TOPIC_ARN = process.env.SNS_TOPIC_ARN;

/**
 * Publishes a notification event to the shared SNS topic.
 * Subscribers (email/SMS/Lambda) fan out from here.
 * Never throws — notification failures must not block the main flow.
 */
async function publishNotification(subject, message, attributes = {}) {
  if (!TOPIC_ARN) {
    logger.warn('SNS_TOPIC_ARN not configured, skipping notification', { subject });
    return;
  }
  try {
    const messageAttributes = {};
    Object.entries(attributes).forEach(([k, v]) => {
      messageAttributes[k] = { DataType: 'String', StringValue: String(v) };
    });

    await snsClient.send(
      new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject: subject.substring(0, 100),
        Message: message,
        MessageAttributes: messageAttributes,
      })
    );
    logger.info('SNS notification published', { subject });
  } catch (err) {
    logger.error('SNS publish failed', { subject, error: err.message });
  }
}

const notify = {
  newDonation: (donation) =>
    publishNotification(
      'New Food Donation Available',
      `A new donation "${donation.foodName}" (${donation.quantity}) was posted by ${donation.donorName}. ` +
        `Pickup location: ${donation.pickupLocation}.`,
      { type: 'NEW_DONATION', donationId: donation.donationId }
    ),

  donationAccepted: (donation) =>
    publishNotification(
      'Your Donation Was Accepted',
      `Good news! Your donation "${donation.foodName}" was accepted by ${donation.ngoName}. ` +
        `They will coordinate pickup with you.`,
      { type: 'DONATION_ACCEPTED', donationId: donation.donationId }
    ),

  donationRejected: (donation) =>
    publishNotification(
      'Donation Update',
      `Your donation "${donation.foodName}" was declined by an NGO. It is visible to other NGOs again.`,
      { type: 'DONATION_REJECTED', donationId: donation.donationId }
    ),

  donationCompleted: (donation) =>
    publishNotification(
      'Donation Marked as Completed',
      `The donation "${donation.foodName}" has been marked as picked up / completed. Thank you for reducing food waste!`,
      { type: 'DONATION_COMPLETED', donationId: donation.donationId }
    ),

  userRegistered: (user) =>
    publishNotification(
      'New User Registered on FoodShare',
      `A new ${user.role} account was created: ${user.name} (${user.email}).`,
      { type: 'USER_REGISTERED', role: user.role }
    ),
};

module.exports = { publishNotification, notify };
