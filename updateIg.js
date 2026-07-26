import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });
const prisma = new PrismaClient();

async function main() {
  const content = await prisma.siteContent.findUnique({ where: { key: 'home' } });
  if (content) {
    const data = JSON.parse(content.value);
    if (data.featuredVideos) {
      data.featuredVideos.instagramUrl = 'https://www.instagram.com/the.omprajapati';
    }
    await prisma.siteContent.update({
      where: { key: 'home' },
      data: { value: JSON.stringify(data) }
    });
    console.log('Updated in DB');
  }
}
main().then(() => prisma.$disconnect());
