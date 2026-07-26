import { BadRequestError } from '../../errors/index.js';
import { parseJsonField } from '../../utils/parseJsonField.js';

/**
 * Validate and serialize site content payload to a JSON string for storage.
 */
export function serializeSiteContent(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BadRequestError('Site content must be a JSON object');
  }

  return JSON.stringify(payload);
}

/**
 * Parse a site content record's JSON value back into an object.
 */
export function formatSiteContent(record) {
  return record ? parseJsonField(record.value, {}) : {};
}
