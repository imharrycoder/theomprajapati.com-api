import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { buildCorsOptions } from './config/cors.js';
import errorHandler from './errors/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

// Feature routers
import authRouter from './features/auth/authRoutes.js';
import userRouter from './features/users/userRoutes.js';
import blogRouter from './features/blogs/blogRoutes.js';
import serviceRouter from './features/services/serviceRoutes.js';
import videoRouter from './features/videos/videoRoutes.js';
import siteContentRouter from './features/siteContent/siteContentRoutes.js';
import subscriptionRouter from './features/subscriptions/subscriptionRoutes.js';
import adminSettingsRouter from './features/auth/adminSettingsRoutes.js';
import projectCostRouter from './features/projectCost/projectCostRoutes.js';
import analyticsRouter from './features/analytics/analyticsRoutes.js';

/**
 * Create and configure the Express application.
 * Separating app creation from listening enables testing without starting a server.
 */
function createApp() {
  const app = express();
  const corsOptions = buildCorsOptions();

  // Global middleware
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json());
  app.use(generalRateLimiter);

  // Health check — should be before feature routes for monitoring tools
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Feature routes
  app.use(authRouter);
  app.use(userRouter);
  app.use(blogRouter);
  app.use(serviceRouter);
  app.use(videoRouter);
  app.use(siteContentRouter);
  app.use(subscriptionRouter);
  app.use(adminSettingsRouter);
  app.use(projectCostRouter);
  app.use(analyticsRouter);

  // Centralized error handling — must be registered last
  app.use(errorHandler);

  return app;
}

export default createApp;
