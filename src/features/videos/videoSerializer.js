import { BadRequestError } from '../../errors/index.js';

/**
 * Convert a raw video payload into the shape expected by Prisma.
 * Validates all required fields before serialization.
 */
export function serializeVideo(payload) {
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
