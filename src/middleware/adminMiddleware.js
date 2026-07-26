import { AuthenticationError } from '../errors/index.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware that verifies an admin JWT token.
 * Use on all admin write operations (POST/PUT/DELETE on content routes).
 */
async function adminMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new AuthenticationError('Admin authentication required');
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'admin') {
    throw new AuthenticationError('Invalid or expired admin token');
  }

  req.admin = decoded;
  next();
}

export default adminMiddleware;
