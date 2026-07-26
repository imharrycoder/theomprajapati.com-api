import prisma from '../../shared/database.js';
import { serializeSiteContent, formatSiteContent } from './siteContentSerializer.js';

const SITE_CONTENT_KEY = 'home';

/**
 * GET /site-content
 */
export async function getSiteContent(req, res) {
  const record = await prisma.siteContent.findUnique({ where: { key: SITE_CONTENT_KEY } });
  return res.json(formatSiteContent(record));
}

/**
 * PUT /site-content
 * Upserts site content — creates if missing, updates if existing.
 */
export async function updateSiteContent(req, res) {
  const value = serializeSiteContent(req.body);

  const record = await prisma.siteContent.upsert({
    where: { key: SITE_CONTENT_KEY },
    update: { value },
    create: { key: SITE_CONTENT_KEY, value },
  });

  return res.json({ ...formatSiteContent(record), message: 'Site content updated successfully' });
}
