import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../../shared/database.js';

export const createRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
};

export const createSubscriptionOrder = async (userId, plan) => {
  // Recurring subscriptions use the Subscriptions API instead of the Orders API.
  // We rely on a Plan ID created in the Razorpay dashboard (or via create_razorpay_plan.js).
  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    throw new Error('RAZORPAY_PLAN_ID is not configured in .env');
  }
  
  const instance = createRazorpayInstance();
  const options = {
    plan_id: planId,
    total_count: 120, // 10 years by default (can be cancelled anytime)
    customer_notify: 1, // Let Razorpay email them
    notes: {
      userId: userId,
      plan: plan
    }
  };
  
  // Create a recurring subscription
  const subscription = await instance.subscriptions.create(options);
  return { subscription };
};

export const verifyPaymentSignature = async (userId, razorpay_payment_id, razorpay_subscription_id, razorpay_signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('Razorpay secret not configured');
  
  // The signature verification payload is different for subscriptions
  // payload = payment_id + '|' + subscription_id
  const payload = razorpay_payment_id + '|' + razorpay_subscription_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  if (expectedSignature !== razorpay_signature) {
    throw new Error('Invalid signature. Payment verification failed.');
  }
  
  // If valid, update the user in our database (extend by 30 days for initial payment)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: 'PREMIUM',
      subscriptionExpiresAt: expiresAt
    }
  });
  
  return true;
};
