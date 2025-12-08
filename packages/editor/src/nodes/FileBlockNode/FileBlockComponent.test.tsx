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

  it('shows retry and remove buttons on error', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url=""
          filename="error.pdf"
          size={0}
          status="error"
        />
      </TestWrapper>,
    );

    expect(screen.getByTitle('Retry')).toBeInTheDocument();
    expect(screen.getByTitle('Remove')).toBeInTheDocument();
  });

  it('shows download link for uploaded files', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url="http://test.com/file.pdf"
          filename="file.pdf"
          size={2048}
          status="uploaded"
        />
      </TestWrapper>,
    );

    expect(screen.getByTitle('Download')).toBeInTheDocument();
  });

  it('applies selection styling when selected', () => {
    (useLexicalNodeSelection as Mock).mockReturnValue([
      true, // isSelected
      vi.fn(),
      vi.fn(),
    ]);

    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url="http://test.com/file.pdf"
          filename="selected.pdf"
          size={1024}
          status="uploaded"
        />
      </TestWrapper>,
    );

    // Selected file should have ring styling class
    const card = screen.getByText('selected.pdf').closest('.flex');
    expect(card).toHaveClass('ring-2');
  });

  it('formats large file sizes correctly', () => {
    render(
      <TestWrapper>
        <FileBlockComponent
          nodeKey="test-key"
          url="http://test.com/file.pdf"
          filename="large.pdf"
          size={1048576} // 1 MB
          status="uploaded"
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/1\s*MB/i)).toBeInTheDocument();
  });
});
