import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBlockOutline } from './useBlockOutline';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ParagraphNode } from 'lexical';
import React from 'react';

// Mock nodes
class MockImageNode extends ParagraphNode {
  static getType() {
    return 'image-block';
  }
  static clone() {
    return new MockImageNode();
  }
  static importJSON() {
    return new MockImageNode();
  }
  exportJSON() {
    return { type: 'image-block', version: 1 } as ReturnType<
      ParagraphNode['exportJSON']
    >;
  }
  constructor() {
    super();
    (this as unknown as { __alt: string }).__alt = 'Mock Image';
  }
}

const mockNodes = [HeadingNode, QuoteNode, MockImageNode];

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
  it('should return outline with default paragraph', async () => {
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

  // Note: Testing with actual Lexical state updates in renderHook is tricky.
  // The above test verifies the hook works with the RichTextPlugin.
});
