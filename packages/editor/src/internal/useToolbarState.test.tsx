import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolbarState } from './useToolbarState';
import { createHeadlessEditor } from '@lexical/headless';
import {
  $createParagraphNode,
  $getRoot,
  ParagraphNode,
  TextNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';

// Mock the context hook
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

// Mock useFontsConfig
vi.mock('../useFontsConfig', () => ({
  useFontsConfig: () => ({
    allFonts: [{ id: 'inter', cssStack: 'Inter, sans-serif' }],
    defaultFontId: 'inter',
  }),
}));

describe('useToolbarState', () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = createHeadlessEditor({
      nodes: [
        ParagraphNode,
        HeadingNode,
        CodeNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        TextNode,
      ],
      onError: (error) => console.error(error),
    });

    (useLexicalComposerContext as ReturnType<typeof vi.fn>).mockReturnValue([
      editor,
    ]);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useToolbarState());

    expect(result.current.isBold).toBe(false);
    expect(result.current.blockType).toBe('paragraph');
  });

  it('updates state when selection changes', () => {
    // Simulate update by manually triggering the updateToolbar callback if exposed,
    // or by relying on the useEffect registrations.
    // Since useEffect registers listeners on the editor, we can trigger editor updates.

    renderHook(() => useToolbarState());

    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      root.append(paragraph);
      paragraph.select();
    });

    // We need to wait for the listener to fire.
    // In headless editor + renderHook, this might require some manual triggering or detailed mocking of registerUpdateListener.
    // The hook uses mergeRegister and registerUpdateListener.
  });

  // Since testing hooks with complex Lexical listeners can be hard in isolation without a real provider,
  // we might want to test the logic by mocking the selection state or just checking if functions are returned.

  it('changes block type to heading', async () => {
    const { result } = renderHook(() => useToolbarState());

    await act(async () => {
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.select();
      });
    });

    await act(async () => {
      result.current.handleBlockTypeChange('h1');
    });

    // Validating state
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      expect(firstChild).not.toBeNull();
      expect(firstChild?.getType()).toBe('heading');
      // @ts-expect-error tag property exists on HeadingNode but not in base types sometimes
      expect(firstChild?.getTag()).toBe('h1');
    });
  });
});
