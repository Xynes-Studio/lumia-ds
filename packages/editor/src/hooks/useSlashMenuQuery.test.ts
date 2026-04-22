/**
 * Tests for useSlashMenuQuery hook logic.
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { useSlashMenuQuery } from './useSlashMenuQuery';
import {
  extractQueryWithCursor,
  isSlashStillPresent,
  isSelectionInValidNode,
  getCorrectedSlashIndex,
  processQueryUpdate,
} from '../utils/slashMenuUtils';
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';

vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(),
  $getSelection: vi.fn(),
  $isElementNode: vi.fn(),
  $isRangeSelection: vi.fn(),
  $isTextNode: vi.fn(),
}));

vi.mock('../utils/slashMenuUtils', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../utils/slashMenuUtils')>();
  return {
    ...actual,
    processQueryUpdate: vi.fn(),
  };
});

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

describe('useSlashMenuQuery hook', () => {
  const registerUpdateListener = vi.fn();
  const editor = { registerUpdateListener };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not register an update listener when the menu is closed', () => {
    renderHook(() =>
      useSlashMenuQuery({
        editor: editor as never,
        isOpen: false,
        triggerNodeKey: 'node-key',
        triggerOffset: 0,
        onUpdateQuery: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    expect(registerUpdateListener).not.toHaveBeenCalled();
  });

  it('closes the menu when processQueryUpdate requests closing', () => {
    const onClose = vi.fn();
    const onUpdateQuery = vi.fn();
    const node = { getKey: () => 'node-key', getTextContent: () => '/t' };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isElementNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockReturnValue(true);
    ($getSelection as Mock).mockReturnValue({
      anchor: {
        getNode: () => ({ getKey: () => 'node-key' }),
        offset: 1,
      },
    });
    ($isRangeSelection as Mock).mockReturnValue(true);
    (processQueryUpdate as Mock).mockReturnValue({
      shouldClose: true,
      shouldUpdate: false,
      query: '',
    });

    registerUpdateListener.mockImplementation((handler) => {
      handler({ editorState: { read: (callback: () => void) => callback() } });
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuQuery({
        editor: editor as never,
        isOpen: true,
        triggerNodeKey: 'node-key',
        triggerOffset: 0,
        onUpdateQuery,
        onClose,
      }),
    );

    expect(onClose).toHaveBeenCalled();
    expect(onUpdateQuery).not.toHaveBeenCalled();
  });

  it('updates the query from a text child under an element trigger node', () => {
    const onClose = vi.fn();
    const onUpdateQuery = vi.fn();
    const child = { getTextContent: () => '/image', getKey: () => 'child-key' };
    const node = { getFirstChild: () => child };
    ($getNodeByKey as Mock).mockReturnValue(node);
    ($isElementNode as Mock).mockImplementation(
      (value: unknown) => value === node,
    );
    ($isTextNode as Mock).mockImplementation(
      (value: unknown) => value === child,
    );
    ($getSelection as Mock).mockReturnValue({
      anchor: {
        getNode: () => child,
        offset: 6,
      },
    });
    ($isRangeSelection as Mock).mockReturnValue(true);
    (processQueryUpdate as Mock).mockReturnValue({
      shouldClose: false,
      shouldUpdate: true,
      query: 'image',
    });

    registerUpdateListener.mockImplementation((handler) => {
      handler({ editorState: { read: (callback: () => void) => callback() } });
      return vi.fn();
    });

    renderHook(() =>
      useSlashMenuQuery({
        editor: editor as never,
        isOpen: true,
        triggerNodeKey: 'node-key',
        triggerOffset: 0,
        onUpdateQuery,
        onClose,
      }),
    );

    expect(onUpdateQuery).toHaveBeenCalledWith('image');
    expect(onClose).not.toHaveBeenCalled();
  });
});
