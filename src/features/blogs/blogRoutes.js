import { Router } from 'express';
import {
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './blogController.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const blogRouter = Router();

// Public read endpoints
blogRouter.get('/blogPosts', listBlogPosts);
blogRouter.get('/blogPosts/:slug', getBlogPost);

// Admin-protected write endpoints
blogRouter.post('/blogPosts', adminMiddleware, createBlogPost);
blogRouter.put('/blogPosts/:id', adminMiddleware, updateBlogPost);
blogRouter.delete('/blogPosts/:id', adminMiddleware, deleteBlogPost);

export default blogRouter;
