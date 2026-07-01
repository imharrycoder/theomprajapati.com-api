import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: 'admin-token' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/blogPosts', async (req, res) => {
  const { slug } = req.query;
  if (slug) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    return res.json(post ? [formatBlogPost(post)] : []);
  }

  const posts = await prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
  return res.json(posts.map(formatBlogPost));
});

app.get('/blogPosts/:slug', async (req, res) => {
  const { slug } = req.params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return res.status(404).json({ error: 'Not found' });
  return res.json(formatBlogPost(post));
});

app.post('/blogPosts', async (req, res) => {
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.create({ data });
  return res.status(201).json(formatBlogPost(post));
});

app.put('/blogPosts/:id', async (req, res) => {
  const { id } = req.params;
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.update({ where: { id: Number(id) }, data });
  return res.json(formatBlogPost(post));
});

app.delete('/blogPosts/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return res.status(204).send();
});

function serializeBlogPost(payload) {
  return {
    slug: payload.slug,
    title: payload.title,
    excerpt: payload.excerpt,
    category: payload.category,
    date: new Date(payload.date),
    readTime: payload.readTime,
    author: payload.author,
    premium: payload.premium,
    featured: payload.featured,
    tags: JSON.stringify(payload.tags || []),
    content: JSON.stringify(payload.content || []),
  };
}

function formatBlogPost(post) {
  return {
    ...post,
    tags: JSON.parse(post.tags),
    content: JSON.parse(post.content),
  };
}

app.get('/services', async (req, res) => {
  const services = await prisma.service.findMany();
  return res.json(services);
});

app.get('/services/:id', async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
  if (!service) return res.status(404).json({ error: 'Not found' });
  return res.json(service);
});

app.post('/services', async (req, res) => {
  const service = await prisma.service.create({ data: req.body });
  return res.status(201).json(service);
});

app.put('/services/:id', async (req, res) => {
  const service = await prisma.service.update({ where: { id: Number(req.params.id) }, data: req.body });
  return res.json(service);
});

app.delete('/services/:id', async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  return res.status(204).send();
});

app.get('/videos', async (req, res) => {
  const videos = await prisma.video.findMany();
  return res.json(videos);
});

app.get('/videos/:id', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: Number(req.params.id) } });
  if (!video) return res.status(404).json({ error: 'Not found' });
  return res.json(video);
});

app.post('/videos', async (req, res) => {
  const video = await prisma.video.create({ data: req.body });
  return res.status(201).json(video);
});

app.put('/videos/:id', async (req, res) => {
  const video = await prisma.video.update({ where: { id: Number(req.params.id) }, data: req.body });
  return res.json(video);
});

app.delete('/videos/:id', async (req, res) => {
  await prisma.video.delete({ where: { id: Number(req.params.id) } });
  return res.status(204).send();
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
