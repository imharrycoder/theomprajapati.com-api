import { createSubscriptionOrder, verifyPaymentSignature } from './subscriptionService.js';
import prisma from '../../shared/database.js';

export const createSubscription = async (req, res) => {
  const { plan } = req.body;
  const userId = req.user.id;

  if (!plan || !['PREMIUM', 'EARLY_JOINER', 'STANDARD'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const { subscription } = await createSubscriptionOrder(userId, plan);
    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription', details: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  try {
    await verifyPaymentSignature(userId, razorpay_payment_id, razorpay_subscription_id, razorpay_signature);
    res.json({ success: true, message: 'Payment verified and subscription activated' });
  } catch (error) {
    res.status(400).json({ error: 'Payment verification failed', details: error.message });
  }
};

export const razorpayWebhook = async (req, res) => {
  // To handle auto-renewal, Razorpay sends a webhook when subscription is charged
  // In a real app, verify the webhook signature using crypto
  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === 'subscription.charged') {
      const subscriptionInfo = payload.subscription.entity;
      const paymentInfo = payload.payment.entity;
      
      // Look up user from notes if you passed it during subscription creation
      const userId = subscriptionInfo.notes.userId;
      
      if (userId) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        await prisma.user.update({
          where: { id: parseInt(userId, 10) },
          data: {
            subscriptionExpiresAt: expiresAt
          }
        });
      }
    }
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true }
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const isActive = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
  
  res.json({
    plan: user.subscriptionPlan,
    expiresAt: user.subscriptionExpiresAt,
    isActive: !!isActive
  });
};
