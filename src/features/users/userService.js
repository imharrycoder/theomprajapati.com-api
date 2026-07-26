import bcrypt from 'bcryptjs';
import prisma from '../../shared/database.js';
import { BadRequestError, AuthenticationError, ConflictError } from '../../errors/index.js';
import { verifyOtp } from '../auth/authService.js';
import { BCRYPT_SALT_ROUNDS, USER_JWT_EXPIRY } from '../../config/constants.js';
import { signToken } from '../../utils/jwt.js';

/**
 * Register a new user after OTP verification.
 * Returns the created user record and a signed JWT token.
 */
export async function registerUser(payload) {
  const { email, password, name, contact, instaId, city, state, profession, location, device, otp } = payload;

  if (!email || !password || !name || !contact || !city || !state || !profession) {
    throw new BadRequestError('All required registration fields must be provided');
  }

  if (!otp || !verifyOtp(email || contact, otp)) {
    throw new BadRequestError('Invalid or expired OTP');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      contact,
      instaId: instaId || null,
      city,
      state,
      profession,
      location: location || null,
      device: device || null,
      token: signToken({ role: 'user', email }, USER_JWT_EXPIRY),
      emailVerified: true,
      lastLogin: new Date(),
    },
  });

  return user;
}

/**
 * Authenticate a user by email and password.
 * Issues a new JWT token on each login.
 */
export async function loginUser(payload) {
  const { email, password, location, device } = payload;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = signToken({ role: 'user', email, userId: user.id }, USER_JWT_EXPIRY);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      token,
      location: location || user.location,
      device: device || user.device,
      lastLogin: new Date(),
    },
  });

  return updatedUser;
}
