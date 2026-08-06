import prisma from '../../shared/database.js';
import { NotFoundError } from '../../errors/index.js';
import { validateServicePayload } from './serviceValidator.js';
import { parsePaginationParams, buildPaginationQuery, buildPaginationMeta } from '../../utils/pagination.js';

/**
 * GET /services
 * Supports optional pagination via ?page=1&limit=10.
 */
export async function listServices(req, res) {
  const { page: pageParam, limit: limitParam, home } = req.query;

  let where = {};
  if (home === 'true') {
    where.displayOnHome = true;
  }

  if (pageParam || limitParam) {
    const { page, limit } = parsePaginationParams(req.query);
    const { skip, take } = buildPaginationQuery(page, limit);
    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, skip, take }),
      prisma.service.count({ where }),
    ]);

    return res.json({ data: services, meta: buildPaginationMeta(total, page, limit) });
  }

  const services = await prisma.service.findMany({ where });
  return res.json(services);
}

/**
 * GET /services/:id
 */
export async function getService(req, res) {
  const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  return res.json(service);
}

/**
 * POST /services
 */
export async function createService(req, res) {
  const data = validateServicePayload(req.body);
  const service = await prisma.service.create({ data });
  return res.status(201).json({ ...service, message: 'Service created successfully' });
}

/**
 * PUT /services/:id
 */
export async function updateService(req, res) {
  const data = validateServicePayload(req.body);
  const service = await prisma.service.update({ where: { id: Number(req.params.id) }, data });
  return res.json({ ...service, message: 'Service updated successfully' });
}

/**
 * DELETE /services/:id
 */
export async function deleteService(req, res) {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  return res.status(200).json({ message: 'Service deleted successfully' });
}
