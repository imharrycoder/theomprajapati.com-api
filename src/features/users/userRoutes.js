import { Router } from 'express';
import { handleRegister, handleLogin, handleGetCurrentUser } from './userController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const userRouter = Router();

// Rate-limited auth endpoints
userRouter.post('/users/register', authRateLimiter, handleRegister);
userRouter.post('/users/login', authRateLimiter, handleLogin);

// Protected endpoint
userRouter.get('/users/me', authMiddleware, handleGetCurrentUser);

export default userRouter;
