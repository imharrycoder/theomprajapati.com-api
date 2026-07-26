import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'the om'
      }
    }
  });

  if (user) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: 'PREMIUM',
        subscriptionExpiresAt: expiresAt
      }
    });
    console.log(`Successfully upgraded user: ${user.email}`);
  } else {
    console.log('User not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
