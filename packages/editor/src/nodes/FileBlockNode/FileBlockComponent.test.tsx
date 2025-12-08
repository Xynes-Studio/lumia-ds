import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { FileBlockComponent } from './FileBlockComponent';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { ParagraphNode, TextNode } from 'lexical';
import { FileBlockNode } from './FileBlockNode';

// Mock useLexicalNodeSelection because it requires node to be in state
vi.mock('@lexical/react/useLexicalNodeSelection', () => ({
  useLexicalNodeSelection: vi.fn(),
}));

vi.mock('../../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

describe('FileBlockComponent', () => {
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <LexicalComposer
        initialConfig={{
          namespace: 'TestEditor',
          nodes: [ParagraphNode, TextNode, FileBlockNode],
          onError: (e) => console.error(e),
        }}
      >
        {children}
      </LexicalComposer>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return: [isSelected, setSelected, clearSelected]
    (useLexicalNodeSelection as Mock).mockReturnValue([
      false,
      vi.fn(),
      vi.fn(),
    ]);
  });

  it('renders uploaded file status correctly', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url="http://test.com/file.pdf"
          filename="test.pdf"
          size={1024}
          mime="application/pdf"
          status="uploaded"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    // Size formatting might vary (1024 bytes -> 1 KB)
    // Adjust expectation if needed or check parts
    expect(screen.getByText(/1\s*KB/i)).toBeInTheDocument();
  });

  it('renders uploading status', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url=""
          filename="uploading.pdf"
          size={0}
          mime="application/pdf"
          status="uploading"
        />
      </TestWrapper>,
    );

    // Check key element
    expect(screen.getByText('uploading.pdf')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url=""
          filename="error.pdf"
          size={0}
          mime="application/pdf"
          status="error"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Upload Failed')).toBeInTheDocument();
    expect(screen.getByTitle('error.pdf')).toBeInTheDocument();
  });
});
