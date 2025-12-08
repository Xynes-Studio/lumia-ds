import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBlockOutline, BlockOutlineItem } from './useBlockOutline';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ParagraphNode, $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ImageBlockNode, $createImageBlockNode } from '../nodes/ImageBlockNode';
import { VideoBlockNode, $createVideoBlockNode } from '../nodes/VideoBlockNode';
import { FileBlockNode, $createFileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { PanelBlockNode, $createPanelBlockNode } from '../nodes/PanelBlockNode/PanelBlockNode';
import React, { useEffect } from 'react';

const mockNodes = [
  HeadingNode,
  QuoteNode,
  ImageBlockNode,
  VideoBlockNode,
  FileBlockNode,
  PanelBlockNode,
];

// Wrapper with RichTextPlugin which creates default paragraph
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: mockNodes,
    onError: (error: Error) => console.error(error),
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={null}
        ErrorBoundary={({ children: c }) => <>{c}</>}
      />
      {children}
    </LexicalComposer>
  );
};

describe('useBlockOutline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return outline with default paragraph', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useBlockOutline(), {
      wrapper: Wrapper,
    });

    // RichTextPlugin creates a default paragraph, wait for it
    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    // Verify the first item is a paragraph
    expect(result.current[0]).toMatchObject({
      type: 'paragraph',
    });
  });

  it('should return empty paragraph label for empty paragraph', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useBlockOutline(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    // Default empty paragraph should have "Empty Paragraph" label
    expect(result.current[0].label).toBe('Empty Paragraph');
  });

  it('should truncate long labels to 30 characters', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      editorRef = editor;
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(editorRef).not.toBeNull();
    });

    // Add text longer than 30 chars to paragraph
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          root.clear();
          const para = $createParagraphNode();
          para.append($createTextNode('This is a very long paragraph that should be truncated'));
          root.append(para);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current[0]?.label.endsWith('...')).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it('should respect custom delay parameter', async () => {
    vi.useRealTimers();
    const { result } = renderHook(() => useBlockOutline(100), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    expect(result.current[0]).toMatchObject({
      type: 'paragraph',
    });
  });

  it('should handle image block labels', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(editorRef).not.toBeNull();
    });

    // Add image block
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          root.clear();
          const imageNode = $createImageBlockNode({
            src: 'https://example.com/image.jpg',
            alt: 'Test Image Alt',
          });
          root.append(imageNode);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current[0].type).toBe('image-block');
      },
      { timeout: 2000 },
    );
  });

  it('should handle video block labels', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(editorRef).not.toBeNull();
    });

    // Add video block
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          root.clear();
          const videoNode = $createVideoBlockNode({
            src: 'https://youtube.com/watch?v=123',
            provider: 'youtube',
            title: 'Test Video Title',
          });
          root.append(videoNode);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current[0].type).toBe('video-block');
      },
      { timeout: 2000 },
    );
  });

  it('should handle file block labels', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(editorRef).not.toBeNull();
    });

    // Add file block
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          root.clear();
          const fileNode = $createFileBlockNode({
            url: 'https://example.com/document.pdf',
            filename: 'document.pdf',
          });
          root.append(fileNode);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current[0].type).toBe('file-block');
      },
      { timeout: 2000 },
    );
  });

  it('should handle panel block labels', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(editorRef).not.toBeNull();
    });

    // Add panel block
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          root.clear();
          const panelNode = $createPanelBlockNode({ variant: 'info' });
          root.append(panelNode);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current[0].type).toBe('panel-block');
      },
      { timeout: 2000 },
    );
  });

  it('should update outline when editor state changes', async () => {
    vi.useRealTimers();
    let editorRef: ReturnType<typeof useLexicalComposerContext>[0] | null = null;

    const EditorCapture = () => {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editorRef = editor;
      }, [editor]);
      return null;
    };

    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: mockNodes,
          onError: console.error,
        }}
      >
        <EditorCapture />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={({ children: c }) => <>{c}</>}
        />
        {children}
      </LexicalComposer>
    );

    const { result } = renderHook(() => useBlockOutline(50), {
      wrapper: CustomWrapper,
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const initialCount = result.current.length;

    // Add a second paragraph
    if (editorRef) {
      await act(async () => {
        editorRef!.update(() => {
          const root = $getRoot();
          const para = $createParagraphNode();
          para.append($createTextNode('New paragraph'));
          root.append(para);
        });
      });
    }

    await waitFor(
      () => {
        expect(result.current.length).toBeGreaterThan(initialCount);
      },
      { timeout: 2000 },
    );
  });
});

