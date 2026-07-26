import { describe, it, expect } from 'vitest';
import { parsePaginationParams, buildPaginationQuery, buildPaginationMeta } from '../../src/utils/pagination.js';

describe('pagination', () => {
  describe('parsePaginationParams', () => {
    it('should use defaults when no params provided', () => {
      const result = parsePaginationParams({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should parse valid page and limit', () => {
      const result = parsePaginationParams({ page: '3', limit: '25' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it('should clamp negative page to 1', () => {
      const result = parsePaginationParams({ page: '-5' });
      expect(result.page).toBe(1);
    });

    it('should clamp limit to MAX_PAGE_SIZE', () => {
      const result = parsePaginationParams({ limit: '500' });
      expect(result.limit).toBe(100);
    });
  });

  describe('buildPaginationQuery', () => {
    it('should compute skip and take for page 1', () => {
      const result = buildPaginationQuery(1, 10);
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should compute skip and take for page 3', () => {
      const result = buildPaginationQuery(3, 10);
      expect(result).toEqual({ skip: 20, take: 10 });
    });
  });

  describe('buildPaginationMeta', () => {
    it('should compute totalPages correctly', () => {
      const result = buildPaginationMeta(25, 1, 10);
      expect(result.totalPages).toBe(3);
      expect(result.total).toBe(25);
    });

    it('should handle exact division', () => {
      const result = buildPaginationMeta(30, 1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('should handle zero items', () => {
      const result = buildPaginationMeta(0, 1, 10);
      expect(result.totalPages).toBe(0);
    });
  });
});
