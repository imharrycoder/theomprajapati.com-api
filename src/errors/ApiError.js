/**
 * Base API error class — all custom API errors extend this.
 * Carries an HTTP status code for the error handler middleware.
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export default ApiError;
