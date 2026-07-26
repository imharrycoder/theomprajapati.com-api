import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../../errors/index.js';
import { getOptionalEnv } from '../../config/environment.js';
import { ADMIN_JWT_EXPIRY, BCRYPT_SALT_ROUNDS } from '../../config/constants.js';
import { signToken } from '../../utils/jwt.js';
import { generateOtp, storeOtp } from './authService.js';
import { validateSendOtpPayload } from './authValidator.js';
import logger from '../../shared/logger.js';
import prisma from '../../shared/database.js';

/**
 * POST /admin/login
 * Authenticate admin user and return a signed JWT token.
 */
export async function adminLogin(req, res) {
  const { username, password } = req.body;
  
  let adminUser = await prisma.adminUser.findUnique({
    where: { username }
  });

  if (!adminUser) {
    // Fallback to environment variables or defaults if DB is empty for this username
    const fallbackUser = getOptionalEnv('ADMIN_USER', 'admin');
    const fallbackPass = getOptionalEnv('ADMIN_PASS', 'Om@2003');

    if (username === fallbackUser && password === fallbackPass) {
      // Create the admin user in the DB immediately so future logins use DB
      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
      adminUser = await prisma.adminUser.create({
        data: {
          username,
          password: hashedPassword
        }
      });
      logger.info(`Initialized admin user '${username}' in database from fallback credentials.`);
    } else {
      throw new AuthenticationError('Invalid credentials');
    }
  } else {
    // Verify against DB password
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }
  }

  const token = signToken({ role: 'admin', username }, ADMIN_JWT_EXPIRY);

  return res.json({ token, message: 'Admin login successful' });
}

/**
 * POST /auth/send-otp
 * Generate and store an OTP for the given email or contact.
 * OTP is only returned in the response during development.
 */
export async function sendOtp(req, res) {
  const { email, contact } = validateSendOtpPayload(req.body);

  const key = email || contact;
  const otp = generateOtp();
  storeOtp(key, otp);

  logger.info(`OTP generated for ${key}`);

  const response = { message: 'OTP sent successfully' };

  // Only include OTP in response during development
  if (process.env.NODE_ENV !== 'production') {
    response.otp = otp;
  }

  return res.json(response);
}
