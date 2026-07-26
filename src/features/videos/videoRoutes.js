import { Router } from 'express';
import {
  listFeaturedVideos,
  listVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
} from './videoController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const videoRouter = Router();

// Public read endpoints
videoRouter.get('/videos/featured', listFeaturedVideos);
videoRouter.get('/videos', listVideos);
videoRouter.get('/videos/:id', getVideo);

// Admin-protected write endpoints
videoRouter.post('/videos', adminMiddleware, createVideo);
videoRouter.put('/videos/:id', adminMiddleware, updateVideo);
videoRouter.delete('/videos/:id', adminMiddleware, deleteVideo);

export default videoRouter;
