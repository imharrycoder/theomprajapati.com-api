import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('TheOm123!', 10);
  
  // Extend subscription by 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  const user = await prisma.user.upsert({
    where: { email: 'theomprajapati@gmail.com' },
    update: {
      password: hashedPassword,
      subscriptionPlan: 'PREMIUM',
      subscriptionExpiresAt: expiresAt,
      name: 'the om'
    },
    create: {
      name: 'the om',
      email: 'theomprajapati@gmail.com', // Dummy email if we don't know the real one, but usually auth matches email
      contact: '9924115353',
      city: 'Ahmedabad',
      state: 'Gujarat',
      profession: 'Creator',
      password: hashedPassword,
      subscriptionPlan: 'PREMIUM',
      subscriptionExpiresAt: expiresAt
    }
  });

  console.log('✅ Admin user created/updated successfully:', user.email);
  console.log('Use password: TheOm123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
