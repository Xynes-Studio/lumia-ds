import { describe, test, expect } from 'vitest';
import {
  getBlockTypeLabel,
  getHeadingLabel,
  getFormatShortcut,
  isFormatActive,
  toggleFormat,
  isMacPlatform,
  getModifierKey,
  parseHeadingLevel,
  matchesShortcut,
  getDefaultFormats,
} from '../toolbarUtils';

describe('toolbarUtils', () => {
  describe('getBlockTypeLabel', () => {
    test('returns Paragraph label', () => {
      expect(getBlockTypeLabel('paragraph')).toBe('Paragraph');
    });

    test('returns Heading label', () => {
      expect(getBlockTypeLabel('heading')).toBe('Heading');
    });

    test('returns Code Block label', () => {
      expect(getBlockTypeLabel('code')).toBe('Code Block');
    });

    test('returns Quote label', () => {
      expect(getBlockTypeLabel('quote')).toBe('Quote');
    });
  });

  describe('getHeadingLabel', () => {
    test('returns Heading 1', () => {
      expect(getHeadingLabel('h1')).toBe('Heading 1');
    });

    test('returns Heading 2', () => {
      expect(getHeadingLabel('h2')).toBe('Heading 2');
    });

    test('returns Heading 6', () => {
      expect(getHeadingLabel('h6')).toBe('Heading 6');
    });
  });

  describe('getFormatShortcut', () => {
    test('returns Mac shortcut for bold', () => {
      expect(getFormatShortcut('bold', true)).toBe('⌘B');
    });

    test('returns Windows shortcut for bold', () => {
      expect(getFormatShortcut('bold', false)).toBe('Ctrl+B');
    });

    test('returns italic shortcut', () => {
      expect(getFormatShortcut('italic', true)).toBe('⌘I');
    });

    test('returns underline shortcut', () => {
      expect(getFormatShortcut('underline', true)).toBe('⌘U');
    });

    test('returns strikethrough shortcut', () => {
      expect(getFormatShortcut('strikethrough', true)).toBe('⌘⇧S');
    });

    test('returns code shortcut', () => {
      expect(getFormatShortcut('code', true)).toBe('⌘E');
    });
  });

  describe('isFormatActive', () => {
    test('returns true for active format', () => {
      const formats = {
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
      };
      expect(isFormatActive(formats, 'bold')).toBe(true);
    });

    test('returns false for inactive format', () => {
      const formats = {
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
      };
      expect(isFormatActive(formats, 'italic')).toBe(false);
    });
  });

  describe('toggleFormat', () => {
    test('enables inactive format', () => {
      const formats = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
      };
      const result = toggleFormat(formats, 'bold');
      expect(result.bold).toBe(true);
    });

    test('disables active format', () => {
      const formats = {
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        code: false,
      };
      const result = toggleFormat(formats, 'bold');
      expect(result.bold).toBe(false);
    });

    test('preserves other formats', () => {
      const formats = {
        bold: true,
        italic: true,
        underline: false,
        strikethrough: false,
        code: false,
      };
      const result = toggleFormat(formats, 'bold');
      expect(result.italic).toBe(true);
    });
  });

  describe('isMacPlatform', () => {
    test('returns true for Mac', () => {
      expect(isMacPlatform('MacIntel')).toBe(true);
      expect(isMacPlatform('Macintosh')).toBe(true);
    });

    test('returns true for iPhone', () => {
      expect(isMacPlatform('iPhone')).toBe(true);
    });

    test('returns true for iPad', () => {
      expect(isMacPlatform('iPad')).toBe(true);
    });

    test('returns false for Windows', () => {
      expect(isMacPlatform('Win32')).toBe(false);
    });

    test('returns false for Linux', () => {
      expect(isMacPlatform('Linux x86_64')).toBe(false);
    });
  });

  describe('getModifierKey', () => {
    test('returns metaKey for Mac', () => {
      expect(getModifierKey(true)).toBe('metaKey');
    });

    test('returns ctrlKey for Windows', () => {
      expect(getModifierKey(false)).toBe('ctrlKey');
    });
  });

  describe('parseHeadingLevel', () => {
    test('parses H1', () => {
      expect(parseHeadingLevel('H1')).toBe('h1');
      expect(parseHeadingLevel('h1')).toBe('h1');
    });

    test('parses H6', () => {
      expect(parseHeadingLevel('H6')).toBe('h6');
    });

    test('returns null for invalid', () => {
      expect(parseHeadingLevel('H7')).toBeNull();
      expect(parseHeadingLevel('p')).toBeNull();
      expect(parseHeadingLevel('div')).toBeNull();
    });
  });

  describe('matchesShortcut', () => {
    test('matches bold on Mac', () => {
      const event = {
        key: 'b',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      };
      expect(matchesShortcut(event, 'bold', true)).toBe(true);
    });

    test('matches bold on Windows', () => {
      const event = {
        key: 'b',
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
      };
      expect(matchesShortcut(event, 'bold', false)).toBe(true);
    });

    test('matches italic', () => {
      const event = {
        key: 'i',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      };
      expect(matchesShortcut(event, 'italic', true)).toBe(true);
    });

    test('matches strikethrough with shift', () => {
      const event = { key: 's', metaKey: true, ctrlKey: false, shiftKey: true };
      expect(matchesShortcut(event, 'strikethrough', true)).toBe(true);
    });

    test('returns false without modifier', () => {
      const event = {
        key: 'b',
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      };
      expect(matchesShortcut(event, 'bold', true)).toBe(false);
    });
  });

  describe('getDefaultFormats', () => {
    test('returns all formats as false', () => {
      const formats = getDefaultFormats();
      expect(formats.bold).toBe(false);
      expect(formats.italic).toBe(false);
      expect(formats.underline).toBe(false);
      expect(formats.strikethrough).toBe(false);
      expect(formats.code).toBe(false);
    });

    test('returns new object each time', () => {
      const formats1 = getDefaultFormats();
      const formats2 = getDefaultFormats();
      expect(formats1).not.toBe(formats2);
    });
  });
});
