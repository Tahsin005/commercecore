import crypto from 'node:crypto';
import env from '../config/env.js';
import logger from './logger.js';

// SHA-256 hash utility for Meta CAPI PII data (email, phone, etc.)
export function hashForMeta(value) {
  if (!value) return undefined;
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
}

// Helper to normalize and hash phone numbers for Meta
export function hashPhoneForMeta(phone) {
  if (!phone) return undefined;
  // Remove non-digit characters
  let cleaned = String(phone).replace(/\D/g, '');
  // Normalize BD country code if needed (e.g. 017... -> 88017...)
  if (cleaned.startsWith('01')) {
    cleaned = `88${cleaned}`;
  }
  return hashForMeta(cleaned);
}

/**
 * Generic function to send standard/custom conversion events to Meta Conversions API (CAPI)
 */
export async function sendMetaConversionEvent({
  eventName,
  eventId,
  userData = {},
  customData = {},
  eventSourceUrl,
  actionSource = 'website',
}) {
  const pixelId = env.fbPixelId;
  const accessToken = env.fbCapiAccessToken;

  if (!pixelId || !accessToken) {
    // CAPI is not configured yet, skip silently
    return null;
  }

  const userPayload = {};
  if (userData.email && !userData.email.startsWith('guest_')) {
    userPayload.em = hashForMeta(userData.email);
  }
  if (userData.phone) {
    userPayload.ph = hashPhoneForMeta(userData.phone);
  }
  if (userData.name) {
    const parts = userData.name.trim().split(/\s+/);
    if (parts.length > 0) userPayload.fn = hashForMeta(parts[0]);
    if (parts.length > 1) userPayload.ln = hashForMeta(parts.slice(1).join(' '));
  }
  if (userData.userId) {
    userPayload.external_id = hashForMeta(userData.userId);
  }

  const eventObject = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: actionSource,
    event_source_url: eventSourceUrl,
    user_data: userPayload,
    custom_data: customData,
  };

  const payload = {
    data: [eventObject],
  };

  if (env.fbTestEventCode) {
    payload.test_event_code = env.fbTestEventCode;
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      logger.warn(`Meta CAPI warning for ${eventName}: ${JSON.stringify(result.error || result)}`);
      return null;
    }

    logger.info(`Meta CAPI event sent successfully: ${eventName} (EventID: ${eventId || 'none'}, Events Received: ${result.events_received})`);
    return result;
  } catch (err) {
    // Never let a tracking failure break core business operations
    logger.warn(`Meta CAPI send failed for ${eventName}: ${err.message}`);
    return null;
  }
}
