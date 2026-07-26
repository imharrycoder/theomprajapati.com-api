import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton — ensures a single database connection
 * is reused across the entire application lifecycle.
 */
const prisma = new PrismaClient();

export default prisma;
