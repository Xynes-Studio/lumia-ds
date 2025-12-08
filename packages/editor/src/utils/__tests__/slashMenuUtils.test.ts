import { describe, test, expect } from 'vitest';
import {
  initialSlashMenuState,
  initialModalState,
  calculateSlashRemoval,
  shouldOpenModal,
  isSlashTrigger,
  isMenuCloseKey,
  getMenuNavigationAction,
  calculateMenuPosition,
  extractQueryFromText,
} from '../slashMenuUtils';

describe('slashMenuUtils', () => {
  describe('initialSlashMenuState', () => {
    test('has correct default values', () => {
      expect(initialSlashMenuState.isOpen).toBe(false);
      expect(initialSlashMenuState.query).toBe('');
      expect(initialSlashMenuState.position).toEqual({ top: 0, left: 0 });
      expect(initialSlashMenuState.triggerNodeKey).toBeNull();
      expect(initialSlashMenuState.triggerOffset).toBe(0);
    });
  });

  describe('initialModalState', () => {
    test('has correct default values', () => {
      expect(initialModalState.isOpen).toBe(false);
      expect(initialModalState.type).toBeNull();
      expect(initialModalState.position).toEqual({ top: 0, left: 0 });
    });
  });

  describe('calculateSlashRemoval', () => {
    test('removes slash and query from middle of text', () => {
      const result = calculateSlashRemoval('Hello /world test', 6, 5);
      expect(result.beforeSlash).toBe('Hello ');
      expect(result.afterQuery).toBe(' test');
      expect(result.isEmpty).toBe(false);
    });

    test('removes slash at start of text', () => {
      const result = calculateSlashRemoval('/table', 0, 5);
      expect(result.beforeSlash).toBe('');
      expect(result.afterQuery).toBe('');
      expect(result.isEmpty).toBe(true);
    });

    test('removes slash with empty query', () => {
      const result = calculateSlashRemoval('Text /', 5, 0);
      expect(result.beforeSlash).toBe('Text ');
      expect(result.afterQuery).toBe('');
      expect(result.isEmpty).toBe(false);
    });

    test('removes slash at end of text', () => {
      const result = calculateSlashRemoval('Start /img', 6, 3);
      expect(result.beforeSlash).toBe('Start ');
      expect(result.afterQuery).toBe('');
      expect(result.isEmpty).toBe(false);
    });

    test('returns isEmpty true when both parts are empty', () => {
      const result = calculateSlashRemoval('/tab', 0, 3);
      expect(result.isEmpty).toBe(true);
    });
  });

  describe('shouldOpenModal', () => {
    test('returns true for media-image', () => {
      expect(shouldOpenModal('media-image')).toBe(true);
    });

    test('returns true for media-video', () => {
      expect(shouldOpenModal('media-video')).toBe(true);
    });

    test('returns true for media-file', () => {
      expect(shouldOpenModal('media-file')).toBe(true);
    });

    test('returns false for none', () => {
      expect(shouldOpenModal('none')).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(shouldOpenModal(undefined)).toBe(false);
    });
  });

  describe('isSlashTrigger', () => {
    test('returns true for / at start', () => {
      expect(isSlashTrigger('/', '')).toBe(true);
    });

    test('returns true for / after space', () => {
      expect(isSlashTrigger('/', 'Hello ')).toBe(true);
    });

    test('returns true for / after newline', () => {
      expect(isSlashTrigger('/', 'Hello\n')).toBe(true);
    });

    test('returns true for / after tab', () => {
      expect(isSlashTrigger('/', 'Hello\t')).toBe(true);
    });

    test('returns false for / in middle of word', () => {
      expect(isSlashTrigger('/', 'Hello')).toBe(false);
    });

    test('returns false for non-slash character', () => {
      expect(isSlashTrigger('a', '')).toBe(false);
      expect(isSlashTrigger('\\', '')).toBe(false);
    });
  });

  describe('isMenuCloseKey', () => {
    test('returns true for Escape', () => {
      expect(isMenuCloseKey('Escape')).toBe(true);
    });

    test('returns true for space', () => {
      expect(isMenuCloseKey(' ')).toBe(true);
    });

    test('returns false for other keys', () => {
      expect(isMenuCloseKey('Enter')).toBe(false);
      expect(isMenuCloseKey('Tab')).toBe(false);
      expect(isMenuCloseKey('ArrowDown')).toBe(false);
      expect(isMenuCloseKey('a')).toBe(false);
    });
  });

  describe('getMenuNavigationAction', () => {
    test('returns up for ArrowUp', () => {
      expect(getMenuNavigationAction('ArrowUp')).toBe('up');
    });

    test('returns down for ArrowDown', () => {
      expect(getMenuNavigationAction('ArrowDown')).toBe('down');
    });

    test('returns select for Enter', () => {
      expect(getMenuNavigationAction('Enter')).toBe('select');
    });

    test('returns select for Tab', () => {
      expect(getMenuNavigationAction('Tab')).toBe('select');
    });

    test('returns null for other keys', () => {
      expect(getMenuNavigationAction('Escape')).toBeNull();
      expect(getMenuNavigationAction('a')).toBeNull();
      expect(getMenuNavigationAction(' ')).toBeNull();
    });
  });

  describe('calculateMenuPosition', () => {
    test('calculates position with default offset', () => {
      const rect = { bottom: 100, left: 50 };
      const result = calculateMenuPosition(rect);
      expect(result.top).toBe(104); // 100 + 4 default
      expect(result.left).toBe(50);
    });

    test('calculates position with custom offset', () => {
      const rect = { bottom: 100, left: 50 };
      const result = calculateMenuPosition(rect, { top: 10, left: 20 });
      expect(result.top).toBe(110);
      expect(result.left).toBe(70);
    });

    test('returns zero position for null rect', () => {
      const result = calculateMenuPosition(null);
      expect(result).toEqual({ top: 0, left: 0 });
    });

    test('handles partial offset', () => {
      const rect = { bottom: 100, left: 50 };
      const result = calculateMenuPosition(rect, { top: 10 });
      expect(result.top).toBe(110);
      expect(result.left).toBe(50);
    });
  });

  describe('extractQueryFromText', () => {
    test('extracts query after slash', () => {
      const result = extractQueryFromText('/table', 0, 6);
      expect(result).toBe('table');
    });

    test('extracts partial query', () => {
      const result = extractQueryFromText('/tab', 0, 4);
      expect(result).toBe('tab');
    });

    test('returns empty for cursor at slash', () => {
      const result = extractQueryFromText('/table', 0, 0);
      expect(result).toBe('');
    });

    test('returns empty for cursor before slash', () => {
      const result = extractQueryFromText('Hello /table', 6, 5);
      expect(result).toBe('');
    });

    test('extracts query from middle of text', () => {
      const result = extractQueryFromText('Hello /vid', 6, 10);
      expect(result).toBe('vid');
    });
  });
});
