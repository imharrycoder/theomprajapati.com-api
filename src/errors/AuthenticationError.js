import ApiError from './ApiError.js';

class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export default AuthenticationError;
