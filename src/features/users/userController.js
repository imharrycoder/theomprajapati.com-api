import { registerUser, loginUser } from './userService.js';
import { formatUser } from './userSerializer.js';

/**
 * POST /users/register
 */
export async function handleRegister(req, res) {
  const user = await registerUser(req.body);
  return res.status(201).json({ ...formatUser(user), message: 'User registered successfully' });
}

/**
 * POST /users/login
 */
export async function handleLogin(req, res) {
  const user = await loginUser(req.body);
  return res.json({ ...formatUser(user), message: 'Login successful' });
}

/**
 * GET /users/me
 * Requires authMiddleware — user is already attached to req.user.
 */
export async function handleGetCurrentUser(req, res) {
  return res.json(formatUser(req.user));
}
