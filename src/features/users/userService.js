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

  // Check if contact number is already taken
  const existingContact = await prisma.user.findUnique({ where: { contact } });
  if (existingContact) {
    throw new ConflictError('This phone number is already registered');
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
 * Authenticate a user by email OR phone number and password.
 * Issues a new JWT token on each login.
 */
export async function loginUser(payload) {
  const { email, password, location, device } = payload;

  if (!email || !password) {
    throw new BadRequestError('Email/phone and password are required');
  }

  // Try to find by email first, then by contact (phone number)
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Attempt phone number login — `email` field may contain a phone number
    user = await prisma.user.findUnique({ where: { contact: email } });
  }

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = signToken({ role: 'user', email: user.email, userId: user.id }, USER_JWT_EXPIRY);

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

/**
 * Update user profile (name, email, profilePhoto).
 */
export async function updateUserProfile(userId, payload) {
  const { name, email, profilePhoto } = payload;

  const updateData = {};

  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  if (email && email.trim()) {
    // Check if new email is already taken by another user
    const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (existing && existing.id !== userId) {
      throw new ConflictError('This email is already taken');
    }
    updateData.email = email.trim();
  }

  if (profilePhoto !== undefined) {
    updateData.profilePhoto = profilePhoto; // base64 string or null to remove
  }

  if (Object.keys(updateData).length === 0) {
    throw new BadRequestError('No fields to update');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
}

/**
 * Change user password. Requires old password verification.
 */
export async function changeUserPassword(userId, oldPassword, newPassword) {
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Both current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new BadRequestError('New password must be at least 6 characters');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);

  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
}
