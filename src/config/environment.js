import dotenv from 'dotenv';

/**
 * Load environment variables from .env.local (priority) or .env fallback.
 * Validates that required variables are present for the application to run.
 */
function loadEnvironment() {
  const localEnvResult = dotenv.config({ path: '.env.local', override: true });

  if (localEnvResult.error) {
    dotenv.config({ override: true });
  }
}

function getRequiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getOptionalEnv(key, defaultValue = '') {
  return process.env[key] || defaultValue;
}

export { loadEnvironment, getRequiredEnv, getOptionalEnv };
