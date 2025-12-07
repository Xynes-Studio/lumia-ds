import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlockInspector } from './BlockInspector';
import { useEditorContext } from '../../EditorProvider';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

// Mock the context hook
vi.mock('../../EditorProvider', () => ({
  useEditorContext: vi.fn(),
}));

describe('BlockInspector', () => {
  const mockUseEditorContext = useEditorContext as Mock;

  beforeEach(() => {
    mockUseEditorContext.mockClear();
  });

  it('renders "No block selected" when selectedBlock is null', () => {
    mockUseEditorContext.mockReturnValue({
      selectedBlock: null,
    });

    render(<BlockInspector />);
    expect(screen.getByText('No block selected')).toBeInTheDocument();
  });

  it('renders "No configurable properties" when block has no inspector', () => {
    mockUseEditorContext.mockReturnValue({
      selectedBlock: {
        nodeKey: '1',
        blockType: 'paragraph', // Paragraph has no inspector defined
      },
    });

    render(<BlockInspector />);
    expect(screen.getByText('No configurable properties')).toBeInTheDocument();
  });

  it('renders Image Inspector when image block is selected', () => {
    mockUseEditorContext.mockReturnValue({
      selectedBlock: {
        nodeKey: '123',
        blockType: 'image',
      },
    });

    render(<BlockInspector />);
    // Check for the text from the placeholder inspector
    expect(screen.getByText('Image inspector')).toBeInTheDocument();
    expect(screen.getByText('Node Key: 123')).toBeInTheDocument();
  });

  it('renders Panel Inspector when panel block is selected', () => {
    mockUseEditorContext.mockReturnValue({
      selectedBlock: {
        nodeKey: '456',
        blockType: 'panel',
      },
    });

    render(<BlockInspector />);
    expect(screen.getByText('Panel inspector')).toBeInTheDocument();
  });
});
