import { BadRequestError } from '../../errors/index.js';

/**
 * Validate a service creation/update payload.
 * Prevents raw, unsanitized req.body from reaching Prisma.
 */
export function validateServicePayload(body) {
  const { title, category, description } = body;

  if (!title || typeof title !== 'string') {
    throw new BadRequestError('Service title is required');
  }

  if (!description || typeof description !== 'string') {
    throw new BadRequestError('Service description is required');
  }

  return {
    title: title.trim(),
    category: (category || '').trim(),
    description: description.trim(),
  };
}
