/**
 * Named constants — replaces all magic numbers and hardcoded values
 * throughout the API codebase.
 */

/** OTP expires after 5 minutes */
export const OTP_EXPIRY_MS = 5 * 60 * 1000;

/** Number of digits in a generated OTP */
export const OTP_LENGTH = 6;

/** Minimum value for OTP generation (ensures 6 digits) */
export const OTP_MIN_VALUE = 100000;

/** Range for OTP generation */
export const OTP_RANGE = 900000;

/** bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 10;

/** Default API server port */
export const DEFAULT_PORT = 5000;

/** Maximum number of featured videos to return */
export const FEATURED_VIDEOS_LIMIT = 3;

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 10;

/** Maximum pagination page size */
export const MAX_PAGE_SIZE = 100;

/** JWT token expiry for admin sessions */
export const ADMIN_JWT_EXPIRY = '24h';

/** JWT token expiry for user sessions */
export const USER_JWT_EXPIRY = '7d';

/** Default JWT secret fallback (only for dev — production must set JWT_SECRET env) */
export const DEFAULT_JWT_SECRET = 'dev-secret-change-in-production';

/** Rate limit window for auth endpoints (15 minutes) */
export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Maximum auth requests per window */
export const AUTH_RATE_LIMIT_MAX = 20;

/** Rate limit window for general API endpoints (1 minute) */
export const GENERAL_RATE_LIMIT_WINDOW_MS = 60 * 1000;

/** Maximum general API requests per window */
export const GENERAL_RATE_LIMIT_MAX = 100;
