/**
 * Strip the password field from a user record before sending to clients.
 */
export function formatUser(user) {
  const { password, ...publicFields } = user;
  return publicFields;
}
