import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const envConfig = dotenv.config({ path: '.env.local', override: true });
if (envConfig.error) {
  dotenv.config({ override: true });
}

console.log('Loaded API env:', {
  ADMIN_USER: process.env.ADMIN_USER ? '***' : null,
  DATABASE_URL: process.env.DATABASE_URL,
});

const app = express();
const prisma = new PrismaClient();
const otpStore = new Map();

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:4174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'https://theomprajapati.com',
  'https://www.theomprajapati.com',
  'https://admin.theomprajapati.com',
];

const allowedCorsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultCorsOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedCorsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Custom Error Classes
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: 'admin-token', message: 'Admin login successful' });
  }
  throw new AuthenticationError('Invalid credentials');
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
  const isNumericId = /^\d+$/.test(slug);
  const post = await prisma.blogPost.findUnique({
    where: isNumericId ? { id: Number(slug) } : { slug },
  });
  if (!post) throw new NotFoundError('Blog post not found');
  return res.json(formatBlogPost(post));
});

app.post('/blogPosts', async (req, res) => {
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.create({ data });
  return res.status(201).json({ ...formatBlogPost(post), message: 'Blog post created successfully' });
});

app.put('/blogPosts/:id', async (req, res) => {
  const { id } = req.params;
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.update({ where: { id: Number(id) }, data });
  return res.json({ ...formatBlogPost(post), message: 'Blog post updated successfully' });
});

app.delete('/blogPosts/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return res.status(200).json({ message: 'Blog post deleted successfully' });
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

function parseJsonField(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function serializeSiteContent(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BadRequestError('Site content must be a JSON object');
  }

  return JSON.stringify(payload);
}

function formatSiteContent(record) {
  return record ? parseJsonField(record.value, {}) : {};
}

function serializeVideo(payload) {
  const { title, thumbnail, platform, videoUrl, description, publishDate, featured } = payload;

  if (!title || !thumbnail || !platform || !videoUrl || !description || !publishDate) {
    throw new BadRequestError('All video fields must be provided');
  }

  return {
    title,
    thumbnail,
    platform,
    videoUrl,
    description,
    publishDate: new Date(publishDate),
    featured: Boolean(featured),
  };
}

function formatUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOtp(key, otp) {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(key, { otp, expiresAt });
}

function verifyOtp(key, candidate) {
  const entry = otpStore.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  const isValid = entry.otp === candidate;
  if (isValid) otpStore.delete(key);
  return isValid;
}

app.post('/auth/send-otp', async (req, res) => {
  const { email, contact } = req.body;
  if (!email && !contact) {
    throw new BadRequestError('Email or contact is required to send OTP');
  }

  const key = email || contact;
  const otp = generateOtp();
  storeOtp(key, otp);

  return res.json({ message: 'OTP sent successfully', otp });
});

app.post('/users/register', async (req, res) => {
  const { email, password, name, contact, instaId, city, state, profession, location, device, otp } = req.body;

  if (!email || !password || !name || !contact || !city || !state || !profession) {
    throw new BadRequestError('All required registration fields must be provided');
  }

  if (!otp || !verifyOtp(email || contact, otp)) {
    throw new BadRequestError('Invalid or expired OTP');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = randomUUID();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      contact,
      instaId: instaId || null,
      city,
      state,
      profession,
      location: location || null,
      device: device || null,
      token,
      emailVerified: true,
      lastLogin: new Date(),
    },
  });

  return res.status(201).json({ ...formatUser(user), message: 'User registered successfully' });
});

app.post('/users/login', async (req, res) => {
  const { email, password, location, device } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = randomUUID();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      token,
      location: location || user.location,
      device: device || user.device,
      lastLogin: new Date(),
    },
  });

  return res.json({ ...formatUser(updated), message: 'Login successful' });
});

app.get('/users/me', async (req, res) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new AuthenticationError('Missing auth token');
  }

  const user = await prisma.user.findUnique({ where: { token } });
  if (!user) {
    throw new AuthenticationError('Invalid auth token');
  }

  return res.json(formatUser(user));
});

app.get('/services', async (req, res) => {
  const services = await prisma.service.findMany();
  return res.json(services);
});

app.get('/services/:id', async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
  if (!service) throw new NotFoundError('Service not found');
  return res.json(service);
});

app.post('/services', async (req, res) => {
  const service = await prisma.service.create({ data: req.body });
  return res.status(201).json({ ...service, message: 'Service created successfully' });
});

app.put('/services/:id', async (req, res) => {
  const service = await prisma.service.update({ where: { id: Number(req.params.id) }, data: req.body });
  return res.json({ ...service, message: 'Service updated successfully' });
});

app.delete('/services/:id', async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  return res.status(200).json({ message: 'Service deleted successfully' });
});

app.get('/videos/featured', async (req, res) => {
  const videos = await prisma.video.findMany({
    where: { featured: true },
    orderBy: { publishDate: 'desc' },
    take: 3,
  });
  return res.json(videos);
});

app.get('/videos', async (req, res) => {
  const videos = await prisma.video.findMany();
  return res.json(videos);
});

app.get('/videos/:id', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: Number(req.params.id) } });
  if (!video) throw new NotFoundError('Video not found');
  return res.json(video);
});

app.post('/videos', async (req, res) => {
  const data = serializeVideo(req.body);
  const video = await prisma.video.create({ data });
  return res.status(201).json({ ...video, message: 'Video created successfully' });
});

app.put('/videos/:id', async (req, res) => {
  const { id } = req.params;
  const data = serializeVideo(req.body);
  const video = await prisma.video.update({ where: { id: Number(id) }, data });
  return res.json({ ...video, message: 'Video updated successfully' });
});

app.delete('/videos/:id', async (req, res) => {
  await prisma.video.delete({ where: { id: Number(req.params.id) } });
  return res.status(200).json({ message: 'Video deleted successfully' });
});

app.get('/site-content', async (req, res) => {
  const record = await prisma.siteContent.findUnique({ where: { key: 'home' } });
  return res.json(formatSiteContent(record));
});

app.put('/site-content', async (req, res) => {
  const value = serializeSiteContent(req.body);
  const record = await prisma.siteContent.upsert({
    where: { key: 'home' },
    update: { value },
    create: { key: 'home', value },
  });

  return res.json({ ...formatSiteContent(record), message: 'Site content updated successfully' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err); // For debugging

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
