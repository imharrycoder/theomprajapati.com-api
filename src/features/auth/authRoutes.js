import { Router } from 'express';
import { adminLogin, sendOtp } from './authController.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';

const authRouter = Router();

// Rate-limited auth endpoints to prevent brute-force attacks
authRouter.post('/admin/login', authRateLimiter, adminLogin);
authRouter.post('/auth/send-otp', authRateLimiter, sendOtp);

export default authRouter;
