import { Router } from 'express';
import { updateAdminCredentials } from './adminSettingsController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const adminSettingsRouter = Router();

adminSettingsRouter.put('/admin/credentials', adminMiddleware, updateAdminCredentials);

export default adminSettingsRouter;
