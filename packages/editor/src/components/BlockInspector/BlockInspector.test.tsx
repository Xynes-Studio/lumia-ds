import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlockInspector } from './BlockInspector';
import { useEditorContext } from '../../EditorProvider';
import * as registry from '../../blocks/registry';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

// Mock the context hook
vi.mock('../../EditorProvider', () => ({
  useEditorContext: vi.fn(),
}));

// Mock the registry module
vi.mock('../../blocks/registry', () => ({
  getBlockDefinition: vi.fn(),
}));

// Mock Lumia components
vi.mock('@lumia/components', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

describe('BlockInspector', () => {
  const mockUseEditorContext = useEditorContext as Mock;
  const mockGetBlockDefinition = registry.getBlockDefinition as Mock;

  beforeEach(() => {
    mockUseEditorContext.mockClear();
    mockGetBlockDefinition.mockClear();
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

    mockGetBlockDefinition.mockReturnValue({
      type: 'paragraph',
      label: 'Paragraph',
      // No inspector
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

    // Mock inspector component that doesn't use Lexical context
    const MockImageInspector = ({ nodeKey }: { nodeKey: string }) => (
      <div>
        <div>Image inspector</div>
        <div>Node Key: {nodeKey}</div>
      </div>
    );

    mockGetBlockDefinition.mockReturnValue({
      type: 'image',
      label: 'Image',
      inspector: MockImageInspector,
    });

    render(<BlockInspector />);
    // Check for the text from the mock inspector
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

    // Mock inspector component that doesn't use Lexical context
    const MockPanelInspector = () => (
      <div>
        <div>Panel inspector</div>
      </div>
    );

    mockGetBlockDefinition.mockReturnValue({
      type: 'panel',
      label: 'Panel',
      inspector: MockPanelInspector,
    });

    render(<BlockInspector />);
    expect(screen.getByText('Panel inspector')).toBeInTheDocument();
  });
});
