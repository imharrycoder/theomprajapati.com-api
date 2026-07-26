import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants.js';

/**
 * Parse page and limit from query params with safe defaults and bounds.
 */
export function parsePaginationParams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const rawLimit = Number(query.limit) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(1, rawLimit), MAX_PAGE_SIZE);

  return { page, limit };
}

/**
 * Build Prisma skip/take values from parsed pagination params.
 */
export function buildPaginationQuery(page, limit) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Build a standard pagination meta object for API responses.
 */
export function buildPaginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
