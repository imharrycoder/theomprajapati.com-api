import { parseJsonField } from '../../utils/parseJsonField.js';

/**
 * Convert a raw blog post payload into the shape expected by Prisma.
 * Arrays (tags, content) are JSON-stringified for SQLite storage.
 */
export function serializeBlogPost(payload) {
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

/**
 * Convert a Prisma blog post record into a client-friendly shape.
 * JSON-stringified fields (tags, content) are parsed back into arrays.
 */
export function formatBlogPost(post) {
  return {
    ...post,
    tags: parseJsonField(post.tags, []),
    content: parseJsonField(post.content, []),
  };
}
