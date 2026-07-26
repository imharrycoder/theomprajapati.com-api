/**
 * Safely parse a JSON string with a fallback value.
 * Used for deserializing JSON-encoded columns (tags, content).
 */
export function parseJsonField(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
