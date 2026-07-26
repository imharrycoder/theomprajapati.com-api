import prisma from '../../shared/database.js';
import { NotFoundError } from '../../errors/index.js';
import { serializeBlogPost, formatBlogPost } from './blogSerializer.js';
import { parsePaginationParams, buildPaginationQuery, buildPaginationMeta } from '../../utils/pagination.js';

/**
 * GET /blogPosts
 * List posts with optional pagination (?page=1&limit=10) and slug filter.
 * Without pagination params, returns all posts (backward compatible).
 */
export async function listBlogPosts(req, res) {
  const { slug, page: pageParam, limit: limitParam } = req.query;

  if (slug) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    return res.json(post ? [formatBlogPost(post)] : []);
  }

  // If pagination params are provided, return paginated response
  if (pageParam || limitParam) {
    const { page, limit } = parsePaginationParams(req.query);
    const { skip, take } = buildPaginationQuery(page, limit);
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({ orderBy: { date: 'desc' }, skip, take }),
      prisma.blogPost.count(),
    ]);

    return res.json({
      data: posts.map(formatBlogPost),
      meta: buildPaginationMeta(total, page, limit),
    });
  }

  // Default: return all posts (backward compatible with existing frontend)
  const posts = await prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
  return res.json(posts.map(formatBlogPost));
}

/**
 * GET /blogPosts/:slug
 * Get a single post by slug or numeric ID.
 */
export async function getBlogPost(req, res) {
  const { slug } = req.params;
  const isNumericId = /^\d+$/.test(slug);

  const post = await prisma.blogPost.findUnique({
    where: isNumericId ? { id: Number(slug) } : { slug },
  });

  if (!post) {
    throw new NotFoundError('Blog post not found');
  }

  return res.json(formatBlogPost(post));
}

/**
 * POST /blogPosts
 */
export async function createBlogPost(req, res) {
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.create({ data });
  return res.status(201).json({ ...formatBlogPost(post), message: 'Blog post created successfully' });
}

/**
 * PUT /blogPosts/:id
 */
export async function updateBlogPost(req, res) {
  const { id } = req.params;
  const data = serializeBlogPost(req.body);
  const post = await prisma.blogPost.update({ where: { id: Number(id) }, data });
  return res.json({ ...formatBlogPost(post), message: 'Blog post updated successfully' });
}

/**
 * DELETE /blogPosts/:id
 */
export async function deleteBlogPost(req, res) {
  const { id } = req.params;
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return res.status(200).json({ message: 'Blog post deleted successfully' });
}
