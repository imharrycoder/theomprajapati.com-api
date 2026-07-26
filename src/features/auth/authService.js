import { OTP_EXPIRY_MS, OTP_MIN_VALUE, OTP_RANGE } from '../../config/constants.js';

/**
 * In-memory OTP store. In production, this should be replaced
 * with Redis or a database-backed store for multi-instance support.
 */
const otpStore = new Map();

/**
 * Generate a random 6-digit OTP string.
 */
export function generateOtp() {
  return String(Math.floor(OTP_MIN_VALUE + Math.random() * OTP_RANGE));
}

/**
 * Store an OTP for a given key (email or contact) with expiry.
 */
export function storeOtp(key, otp) {
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  otpStore.set(key, { otp, expiresAt });
}

/**
 * Verify a candidate OTP against the stored value.
 * Deletes the OTP after successful verification (single-use).
 * Returns false for expired or missing OTPs.
 */
export function verifyOtp(key, candidate) {
  const entry = otpStore.get(key);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  const isValid = entry.otp === candidate;

  if (isValid) {
    otpStore.delete(key);
  }

  return isValid;
}
