import { Router } from 'express';
import adminMiddleware from '../../middleware/adminMiddleware.js';
import {
  checkConfig,
  getAnalyticsData,
  getSearchConsoleData,
  getPageSpeedInsights,
} from './analyticsController.js';

const analyticsRouter = Router();

// All routes are protected by adminMiddleware
analyticsRouter.get('/admin/analytics/config', adminMiddleware, checkConfig);
analyticsRouter.get('/admin/analytics/traffic', adminMiddleware, getAnalyticsData);
analyticsRouter.get('/admin/analytics/search', adminMiddleware, getSearchConsoleData);
analyticsRouter.get('/admin/analytics/pagespeed', adminMiddleware, getPageSpeedInsights);

export default analyticsRouter;
