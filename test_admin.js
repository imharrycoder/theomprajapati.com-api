import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.adminUser.findMany();
  const user = await prisma.user.findMany();
  console.log("Admin Users:", admin);
  console.log("Users:", user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
