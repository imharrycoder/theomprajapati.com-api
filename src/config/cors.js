import { getOptionalEnv } from './environment.js';

/**
 * CORS configuration — extracted from the monolithic index.js.
 * Origins are loaded from environment or fall back to safe defaults.
 */

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'https://theomprajapati.com',
  'https://www.theomprajapati.com',
  'https://admin.theomprajapati.com',
];

function getAllowedOrigins() {
  const envOrigins = getOptionalEnv('CORS_ORIGINS');

  if (envOrigins) {
    return envOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return DEFAULT_CORS_ORIGINS;
}

export function buildCorsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
}
