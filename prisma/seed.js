import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.resolve(process.cwd(), '../theomprajapati.com/db.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  await prisma.blogPost.deleteMany();
  await prisma.service.deleteMany();
  await prisma.video.deleteMany();

  await Promise.all(
    data.blogPosts.map((post) =>
      prisma.blogPost.create({
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
      })
    )
  );

  await Promise.all(
    data.services.map((service) =>
      prisma.service.create({ data: service })
    )
  );

  await Promise.all(
    data.videos.map((video) =>
      prisma.video.create({ data: video })
    )
  );

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
