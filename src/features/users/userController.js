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

import prisma from '../../shared/database.js';

/**
 * GET /admin/users
 */
export async function handleGetUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(users);
}

/**
 * PUT /admin/users/:id/subscription
 */
export async function handleUpdateUserSubscription(req, res) {
  const userId = parseInt(req.params.id, 10);
  const { subscriptionPlan, subscriptionExpiresAt } = req.body;
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan,
      subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionExpiresAt: true
    }
  });
  
  return res.json({ user: updatedUser, message: 'Subscription updated successfully' });
}
