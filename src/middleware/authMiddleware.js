import { AuthenticationError } from '../errors/index.js';
import prisma from '../shared/database.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware that verifies a user's JWT Bearer token.
 * Decodes the token, loads the user from DB, and attaches to `req.user`.
 */
async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new AuthenticationError('Missing auth token');
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'user') {
    throw new AuthenticationError('Invalid or expired auth token');
  }

  const user = await prisma.user.findUnique({ where: { email: decoded.email } });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  req.user = user;
  next();
}

export default authMiddleware;
