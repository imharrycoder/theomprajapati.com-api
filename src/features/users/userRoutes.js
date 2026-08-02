import { Router } from 'express';
import { handleRegister, handleLogin, handleGetCurrentUser, handleGetUsers, handleUpdateUserSubscription, handleUpdateProfile, handleChangePassword } from './userController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const userRouter = Router();

// Rate-limited auth endpoints
userRouter.post('/users/register', authRateLimiter, handleRegister);
userRouter.post('/users/login', authRateLimiter, handleLogin);

// Protected user endpoints
userRouter.get('/users/me', authMiddleware, handleGetCurrentUser);
userRouter.put('/users/profile', authMiddleware, handleUpdateProfile);
userRouter.put('/users/password', authMiddleware, handleChangePassword);

// Admin endpoints
userRouter.get('/admin/users', adminMiddleware, handleGetUsers);
userRouter.put('/admin/users/:id/subscription', adminMiddleware, handleUpdateUserSubscription);

export default userRouter;
