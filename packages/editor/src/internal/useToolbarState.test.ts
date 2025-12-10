import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolbarState } from './useToolbarState';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useFontsConfig } from '../useFontsConfig';

// Mock all dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../useFontsConfig', () => ({
  useFontsConfig: vi.fn(),
}));

vi.mock('lexical', () => ({
  SELECTION_CHANGE_COMMAND: Symbol('SELECTION_CHANGE_COMMAND'),
  KEY_MODIFIER_COMMAND: Symbol('KEY_MODIFIER_COMMAND'),
  $getSelection: vi.fn(() => null),
  $isRangeSelection: vi.fn(() => false),
  $isTextNode: vi.fn(() => false),
  $createParagraphNode: vi.fn(),
  $isDecoratorNode: vi.fn(() => false),
}));

vi.mock('@lexical/utils', () => ({
  mergeRegister: vi.fn(
    (...fns: (() => void)[]) =>
      () =>
        fns.forEach((f) => f()),
  ),
  $getNearestNodeOfType: vi.fn(() => null),
}));

vi.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: Symbol('TOGGLE_LINK_COMMAND'),
  $isLinkNode: vi.fn(() => false),
}));

vi.mock('@lexical/code', () => ({
  $createCodeNode: vi.fn(),
  $isCodeNode: vi.fn(() => false),
}));

vi.mock('@lexical/selection', () => ({
  $setBlocksType: vi.fn(),
  $patchStyleText: vi.fn(),
}));

vi.mock('@lexical/rich-text', () => ({
  $isHeadingNode: vi.fn(() => false),
  $createHeadingNode: vi.fn(),
}));

vi.mock('@lexical/list', () => ({
  INSERT_UNORDERED_LIST_COMMAND: Symbol('INSERT_UNORDERED_LIST_COMMAND'),
  INSERT_ORDERED_LIST_COMMAND: Symbol('INSERT_ORDERED_LIST_COMMAND'),
  REMOVE_LIST_COMMAND: Symbol('REMOVE_LIST_COMMAND'),
  $isListNode: vi.fn(() => false),
  ListNode: class {},
}));

describe('useToolbarState', () => {
  const mockDispatchCommand = vi.fn();
  const mockRegisterUpdateListener = vi.fn(() => vi.fn());
  const mockRegisterCommand = vi.fn(() => vi.fn());
  const mockIsEditable = vi.fn(() => true);
  const mockUpdate = vi.fn((callback: () => void) => callback());

  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    registerUpdateListener: mockRegisterUpdateListener,
    registerCommand: mockRegisterCommand,
    isEditable: mockIsEditable,
    update: mockUpdate,
  };

  const mockFontsConfig = {
    defaultFontId: 'inter',
    allFonts: [
      { id: 'inter', label: 'Inter', cssStack: "'Inter', sans-serif" },
      { id: 'roboto', label: 'Roboto', cssStack: "'Roboto', sans-serif" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    (useFontsConfig as Mock).mockReturnValue(mockFontsConfig);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.isBold).toBe(false);
    expect(result.current.isItalic).toBe(false);
    expect(result.current.isUnderline).toBe(false);
    expect(result.current.isCode).toBe(false);
    expect(result.current.isLink).toBe(false);
    expect(result.current.blockType).toBe('paragraph');
    expect(result.current.isEditable).toBe(true);
  });

  it('provides editor reference', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.editor).toBe(mockEditor);
  });

  it('provides fontsConfig reference', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.fontsConfig).toBe(mockFontsConfig);
  });

  it('provides selectedFont state', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.selectedFont).toBe('inter');
  });

  it('registers update listener on mount', () => {
    renderHook(() => useToolbarState());

    expect(mockRegisterUpdateListener).toHaveBeenCalled();
  });

  it('registers selection change command', () => {
    renderHook(() => useToolbarState());

    expect(mockRegisterCommand).toHaveBeenCalled();
  });

  it('provides toggleBulletList function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.toggleBulletList).toBe('function');
  });

  it('provides toggleNumberedList function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.toggleNumberedList).toBe('function');
  });

  it('provides handleBlockTypeChange function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.handleBlockTypeChange).toBe('function');
  });

  it('provides handleFontChange function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.handleFontChange).toBe('function');
  });

  it('provides insertLink function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.insertLink).toBe('function');
  });

  it('provides onLinkSubmit function', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(typeof result.current.onLinkSubmit).toBe('function');
  });

  it('can toggle popover state', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.isPopoverOpen).toBe(false);

    act(() => {
      result.current.setIsPopoverOpen(true);
    });

    expect(result.current.isPopoverOpen).toBe(true);
  });

  it('can set link URL', () => {
    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.setLinkUrl('https://example.com');
    });

    expect(result.current.linkUrl).toBe('https://example.com');
  });
});
