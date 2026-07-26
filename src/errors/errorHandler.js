import { ApiError } from './index.js';
import logger from '../shared/logger.js';

/**
 * Centralized error handling middleware.
 * Converts ApiError instances to structured JSON responses.
 * Unknown errors return a generic 500 to avoid leaking internals.
 */
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    logger.warn(`API error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({ error: 'Internal Server Error' });
}

export default errorHandler;
