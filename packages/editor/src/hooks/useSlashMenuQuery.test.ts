/**
 * Tests for useSlashMenuQuery hook logic.
 */
import { describe, it, expect } from 'vitest';
import {
  extractQueryWithCursor,
  isSlashStillPresent,
  isSelectionInValidNode,
  getCorrectedSlashIndex,
} from '../utils/slashMenuUtils';

describe('useSlashMenuQuery - Pure Functions', () => {
  describe('extractQueryWithCursor', () => {
    it('should extract query between slash and cursor', () => {
      const result = extractQueryWithCursor('/table', 0, 6);
      expect(result.query).toBe('table');
      expect(result.isValid).toBe(true);
    });

    it('should return empty query when cursor at slash', () => {
      const result = extractQueryWithCursor('/', 0, 1);
      expect(result.query).toBe('');
      expect(result.isValid).toBe(true);
    });

    it('should mark query as invalid with space', () => {
      const result = extractQueryWithCursor('/hello world', 0, 12);
      expect(result.query).toBe('hello world');
      expect(result.isValid).toBe(false);
    });

    it('should handle cursor before slash', () => {
      const result = extractQueryWithCursor('/tab', 0, 0);
      expect(result.query).toBe('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('isSlashStillPresent', () => {
    it('should return true when slash at expected position', () => {
      expect(isSlashStillPresent('/table', 0)).toBe(true);
    });

    it('should return true for slash in middle of text', () => {
      expect(isSlashStillPresent('Hello /world', 6)).toBe(true);
    });

    it('should return false when no slash', () => {
      expect(isSlashStillPresent('table', 0)).toBe(false);
    });

    it('should return false for out of bounds', () => {
      expect(isSlashStillPresent('/tab', 10)).toBe(false);
    });
  });

  describe('isSelectionInValidNode', () => {
    it('should return true when in trigger node', () => {
      const result = isSelectionInValidNode('node-1', 'node-1', null, false);
      expect(result).toBe(true);
    });

    it('should return true when in text child', () => {
      const result = isSelectionInValidNode('text-1', 'node-1', 'text-1', true);
      expect(result).toBe(true);
    });

    it('should return false when in different node', () => {
      const result = isSelectionInValidNode('other', 'node-1', 'text-1', true);
      expect(result).toBe(false);
    });

    it('should return false when text node key is null', () => {
      const result = isSelectionInValidNode('other', 'node-1', null, true);
      expect(result).toBe(false);
    });
  });

  describe('getCorrectedSlashIndex', () => {
    it('should return 0 for element node', () => {
      expect(getCorrectedSlashIndex(true, 5)).toBe(0);
    });

    it('should return original offset for text node', () => {
      expect(getCorrectedSlashIndex(false, 5)).toBe(5);
    });
  });
});
