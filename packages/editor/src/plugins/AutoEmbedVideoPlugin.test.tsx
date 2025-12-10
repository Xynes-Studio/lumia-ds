import { createHeadlessEditor } from '@lexical/headless';
import {
  $isVideoBlockNode,
  VideoBlockNode,
  $createVideoBlockNode,
} from '../nodes/VideoBlockNode';
import { AutoEmbedVideoPlugin } from './AutoEmbedVideoPlugin';
import {
  $createParagraphNode,
  $getRoot,
  PASTE_COMMAND,
  ParagraphNode,
  TextNode,
  LexicalEditor,
} from 'lexical';
import { render, waitFor, act } from '@testing-library/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React, { useEffect } from 'react';

/** Creates a mock ClipboardEvent for testing paste behavior */
function createPasteEvent(text: string) {
  return {
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    },
    preventDefault: vi.fn(),
  } as unknown as ClipboardEvent;
}

/** Component to capture editor instance after mount */
function EditorCapture({
  onReady,
}: {
  onReady: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Defer to ensure all effects have completed
    const timeoutId = setTimeout(() => onReady(editor), 0);
    return () => clearTimeout(timeoutId);
  }, [editor, onReady]);

  return null;
}

/** Test wrapper component with AutoEmbedVideoPlugin */
function TestEditor({
  onReady,
}: {
  onReady?: (editor: LexicalEditor) => void;
}) {
  const initialConfig = {
    namespace: 'test',
    nodes: [VideoBlockNode, ParagraphNode, TextNode],
    onError: (e: Error) => console.error('Lexical Error:', e),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable data-testid="editor" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <AutoEmbedVideoPlugin />
      {onReady && <EditorCapture onReady={onReady} />}
    </LexicalComposer>
  );
}

/** Helper to setup editor with initial paragraph selection */
async function setupEditorWithSelection(editor: LexicalEditor) {
  await act(async () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      root.append(p);
      p.select();
    });
  });
}

/** Helper to check if VideoBlockNode exists with expected properties */
function findVideoBlockNode(editor: LexicalEditor): {
  found: boolean;
  src?: string;
  provider?: string;
} {
  let result = {
    found: false,
    src: undefined as string | undefined,
    provider: undefined as string | undefined,
  };
  editor.getEditorState().read(() => {
    const root = $getRoot();
    for (const node of root.getChildren()) {
      if ($isVideoBlockNode(node)) {
        result = {
          found: true,
          src: node.getSrc(),
          provider: node.getProvider(),
        };
        break;
      }
    }
  });
  return result;
}

describe('AutoEmbedVideoPlugin', () => {
  describe('VideoBlockNode Creation', () => {
    it('creates VideoBlockNode with correct properties', () => {
      const headlessEditor = createHeadlessEditor({
        nodes: [VideoBlockNode, ParagraphNode, TextNode],
        onError: console.error,
      });

      headlessEditor.update(() => {
        const videoNode = $createVideoBlockNode({
          src: 'https://www.youtube.com/watch?v=test',
          provider: 'youtube',
          title: 'Test Video',
        });

        expect(videoNode.getType()).toBe('video-block');
        expect(videoNode.getSrc()).toBe('https://www.youtube.com/watch?v=test');
        expect(videoNode.getProvider()).toBe('youtube');
        expect(videoNode.getTitle()).toBe('Test Video');
      });
    });

    it('can insert VideoBlockNode into editor root', () => {
      const headlessEditor = createHeadlessEditor({
        nodes: [VideoBlockNode, ParagraphNode, TextNode],
        onError: console.error,
      });

      let insertedNode: VideoBlockNode | null = null;

      headlessEditor.update(() => {
        const root = $getRoot();
        const videoNode = $createVideoBlockNode({
          src: 'https://example.com/video',
          provider: 'html5',
          title: 'Test',
        });
        root.append(videoNode);
        insertedNode = videoNode;

        const children = root.getChildren();
        expect(children.length).toBeGreaterThan(0);
        expect(children.some((child) => $isVideoBlockNode(child))).toBe(true);
      });

      expect(insertedNode).not.toBeNull();
    });
  });

  describe('Plugin Integration', () => {
    let editorRef: LexicalEditor | null = null;

    beforeEach(() => {
      editorRef = null;
    });

    it('mounts correctly within LexicalComposer', async () => {
      render(
        <TestEditor
          onReady={(editor) => {
            editorRef = editor;
          }}
        />,
      );

      await waitFor(() => {
        expect(editorRef).not.toBeNull();
      });

      expect(editorRef).toBeDefined();
    });

    it('processes paste command with YouTube URL', async () => {
      render(
        <TestEditor
          onReady={(editor) => {
            editorRef = editor;
          }}
        />,
      );

      await waitFor(() => expect(editorRef).not.toBeNull());
      await setupEditorWithSelection(editorRef!);

      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const event = createPasteEvent(youtubeUrl);

      await act(async () => {
        editorRef!.dispatchCommand(PASTE_COMMAND, event);
      });

      await waitFor(() => {
        const result = findVideoBlockNode(editorRef!);
        expect(result.found).toBe(true);
        expect(result.src).toBe(youtubeUrl);
        expect(result.provider).toBe('youtube');
      });
    });

    it('processes paste command with Vimeo URL', async () => {
      render(
        <TestEditor
          onReady={(editor) => {
            editorRef = editor;
          }}
        />,
      );

      await waitFor(() => expect(editorRef).not.toBeNull());
      await setupEditorWithSelection(editorRef!);

      const vimeoUrl = 'https://vimeo.com/123456789';
      const event = createPasteEvent(vimeoUrl);

      await act(async () => {
        editorRef!.dispatchCommand(PASTE_COMMAND, event);
      });

      await waitFor(() => {
        const result = findVideoBlockNode(editorRef!);
        expect(result.found).toBe(true);
        expect(result.src).toBe(vimeoUrl);
        expect(result.provider).toBe('vimeo');
      });
    });

    it('ignores non-video URLs and plain text', async () => {
      render(
        <TestEditor
          onReady={(editor) => {
            editorRef = editor;
          }}
        />,
      );

      await waitFor(() => expect(editorRef).not.toBeNull());
      await setupEditorWithSelection(editorRef!);

      const text = 'Just some random text';
      const event = createPasteEvent(text);

      await act(async () => {
        editorRef!.dispatchCommand(PASTE_COMMAND, event);
      });

      // Should NOT have VideoBlockNode
      const result = findVideoBlockNode(editorRef!);
      expect(result.found).toBe(false);
    });
  });
});
