/**
 * Centralized logger — replaces raw console.log/console.error throughout
 * the API. Debug-level logging is disabled in production.
 *
 * Levels: debug, info, warn, error
 */

const isProduction = process.env.NODE_ENV === 'production';

function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (data !== undefined) {
    return `${base} ${JSON.stringify(data)}`;
  }

  return base;
}

const logger = {
  debug(message, data) {
    if (!isProduction) {
      console.debug(formatMessage('debug', message, data));
    }
  },

  info(message, data) {
    console.info(formatMessage('info', message, data));
  },

  warn(message, data) {
    console.warn(formatMessage('warn', message, data));
  },

  error(message, data) {
    console.error(formatMessage('error', message, data));
  },
};

export default logger;
