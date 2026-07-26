import prisma from '../../shared/database.js';
import { NotFoundError } from '../../errors/index.js';
import { serializeVideo } from './videoSerializer.js';
import { FEATURED_VIDEOS_LIMIT } from '../../config/constants.js';
import { parsePaginationParams, buildPaginationQuery, buildPaginationMeta } from '../../utils/pagination.js';

/**
 * GET /videos/featured
 * Returns the top N featured videos ordered by publish date.
 */
export async function listFeaturedVideos(req, res) {
  const videos = await prisma.video.findMany({
    where: { featured: true },
    orderBy: { publishDate: 'desc' },
    take: FEATURED_VIDEOS_LIMIT,
  });

  return res.json(videos);
}

/**
 * GET /videos
 * Supports optional pagination via ?page=1&limit=10.
 */
export async function listVideos(req, res) {
  const { page: pageParam, limit: limitParam } = req.query;

  if (pageParam || limitParam) {
    const { page, limit } = parsePaginationParams(req.query);
    const { skip, take } = buildPaginationQuery(page, limit);
    const [videos, total] = await Promise.all([
      prisma.video.findMany({ skip, take }),
      prisma.video.count(),
    ]);

    return res.json({ data: videos, meta: buildPaginationMeta(total, page, limit) });
  }

  const videos = await prisma.video.findMany();
  return res.json(videos);
}

/**
 * GET /videos/:id
 */
export async function getVideo(req, res) {
  const video = await prisma.video.findUnique({ where: { id: Number(req.params.id) } });

  if (!video) {
    throw new NotFoundError('Video not found');
  }

  return res.json(video);
}

/**
 * POST /videos
 */
export async function createVideo(req, res) {
  const data = serializeVideo(req.body);
  const video = await prisma.video.create({ data });
  return res.status(201).json({ ...video, message: 'Video created successfully' });
}

/**
 * PUT /videos/:id
 */
export async function updateVideo(req, res) {
  const { id } = req.params;
  const data = serializeVideo(req.body);
  const video = await prisma.video.update({ where: { id: Number(id) }, data });
  return res.json({ ...video, message: 'Video updated successfully' });
}

/**
 * DELETE /videos/:id
 */
export async function deleteVideo(req, res) {
  await prisma.video.delete({ where: { id: Number(req.params.id) } });
  return res.status(200).json({ message: 'Video deleted successfully' });
}
