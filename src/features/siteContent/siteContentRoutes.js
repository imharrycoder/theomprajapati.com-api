import { Router } from 'express';
import { getSiteContent, updateSiteContent } from './siteContentController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const siteContentRouter = Router();

// Public read endpoint
siteContentRouter.get('/site-content', getSiteContent);

// Admin-protected write endpoint
siteContentRouter.put('/site-content', adminMiddleware, updateSiteContent);

export default siteContentRouter;
