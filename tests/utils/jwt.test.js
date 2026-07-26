import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../src/utils/jwt.js';

describe('jwt', () => {
  describe('signToken / verifyToken', () => {
    it('should sign and verify a token with valid payload', () => {
      const payload = { role: 'admin', username: 'testuser' };
      const token = signToken(payload, '1h');

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = verifyToken(token);
      expect(decoded.role).toBe('admin');
      expect(decoded.username).toBe('testuser');
    });

    it('should return null for an invalid token', () => {
      const result = verifyToken('invalid.token.string');
      expect(result).toBeNull();
    });

    it('should return null for an empty string', () => {
      const result = verifyToken('');
      expect(result).toBeNull();
    });

    it('should embed custom claims in the token', () => {
      const token = signToken({ role: 'user', email: 'a@b.com', userId: 42 }, '1h');
      const decoded = verifyToken(token);

      expect(decoded.role).toBe('user');
      expect(decoded.email).toBe('a@b.com');
      expect(decoded.userId).toBe(42);
    });

    it('should include standard JWT fields (iat, exp)', () => {
      const token = signToken({ role: 'admin' }, '1h');
      const decoded = verifyToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });
});
