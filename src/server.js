import { loadEnvironment, getOptionalEnv } from './config/environment.js';
import { DEFAULT_PORT } from './config/constants.js';
import logger from './shared/logger.js';
import createApp from './app.js';

// Load environment variables before anything else
loadEnvironment();

const app = createApp();
const port = getOptionalEnv('PORT', String(DEFAULT_PORT));

app.listen(port, () => {
  logger.info(`API server running on http://localhost:${port}`);
});
