import jwt from 'jsonwebtoken';
import { getOptionalEnv } from '../config/environment.js';
import { DEFAULT_JWT_SECRET } from '../config/constants.js';

/**
 * Get the JWT secret from environment or fall back to the dev default.
 * In production, JWT_SECRET MUST be set as an environment variable.
 */
function getJwtSecret() {
  return getOptionalEnv('JWT_SECRET', DEFAULT_JWT_SECRET);
}

/**
 * Sign a JWT token with the given payload and expiry.
 */
export function signToken(payload, expiresIn) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * Verify and decode a JWT token. Returns the decoded payload
 * or null if the token is invalid/expired.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}
