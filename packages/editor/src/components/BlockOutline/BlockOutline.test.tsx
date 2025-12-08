import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockOutline } from './BlockOutline';
import { useEditorContext } from '../../EditorProvider';
import { useBlockOutline } from '../../hooks/useBlockOutline';
import * as registry from '../../blocks/registry';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';

// Mock the hooks and registry
vi.mock('../../EditorProvider', () => ({
  useEditorContext: vi.fn(),
}));

vi.mock('../../hooks/useBlockOutline', () => ({
  useBlockOutline: vi.fn(),
}));

vi.mock('../../blocks/registry', () => ({
  getBlockDefinition: vi.fn(),
}));

// Mock Lexical functions
const mockSelectStart = vi.fn();
const mockSelectNext = vi.fn();
vi.mock('lexical', () => ({
  $getNodeByKey: vi.fn(() => ({
    selectStart: mockSelectStart,
    selectNext: mockSelectNext,
  })),
  $isElementNode: vi.fn(() => true),
  ElementNode: class {},
}));

describe('BlockOutline', () => {
  const mockUseEditorContext = useEditorContext as Mock;
  const mockUseBlockOutline = useBlockOutline as Mock;
  const mockGetBlockDefinition = registry.getBlockDefinition as Mock;

  const mockEditor = {
    update: vi.fn((callback) => callback()),
    getElementByKey: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBlockDefinition.mockReturnValue({
      type: 'paragraph',
      label: 'Paragraph',
      icon: () => <span data-testid="icon">📄</span>,
    });
  });

  it('returns null when no editor is available', () => {
    mockUseEditorContext.mockReturnValue({
      editor: null,
      selectedBlock: null,
    });
    mockUseBlockOutline.mockReturnValue([]);

    const { container } = render(<BlockOutline />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "No blocks found" when blocks array is empty', () => {
    mockUseEditorContext.mockReturnValue({
      editor: mockEditor,
      selectedBlock: null,
    });
    mockUseBlockOutline.mockReturnValue([]);

    render(<BlockOutline />);
    expect(screen.getByText('No blocks found.')).toBeInTheDocument();
  });

  it('renders blocks with labels', () => {
    mockUseEditorContext.mockReturnValue({
      editor: mockEditor,
      selectedBlock: null,
    });
    mockUseBlockOutline.mockReturnValue([
      { id: 'block1', type: 'paragraph', label: 'First paragraph' },
      { id: 'block2', type: 'heading', label: 'My Heading' },
    ]);

    render(<BlockOutline />);
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('My Heading')).toBeInTheDocument();
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('highlights the active block', () => {
    mockUseEditorContext.mockReturnValue({
      editor: mockEditor,
      selectedBlock: { nodeKey: 'block1', blockType: 'paragraph' },
    });
    mockUseBlockOutline.mockReturnValue([
      { id: 'block1', type: 'paragraph', label: 'Active block' },
      { id: 'block2', type: 'paragraph', label: 'Inactive block' },
    ]);

    render(<BlockOutline />);

    const activeButton = screen.getByText('Active block').closest('button');
    const inactiveButton = screen.getByText('Inactive block').closest('button');

    expect(activeButton?.className).toContain('bg-blue-50');
    expect(inactiveButton?.className).not.toContain('bg-blue-50');
  });

  it('calls editor.update and scrolls into view when block is clicked', () => {
    const mockElement = {
      scrollIntoView: vi.fn(),
    };
    mockEditor.getElementByKey.mockReturnValue(mockElement);

    mockUseEditorContext.mockReturnValue({
      editor: mockEditor,
      selectedBlock: null,
    });
    mockUseBlockOutline.mockReturnValue([
      { id: 'block1', type: 'paragraph', label: 'Clickable block' },
    ]);

    render(<BlockOutline />);

    const button = screen.getByText('Clickable block');
    fireEvent.click(button);

    expect(mockEditor.update).toHaveBeenCalled();
    expect(mockEditor.getElementByKey).toHaveBeenCalledWith('block1');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('handles case when element is not found', () => {
    mockEditor.getElementByKey.mockReturnValue(null);

    mockUseEditorContext.mockReturnValue({
      editor: mockEditor,
      selectedBlock: null,
    });
    mockUseBlockOutline.mockReturnValue([
      { id: 'block1', type: 'paragraph', label: 'Block' },
    ]);

    render(<BlockOutline />);

    const button = screen.getByText('Block');
    fireEvent.click(button);

    expect(mockEditor.update).toHaveBeenCalled();
    // Should not throw when element is null
  });
});
