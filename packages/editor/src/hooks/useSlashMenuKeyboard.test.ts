/**
 * Tests for useSlashMenuKeyboard hook logic.
 */
import { describe, it, expect } from 'vitest';
import {
  shouldTriggerSlashMenu,
  isEmptyRect,
  calculateMenuPosition,
  calculateFallbackPosition,
} from '../utils/slashMenuUtils';

describe('useSlashMenuKeyboard - Pure Functions', () => {
  describe('shouldTriggerSlashMenu', () => {
    it('should return true at start of empty line', () => {
      expect(shouldTriggerSlashMenu(0, '')).toBe(true);
    });

    it('should return true after whitespace', () => {
      expect(shouldTriggerSlashMenu(6, 'Hello ')).toBe(true);
    });

    it('should return false in middle of word', () => {
      expect(shouldTriggerSlashMenu(3, 'foo')).toBe(false);
    });

    it('should return true after tab', () => {
      expect(shouldTriggerSlashMenu(1, '\t')).toBe(true);
    });

    it('should return true after newline', () => {
      expect(shouldTriggerSlashMenu(6, 'line\n')).toBe(true);
    });
  });

  describe('isEmptyRect', () => {
    it('should return true for null rect', () => {
      expect(isEmptyRect(null)).toBe(true);
    });

    it('should return true for zero dimensions', () => {
      expect(isEmptyRect({ width: 0, height: 0 })).toBe(true);
    });

    it('should return false for valid dimensions', () => {
      expect(isEmptyRect({ width: 10, height: 20 })).toBe(false);
    });
  });

  describe('calculateMenuPosition', () => {
    it('should calculate position with default offset', () => {
      const rect = { bottom: 100, left: 50 };
      const position = calculateMenuPosition(rect);
      expect(position.top).toBe(104); // 100 + 4 default
      expect(position.left).toBe(50);
    });

    it('should calculate position with custom offset', () => {
      const rect = { bottom: 100, left: 50 };
      const position = calculateMenuPosition(rect, { top: 10, left: 20 });
      expect(position.top).toBe(110);
      expect(position.left).toBe(70);
    });

    it('should return zero position for null rect', () => {
      const position = calculateMenuPosition(null);
      expect(position).toEqual({ top: 0, left: 0 });
    });
  });

  describe('calculateFallbackPosition', () => {
    it('should calculate fallback position with default offset', () => {
      const rect = { top: 100, left: 50 };
      const position = calculateFallbackPosition(rect);
      expect(position.top).toBe(120); // 100 + 20 default
      expect(position.left).toBe(50);
    });

    it('should calculate fallback position with custom offset', () => {
      const rect = { top: 100, left: 50 };
      const position = calculateFallbackPosition(rect, 30);
      expect(position.top).toBe(130);
      expect(position.left).toBe(50);
    });

    it('should return zero position for null rect', () => {
      const position = calculateFallbackPosition(null);
      expect(position).toEqual({ top: 0, left: 0 });
    });
  });
});
