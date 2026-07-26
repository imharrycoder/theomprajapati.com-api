import express from 'express';
import { createSubscription, verifyPayment, getSubscriptionStatus, razorpayWebhook } from './subscriptionController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Webhook from Razorpay (no auth middleware because Razorpay calls this)
router.post('/api/webhooks/razorpay', express.json(), razorpayWebhook);

// All subscription routes require user to be logged in
router.post('/api/subscriptions/create-subscription', authMiddleware, createSubscription);
router.post('/api/subscriptions/verify-payment', authMiddleware, verifyPayment);
router.get('/api/subscriptions/status', authMiddleware, getSubscriptionStatus);

export default router;
