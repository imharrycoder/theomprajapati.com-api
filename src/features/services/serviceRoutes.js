import { Router } from 'express';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from './serviceController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const serviceRouter = Router();

// Public read endpoints
serviceRouter.get('/services', listServices);
serviceRouter.get('/services/:id', getService);

// Admin-protected write endpoints
serviceRouter.post('/services', adminMiddleware, createService);
serviceRouter.put('/services/:id', adminMiddleware, updateService);
serviceRouter.delete('/services/:id', adminMiddleware, deleteService);

export default serviceRouter;
