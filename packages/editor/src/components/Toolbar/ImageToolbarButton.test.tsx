import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageToolbarButton } from './ImageToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMediaContext } from '../../EditorProvider';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

vi.mock('@lumia/components', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock('../MediaInsert', () => ({
  MediaInsertTabs: ({
    mediaType,
    onInsertFromUrl,
    onCancel,
  }: {
    mediaType: string;
    onInsertFromUrl: (url: string) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="media-insert-tabs" data-media-type={mediaType}>
      <button onClick={() => onInsertFromUrl('https://example.com/image.jpg')}>
        Insert URL
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('ImageToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockUpdate = vi.fn((callback: () => void) => callback());
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
    getEditorState: vi.fn(() => ({
      read: vi.fn((callback: () => void) => callback()),
      _nodeMap: new Map(),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    (useMediaContext as Mock).mockReturnValue(null);
  });

  it('renders the image button', () => {
    render(<ImageToolbarButton />);
    expect(
      screen.getByRole('button', { name: 'Insert Image' }),
    ).toBeInTheDocument();
  });

  it('renders MediaInsertTabs in popover', () => {
    render(<ImageToolbarButton />);
    expect(screen.getByTestId('media-insert-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('media-insert-tabs')).toHaveAttribute(
      'data-media-type',
      'image',
    );
  });

  it('dispatches command when URL is inserted', () => {
    render(<ImageToolbarButton />);

    fireEvent.click(screen.getByText('Insert URL'));

    expect(mockDispatchCommand).toHaveBeenCalled();
  });
});
