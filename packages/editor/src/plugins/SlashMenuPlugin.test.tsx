import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ParagraphNode, TextNode } from 'lexical';
import { SlashMenuPlugin } from './SlashMenuPlugin';
import { MediaContext } from '../EditorProvider';

// FIX: Use importOriginal to get all icons, avoiding manual listing and Proxy hang
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  // Return actual exports - this ensures all icons are available
  // The hang was caused by using Proxy which intercepts all property access
  return actual;
});

function EditorWithSlashMenu() {
  const initialConfig = {
    namespace: 'TestEditor',
    nodes: [ParagraphNode, TextNode],
    onError: (error: Error) => console.error(error),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MediaContext.Provider value={null}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div>Type something...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <SlashMenuPlugin />
      </MediaContext.Provider>
    </LexicalComposer>
  );
}

describe('SlashMenuPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.getSelection = vi.fn().mockReturnValue({
      rangeCount: 1,
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ bottom: 100, left: 100, width: 0, height: 0 }),
      }),
      anchorNode: document.createElement('div'),
    });
  });

  afterEach(() => {
    cleanup();
  });

  test('renders without crashing', () => {
    const { container } = render(<EditorWithSlashMenu />);
    expect(container.querySelector('.editor-input')).toBeInTheDocument();
  });

  test('SlashMenuPlugin exports correctly', () => {
    expect(SlashMenuPlugin).toBeDefined();
    expect(typeof SlashMenuPlugin).toBe('function');
  });
});
