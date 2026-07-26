import ApiError from './ApiError.js';

class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export default BadRequestError;
