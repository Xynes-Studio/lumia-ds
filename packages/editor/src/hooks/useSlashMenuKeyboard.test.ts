/**
 * Tests for useSlashMenuKeyboard hook logic.
 */
import { renderHook } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';
import { useSlashMenuKeyboard } from './useSlashMenuKeyboard';
import {
  isEmptyRect,
  calculateMenuPosition,
  calculateFallbackPosition,
  processKeyboardTrigger,
} from '../utils/slashMenuUtils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  KEY_DOWN_COMMAND,
} from 'lexical';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('lexical', () => ({
  $getSelection: vi.fn(),
  $isElementNode: vi.fn(),
  $isRangeSelection: vi.fn(),
  $isTextNode: vi.fn(),
  COMMAND_PRIORITY_LOW: 'low',
  KEY_DOWN_COMMAND: 'KEY_DOWN_COMMAND',
}));

vi.mock('../utils/slashMenuUtils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../utils/slashMenuUtils')>();
  return {
    ...actual,
    processKeyboardTrigger: vi.fn(),
    isEmptyRect: vi.fn(actual.isEmptyRect),
    calculateMenuPosition: vi.fn(actual.calculateMenuPosition),
    calculateFallbackPosition: vi.fn(actual.calculateFallbackPosition),
  };
});

describe('useSlashMenuKeyboard - Pure Functions', () => {
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

describe('useSlashMenuKeyboard hook', () => {
  const registerCommand = vi.fn();
  const editor = {
    registerCommand,
    getElementByKey: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when the selection is invalid', () => {
    const onOpenMenu = vi.fn();
    const selection = { isCollapsed: () => false };
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    registerCommand.mockImplementation((_command, handler) => {
      const result = handler({ key: '/' });
      expect(result).toBe(false);
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuKeyboard({ editor: editor as never, onOpenMenu }),
    );

    expect(onOpenMenu).not.toHaveBeenCalled();
  });

  it('returns false when trigger detection says not to open', () => {
    const onOpenMenu = vi.fn();
    const anchorNode = {
      getNode: () => ({
        getTextContent: () => 'text',
        getKey: () => 'node-key',
      }),
      offset: 4,
    };
    const selection = {
      isCollapsed: () => true,
      anchor: anchorNode,
    };
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isTextNode as Mock).mockReturnValue(true);
    ($isElementNode as Mock).mockReturnValue(false);
    (processKeyboardTrigger as Mock).mockReturnValue({ shouldTrigger: false });
    registerCommand.mockImplementation((_command, handler) => {
      const result = handler({ key: '/' });
      expect(result).toBe(false);
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuKeyboard({ editor: editor as never, onOpenMenu }),
    );

    expect(onOpenMenu).not.toHaveBeenCalled();
  });

  it('uses fallback positioning for empty element rects when an editor element exists', () => {
    const onOpenMenu = vi.fn();
    const anchorNode = {
      getTextContent: () => '',
      getKey: () => 'node-key',
    };
    const selection = {
      isCollapsed: () => true,
      anchor: {
        getNode: () => anchorNode,
        offset: 0,
      },
    };
    const domRange = {
      getBoundingClientRect: () => ({ width: 0, height: 0 }),
    };
    const elementRect = { top: 20, left: 30 };
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isTextNode as Mock).mockReturnValue(false);
    ($isElementNode as Mock).mockReturnValue(true);
    (processKeyboardTrigger as Mock).mockReturnValue({
      shouldTrigger: true,
      isEmptyElement: true,
    });
    editor.getElementByKey = vi.fn(() => ({
      getBoundingClientRect: () => elementRect,
    }));
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => domRange,
    } as unknown as Selection);
    (calculateFallbackPosition as Mock).mockReturnValue({ top: 40, left: 30 });
    registerCommand.mockImplementation((command, handler) => {
      if (command === KEY_DOWN_COMMAND) {
        handler({ key: '/' });
      }
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuKeyboard({ editor: editor as never, onOpenMenu }),
    );

    expect(onOpenMenu).toHaveBeenCalledWith(
      { top: 40, left: 30 },
      'node-key',
      0,
    );
  });

  it('uses direct range positioning when the rect is not empty', () => {
    const onOpenMenu = vi.fn();
    const anchorNode = {
      getTextContent: () => '/table',
      getKey: () => 'node-key',
    };
    const selection = {
      isCollapsed: () => true,
      anchor: {
        getNode: () => anchorNode,
        offset: 2,
      },
    };
    const domRange = {
      getBoundingClientRect: () => ({
        bottom: 100,
        left: 50,
        width: 10,
        height: 10,
      }),
    };
    ($getSelection as Mock).mockReturnValue(selection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isTextNode as Mock).mockReturnValue(true);
    ($isElementNode as Mock).mockReturnValue(false);
    (processKeyboardTrigger as Mock).mockReturnValue({
      shouldTrigger: true,
      isEmptyElement: false,
    });
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => domRange,
    } as unknown as Selection);
    (calculateMenuPosition as Mock).mockReturnValue({ top: 104, left: 50 });
    registerCommand.mockImplementation((command, handler) => {
      if (command === KEY_DOWN_COMMAND) {
        handler({ key: '/' });
      }
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuKeyboard({ editor: editor as never, onOpenMenu }),
    );

    expect(onOpenMenu).toHaveBeenCalledWith(
      { top: 104, left: 50 },
      'node-key',
      2,
    );
  });
});
