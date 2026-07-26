import { describe, it, expect } from 'vitest';
import { serializeBlogPost, formatBlogPost } from '../../../src/features/blogs/blogSerializer.js';

describe('blogSerializer', () => {
  const samplePayload = {
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'A test excerpt',
    category: 'Tech',
    date: '2026-01-15',
    readTime: '3 min read',
    author: 'Test Author',
    premium: false,
    featured: true,
    tags: ['react', 'node'],
    content: [{ heading: 'Intro', body: 'Hello world' }],
  };

  describe('serializeBlogPost', () => {
    it('should stringify tags and content arrays', () => {
      const result = serializeBlogPost(samplePayload);
      expect(typeof result.tags).toBe('string');
      expect(typeof result.content).toBe('string');
      expect(JSON.parse(result.tags)).toEqual(['react', 'node']);
    });

    it('should convert date string to Date object', () => {
      const result = serializeBlogPost(samplePayload);
      expect(result.date).toBeInstanceOf(Date);
    });

    it('should handle missing tags gracefully', () => {
      const result = serializeBlogPost({ ...samplePayload, tags: undefined });
      expect(JSON.parse(result.tags)).toEqual([]);
    });
  });

  describe('formatBlogPost', () => {
    it('should parse stringified tags back into an array', () => {
      const dbRecord = {
        ...samplePayload,
        tags: JSON.stringify(['react', 'node']),
        content: JSON.stringify([{ heading: 'Intro', body: 'Hello world' }]),
      };
      const result = formatBlogPost(dbRecord);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags).toEqual(['react', 'node']);
    });

    it('should fall back to empty array for invalid JSON tags', () => {
      const dbRecord = { ...samplePayload, tags: 'invalid-json', content: '[]' };
      const result = formatBlogPost(dbRecord);
      expect(result.tags).toEqual([]);
    });
  });
});
