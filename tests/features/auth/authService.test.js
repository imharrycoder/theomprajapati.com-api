import { describe, it, expect, beforeEach } from 'vitest';
import { generateOtp, storeOtp, verifyOtp } from '../../../src/features/auth/authService.js';

describe('authService', () => {
  describe('generateOtp', () => {
    it('should return a 6-digit string', () => {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs on successive calls', () => {
      const otps = new Set(Array.from({ length: 10 }, () => generateOtp()));
      // With 10 random 6-digit OTPs, at least 2 should differ
      expect(otps.size).toBeGreaterThan(1);
    });
  });

  describe('storeOtp / verifyOtp', () => {
    const key = 'test@example.com';
    const otp = '123456';

    beforeEach(() => {
      // Ensure a fresh OTP is stored before each test
      storeOtp(key, otp);
    });

    it('should verify a valid OTP', () => {
      expect(verifyOtp(key, otp)).toBe(true);
    });

    it('should reject an incorrect OTP', () => {
      expect(verifyOtp(key, '000000')).toBe(false);
    });

    it('should consume the OTP after successful verification (single-use)', () => {
      expect(verifyOtp(key, otp)).toBe(true);
      expect(verifyOtp(key, otp)).toBe(false);
    });

    it('should return false for a non-existent key', () => {
      expect(verifyOtp('unknown@example.com', otp)).toBe(false);
    });
  });
});
