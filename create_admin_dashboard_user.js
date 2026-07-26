import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Om@2003', 10);
  
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: { username: 'admin', password: hashedPassword }
  });

  console.log('✅ Admin Dashboard user created/updated: admin / Om@2003');
}

main().catch(console.error).finally(() => prisma.$disconnect());
