import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolbarState } from './useToolbarState';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useFontsConfig } from '../useFontsConfig';
import {
  $createParagraphNode,
  $getSelection,
  $isDecoratorNode,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  $isTextNode,
  KEY_MODIFIER_COMMAND,
} from 'lexical';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $getNearestNodeOfType } from '@lexical/utils';

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

  it('opens the popover when inserting a new link', () => {
    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.insertLink();
    });

    expect(result.current.isPopoverOpen).toBe(true);
  });

  it('submits a link URL through the toggle link command', () => {
    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.setLinkUrl('https://example.com');
      result.current.setIsPopoverOpen(true);
    });

    act(() => {
      result.current.onLinkSubmit();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      TOGGLE_LINK_COMMAND,
      'https://example.com',
    );
    expect(result.current.isPopoverOpen).toBe(false);
  });

  it('removes the current link when submitting an empty URL', () => {
    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.onLinkSubmit();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(TOGGLE_LINK_COMMAND, null);
    expect(result.current.isPopoverOpen).toBe(false);
  });

  it('applies the selected font stack to the current range selection', () => {
    const mockSelection = { anchor: {}, focus: {}, getNodes: () => [] };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleFontChange('roboto');
    });

    expect(result.current.selectedFont).toBe('roboto');
    expect($patchStyleText).toHaveBeenCalledWith(mockSelection, {
      'font-family': "'Roboto', sans-serif",
    });
  });

  it('changes the current block type to paragraph', () => {
    const mockSelection = {
      anchor: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      focus: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      getNodes: () => [],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleBlockTypeChange('paragraph');
    });

    expect($setBlocksType).toHaveBeenCalled();

    const createBlock = ($setBlocksType as Mock).mock
      .calls[0][1] as () => unknown;
    createBlock();

    expect($createParagraphNode).toHaveBeenCalled();
  });

  it('changes the current block type to code', () => {
    const mockSelection = {
      anchor: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      focus: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      getNodes: () => [],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleBlockTypeChange('code');
    });

    expect($setBlocksType).toHaveBeenCalled();

    const createBlock = ($setBlocksType as Mock).mock
      .calls[0][1] as () => unknown;
    createBlock();

    expect($createCodeNode).toHaveBeenCalled();
  });

  it('changes the current block type to a heading', () => {
    const mockSelection = {
      anchor: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      focus: {
        getNode: () => ({
          getParent: () => null,
          getTopLevelElementOrThrow: () => null,
        }),
      },
      getNodes: () => [],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleBlockTypeChange('h1');
    });

    expect($setBlocksType).toHaveBeenCalled();

    const createBlock = ($setBlocksType as Mock).mock
      .calls[0][1] as () => unknown;
    createBlock();

    expect($createHeadingNode).toHaveBeenCalledWith('h1');
  });

  it('skips block type changes when the current selection is inside a decorator node', () => {
    const decoratorNode = {
      getParent: () => null,
      getTopLevelElementOrThrow: () => null,
    };
    const mockSelection = {
      anchor: { getNode: () => decoratorNode },
      focus: { getNode: () => decoratorNode },
      getNodes: () => [],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isDecoratorNode as Mock).mockImplementation(
      (node: unknown) => node === decoratorNode,
    );

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleBlockTypeChange('h2');
    });

    expect($setBlocksType).not.toHaveBeenCalled();
  });

  it('inserts unordered and ordered lists from the toolbar actions', () => {
    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.toggleBulletList();
      result.current.toggleNumberedList();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_UNORDERED_LIST_COMMAND,
      undefined,
    );
    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
  });

  it('opens the link popover from the keyboard shortcut handler', () => {
    renderHook(() => useToolbarState());

    const keyCommandRegistration = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === KEY_MODIFIER_COMMAND,
    );

    expect(keyCommandRegistration).toBeDefined();

    const handler = keyCommandRegistration?.[1] as (
      event: KeyboardEvent,
    ) => boolean;
    const event = {
      key: 'k',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(handler(event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('derives heading, link, and matched font state from the current selection', () => {
    const headingNode = { getTag: () => 'h2' };
    const parentLink = { getURL: () => 'https://linked.example' };
    const textNode = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => headingNode,
      getParent: () => parentLink,
      getStyle: () => "font-family: 'Roboto', sans-serif",
    };
    const mockSelection = {
      hasFormat: (format: string) =>
        ['bold', 'underline', 'code'].includes(format),
      anchor: { getNode: () => textNode },
      focus: { getNode: () => textNode },
      getNodes: () => [textNode],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockReturnValue(false);
    ($isHeadingNode as Mock).mockImplementation(
      (node: unknown) => node === headingNode,
    );
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isLinkNode as Mock).mockImplementation(
      (node: unknown) => node === parentLink,
    );
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === textNode,
    );

    const { result } = renderHook(() => useToolbarState());
    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.isBold).toBe(true);
    expect(result.current.isItalic).toBe(false);
    expect(result.current.isUnderline).toBe(true);
    expect(result.current.isCode).toBe(true);
    expect(result.current.blockType).toBe('h2');
    expect(result.current.isCodeBlock).toBe(false);
    expect(result.current.isLink).toBe(true);
    expect(result.current.linkUrl).toBe('https://linked.example');
    expect(result.current.selectedFont).toBe('roboto');

    act(() => {
      result.current.insertLink();
    });

    expect(result.current.isPopoverOpen).toBe(true);
    expect(result.current.linkUrl).toBe('https://linked.example');
  });

  it('derives bullet list state with mixed fonts and removes an active bullet list', () => {
    const listNode = { getListType: () => 'bullet' };
    const textNodeOne = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => listNode,
      getParent: () => null,
      getStyle: () => 'font-family: Inter, sans-serif',
    };
    const textNodeTwo = {
      getKey: () => 'node-2',
      getTopLevelElementOrThrow: () => listNode,
      getParent: () => null,
      getStyle: () => 'font-family: Roboto, sans-serif',
    };
    const mockSelection = {
      hasFormat: () => false,
      anchor: { getNode: () => textNodeOne },
      focus: { getNode: () => textNodeTwo },
      getNodes: () => [textNodeOne, textNodeTwo],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockImplementation(
      (node: unknown) => node === listNode,
    );
    ($getNearestNodeOfType as Mock).mockReturnValue(listNode);
    ($isHeadingNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isLinkNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === textNodeOne || node === textNodeTwo,
    );

    const { result } = renderHook(() => useToolbarState());
    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.blockType).toBe('paragraph');
    expect(result.current.isBulletList).toBe(true);
    expect(result.current.isNumberedList).toBe(false);
    expect(result.current.selectedFont).toBe('');

    act(() => {
      result.current.toggleBulletList();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      REMOVE_LIST_COMMAND,
      undefined,
    );
  });

  it('derives code block state, falls back to the default font, and replaces a bullet list with a numbered list', () => {
    const listNode = { getListType: () => 'bullet' };
    const textNode = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => listNode,
      getParent: () => null,
      getStyle: () => 'font-family: MysteryFont',
    };
    const mockSelection = {
      hasFormat: () => false,
      anchor: { getNode: () => textNode },
      focus: { getNode: () => textNode },
      getNodes: () => [textNode],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockImplementation(
      (node: unknown) => node === listNode,
    );
    ($getNearestNodeOfType as Mock).mockReturnValue({
      getListType: () => 'number',
    });
    ($isHeadingNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isLinkNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === textNode,
    );

    const { result } = renderHook(() => useToolbarState());
    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.isNumberedList).toBe(true);
    expect(result.current.selectedFont).toBe('inter');

    act(() => {
      result.current.toggleNumberedList();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      REMOVE_LIST_COMMAND,
      undefined,
    );

    const codeNode = {};
    const codeTextNode = {
      getKey: () => 'node-2',
      getTopLevelElementOrThrow: () => codeNode,
      getParent: () => null,
      getStyle: () => '',
    };
    ($getSelection as Mock).mockReturnValue({
      hasFormat: () => false,
      anchor: { getNode: () => codeTextNode },
      focus: { getNode: () => codeTextNode },
      getNodes: () => [codeTextNode],
    });
    ($isListNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockImplementation(
      (node: unknown) => node === codeNode,
    );
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === codeTextNode,
    );

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.blockType).toBe('code');
    expect(result.current.isCodeBlock).toBe(true);
    expect(result.current.selectedFont).toBe('inter');
  });

  it('returns false for non-link keyboard shortcuts', () => {
    renderHook(() => useToolbarState());

    const keyCommandRegistration = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === KEY_MODIFIER_COMMAND,
    );
    const handler = keyCommandRegistration?.[1] as (
      event: KeyboardEvent,
    ) => boolean;
    const event = {
      key: 'b',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    expect(handler(event)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('updates toolbar state from the selection-change command with a direct link node', () => {
    const paragraphNode = {};
    const anchorNode = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => paragraphNode,
      getParent: () => null,
    };
    const linkNode = {
      getURL: () => 'https://selection.example',
    };
    const mockSelection = {
      hasFormat: () => false,
      anchor: { getNode: () => anchorNode },
      focus: { getNode: () => anchorNode },
      getNodes: () => [linkNode],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockReturnValue(false);
    ($isHeadingNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockReturnValue(false);
    ($isLinkNode as Mock).mockImplementation(
      (node: unknown) => node === linkNode,
    );

    const { result } = renderHook(() => useToolbarState());
    const selectionChangeRegistration = mockRegisterCommand.mock.calls.find(
      (call) => call[0] === SELECTION_CHANGE_COMMAND,
    );
    const handler = selectionChangeRegistration?.[1] as () => boolean;

    act(() => {
      expect(handler()).toBe(false);
    });

    expect(result.current.isLink).toBe(true);
    expect(result.current.linkUrl).toBe('https://selection.example');
    expect(result.current.selectedFont).toBe('inter');
  });

  it('replaces a numbered list with a bullet list', () => {
    const listNode = { getListType: () => 'number' };
    const textNode = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => listNode,
      getParent: () => null,
      getStyle: () => '',
    };
    const mockSelection = {
      hasFormat: () => false,
      anchor: { getNode: () => textNode },
      focus: { getNode: () => textNode },
      getNodes: () => [textNode],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockImplementation(
      (node: unknown) => node === listNode,
    );
    ($getNearestNodeOfType as Mock).mockReturnValue(listNode);
    ($isHeadingNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === textNode,
    );
    ($isLinkNode as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useToolbarState());
    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.isNumberedList).toBe(true);

    act(() => {
      result.current.toggleBulletList();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      REMOVE_LIST_COMMAND,
      undefined,
    );
    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_UNORDERED_LIST_COMMAND,
      undefined,
    );
  });

  it('skips font patching for unknown fonts and non-range selections', () => {
    ($getSelection as Mock).mockReturnValue({});
    ($isRangeSelection as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleFontChange('missing-font');
      result.current.handleBlockTypeChange('h3');
    });

    expect(result.current.selectedFont).toBe('missing-font');
    expect($patchStyleText).not.toHaveBeenCalled();
    expect($setBlocksType).not.toHaveBeenCalled();
  });

  it('replaces a bullet list with a numbered list', () => {
    const listNode = { getListType: () => 'bullet' };
    const textNode = {
      getKey: () => 'node-1',
      getTopLevelElementOrThrow: () => listNode,
      getParent: () => null,
      getStyle: () => '',
    };
    const mockSelection = {
      hasFormat: () => false,
      anchor: { getNode: () => textNode },
      focus: { getNode: () => textNode },
      getNodes: () => [textNode],
    };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);
    ($isListNode as Mock).mockImplementation(
      (node: unknown) => node === listNode,
    );
    ($getNearestNodeOfType as Mock).mockReturnValue(listNode);
    ($isHeadingNode as Mock).mockReturnValue(false);
    ($isCodeNode as Mock).mockReturnValue(false);
    ($isTextNode as Mock).mockImplementation(
      (node: unknown) => node === textNode,
    );
    ($isLinkNode as Mock).mockReturnValue(false);

    const { result } = renderHook(() => useToolbarState());
    const updateListener = mockRegisterUpdateListener.mock
      .calls[0][0] as (payload: {
      editorState: { read: (callback: () => void) => void };
    }) => void;

    act(() => {
      updateListener({ editorState: { read: (callback) => callback() } });
    });

    expect(result.current.isBulletList).toBe(true);

    act(() => {
      result.current.toggleNumberedList();
    });

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      REMOVE_LIST_COMMAND,
      undefined,
    );
    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
  });

  it('skips applying font styles when the selected font id is unknown', () => {
    const mockSelection = { anchor: {}, focus: {}, getNodes: () => [] };
    ($getSelection as Mock).mockReturnValue(mockSelection);
    ($isRangeSelection as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useToolbarState());

    act(() => {
      result.current.handleFontChange('unknown-font');
    });

    expect(result.current.selectedFont).toBe('unknown-font');
    expect($patchStyleText).not.toHaveBeenCalled();
  });
});
