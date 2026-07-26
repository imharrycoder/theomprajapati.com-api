import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envConfig = dotenv.config({ path: '.env.local', override: true });
if (envConfig.error) {
  dotenv.config({ override: true });
}

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.resolve(process.cwd(), '../theomprajapati.com/db.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  await prisma.blogPost.deleteMany();
  await prisma.service.deleteMany();
  await prisma.video.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.user.deleteMany();

  for (const post of data.blogPosts) {
    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: new Date(post.date),
        readTime: post.readTime,
        author: post.author,
        premium: post.premium,
        featured: post.featured,
        tags: JSON.stringify(post.tags),
        content: JSON.stringify(post.content),
      },
    });
  }

  for (const service of data.services) {
    await prisma.service.create({ data: service });
  }

  for (const video of data.videos) {
    await prisma.video.create({
      data: {
        ...video,
        publishDate: new Date(video.publishDate),
      },
    });
  }

  if (data.siteContent) {
    await prisma.siteContent.create({
      data: {
        key: 'home',
        value: JSON.stringify(data.siteContent),
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
