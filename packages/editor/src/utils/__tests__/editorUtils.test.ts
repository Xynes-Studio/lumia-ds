import { describe, test, expect } from 'vitest';
import {
  getDefaultSelectionState,
  hasSelectedContent,
  getWordCount,
  getCharacterCount,
  truncateText,
  DEBOUNCE_DELAYS,
  getDebounceDelay,
  isUrl,
  extractUrls,
  normalizeText,
  textsAreSimilar,
} from '../editorUtils';

describe('editorUtils', () => {
  describe('getDefaultSelectionState', () => {
    test('returns empty selection', () => {
      const state = getDefaultSelectionState();
      expect(state.hasSelection).toBe(false);
      expect(state.isCollapsed).toBe(true);
      expect(state.selectedText).toBe('');
    });
  });

  describe('hasSelectedContent', () => {
    test('returns true for valid selection', () => {
      const state = {
        hasSelection: true,
        isCollapsed: false,
        selectedText: 'hello',
      };
      expect(hasSelectedContent(state)).toBe(true);
    });

    test('returns false for collapsed selection', () => {
      const state = { hasSelection: true, isCollapsed: true, selectedText: '' };
      expect(hasSelectedContent(state)).toBe(false);
    });

    test('returns false for no selection', () => {
      const state = {
        hasSelection: false,
        isCollapsed: true,
        selectedText: '',
      };
      expect(hasSelectedContent(state)).toBe(false);
    });
  });

  describe('getWordCount', () => {
    test('counts words', () => {
      expect(getWordCount('hello world')).toBe(2);
    });

    test('handles multiple spaces', () => {
      expect(getWordCount('hello   world')).toBe(2);
    });

    test('returns 0 for empty', () => {
      expect(getWordCount('')).toBe(0);
      expect(getWordCount('   ')).toBe(0);
    });
  });

  describe('getCharacterCount', () => {
    test('counts with spaces', () => {
      expect(getCharacterCount('hello world')).toBe(11);
    });

    test('counts without spaces', () => {
      expect(getCharacterCount('hello world', false)).toBe(10);
    });
  });

  describe('truncateText', () => {
    test('truncates long text', () => {
      expect(truncateText('hello world', 8)).toBe('hello...');
    });

    test('keeps short text', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });
  });

  describe('DEBOUNCE_DELAYS', () => {
    test('has correct values', () => {
      expect(DEBOUNCE_DELAYS.fast).toBe(150);
      expect(DEBOUNCE_DELAYS.normal).toBe(300);
      expect(DEBOUNCE_DELAYS.slow).toBe(500);
    });
  });

  describe('getDebounceDelay', () => {
    test('returns correct delay', () => {
      expect(getDebounceDelay('fast')).toBe(150);
      expect(getDebounceDelay('normal')).toBe(300);
      expect(getDebounceDelay('slow')).toBe(500);
    });
  });

  describe('isUrl', () => {
    test('returns true for valid URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://test.org/page')).toBe(true);
    });

    test('returns false for invalid URLs', () => {
      expect(isUrl('not a url')).toBe(false);
      expect(isUrl('example.com')).toBe(false);
    });
  });

  describe('extractUrls', () => {
    test('extracts URLs from text', () => {
      const text = 'Visit https://example.com and http://test.org';
      const urls = extractUrls(text);
      expect(urls).toContain('https://example.com');
      expect(urls).toContain('http://test.org');
    });

    test('returns empty for no URLs', () => {
      expect(extractUrls('no urls here')).toEqual([]);
    });
  });

  describe('normalizeText', () => {
    test('lowercases text', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    test('trims whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });

    test('collapses multiple spaces', () => {
      expect(normalizeText('hello   world')).toBe('hello world');
    });
  });

  describe('textsAreSimilar', () => {
    test('returns true for similar texts', () => {
      expect(textsAreSimilar('Hello', 'hello')).toBe(true);
      expect(textsAreSimilar('hello world', '  Hello   World  ')).toBe(true);
    });

    test('returns false for different texts', () => {
      expect(textsAreSimilar('hello', 'world')).toBe(false);
    });
  });
});
