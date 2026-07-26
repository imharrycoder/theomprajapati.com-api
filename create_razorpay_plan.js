import dotenv from 'dotenv';
import Razorpay from 'razorpay';
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

async function createPlan() {
  try {
    const plan = await instance.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Premium Access (99 INR/month)',
        amount: 9900,
        currency: 'INR',
        description: 'AutoPay Subscription for Premium Access on The Om Prajapati'
      },
      notes: {
        type: 'subscription'
      }
    });

    console.log('✅ Plan Created Successfully!');
    console.log('====================================');
    console.log(`Plan ID: ${plan.id}`);
    console.log('====================================');
    console.log('Please copy the Plan ID above and add it to your .env file as:');
    console.log(`RAZORPAY_PLAN_ID=${plan.id}`);
    
  } catch (err) {
    console.error('❌ Failed to create plan:', err);
  }
}

createPlan();
