import bcrypt from 'bcryptjs';
import { AuthenticationError, BadRequestError } from '../../errors/index.js';
import { BCRYPT_SALT_ROUNDS, ADMIN_JWT_EXPIRY } from '../../config/constants.js';
import { signToken } from '../../utils/jwt.js';
import prisma from '../../shared/database.js';
import logger from '../../shared/logger.js';

export async function updateAdminCredentials(req, res) {
  const { currentPassword, newUsername, newPassword } = req.body;
  const username = req.user?.username; // From adminMiddleware

  if (!currentPassword || !newUsername || !newPassword) {
    throw new BadRequestError('currentPassword, newUsername, and newPassword are required');
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { username }
  });

  if (!adminUser) {
    throw new AuthenticationError('Admin user not found in database');
  }

  const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
  if (!isMatch) {
    throw new AuthenticationError('Incorrect current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: {
      username: newUsername,
      password: hashedPassword
    }
  });

  logger.info(`Admin credentials updated for user '${username}'. New username: '${newUsername}'`);

  // Sign a new token since the username changed
  const token = signToken({ role: 'admin', username: newUsername }, ADMIN_JWT_EXPIRY);

  return res.json({ token, message: 'Credentials updated successfully' });
}
