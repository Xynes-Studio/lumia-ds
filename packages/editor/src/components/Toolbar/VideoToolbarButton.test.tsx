import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoToolbarButton } from './VideoToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMediaContext } from '../../EditorProvider';

// Mock Lexical helper functions
vi.mock('../../nodes/VideoBlockNode', () => ({
  $createVideoBlockNode: vi.fn(() => ({
    getKey: vi.fn(() => 'video-node-key'),
    insertAfter: vi.fn(),
    getWritable: vi.fn(() => ({})),
    __type: 'video-block',
  })),
}));

vi.mock('@lexical/utils', () => ({
  $insertNodeToNearestRoot: vi.fn(),
}));

vi.mock('lexical', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  return {
    ...actual,
    $createParagraphNode: vi.fn(() => ({
      select: vi.fn(),
    })),
  };
});

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
    onInsertFromFile,
    onCancel,
  }: {
    mediaType: string;
    onInsertFromUrl: (url: string) => void;
    onInsertFromFile: (file: File) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="media-insert-tabs" data-media-type={mediaType}>
      <button
        onClick={() => onInsertFromUrl('https://youtube.com/watch?v=test')}
      >
        Insert URL
      </button>
      <button
        onClick={() => {
          const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
          onInsertFromFile(file);
        }}
      >
        Insert File
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('VideoToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: vi.fn((callback) => callback()),
    getEditorState: vi.fn(() => ({
      read: vi.fn(),
    })),
    _editorState: {
      _nodeMap: new Map(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    (useMediaContext as Mock).mockReturnValue(null);
  });

  it('renders the video button', () => {
    render(<VideoToolbarButton />);
    expect(
      screen.getByRole('button', { name: 'Insert Video' }),
    ).toBeInTheDocument();
  });

  it('renders MediaInsertTabs in popover', () => {
    render(<VideoToolbarButton />);
    expect(screen.getByTestId('media-insert-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('media-insert-tabs')).toHaveAttribute(
      'data-media-type',
      'video',
    );
  });

  it('dispatches command when URL is inserted', () => {
    render(<VideoToolbarButton />);

    fireEvent.click(screen.getByText('Insert URL'));

    expect(mockDispatchCommand).toHaveBeenCalled();
  });

  it('closes popover when cancel is clicked', () => {
    render(<VideoToolbarButton />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('passes video as media type to MediaInsertTabs', () => {
    render(<VideoToolbarButton />);

    const mediaInsert = screen.getByTestId('media-insert-tabs');
    expect(mediaInsert).toHaveAttribute('data-media-type', 'video');
  });

  describe('File Upload', () => {
    const mockUploadFile = vi
      .fn()
      .mockResolvedValue({ url: 'http://test.com/video.mp4' });
    const mockOnUploadStart = vi.fn();
    const mockOnUploadComplete = vi.fn();
    const mockOnUploadError = vi.fn();

    beforeEach(() => {
      // eslint-disable-next-line no-undef
      global.URL.createObjectURL = vi.fn(() => 'blob:test');
      (useMediaContext as Mock).mockReturnValue({
        uploadAdapter: {
          uploadFile: mockUploadFile,
        },
        callbacks: {
          onUploadStart: mockOnUploadStart,
          onUploadComplete: mockOnUploadComplete,
          onUploadError: mockOnUploadError,
        },
      });
    });

    it('calls onUploadStart when file is inserted', () => {
      render(<VideoToolbarButton />);
      fireEvent.click(screen.getByText('Insert File'));
      expect(mockOnUploadStart).toHaveBeenCalled();
    });

    it('triggers uploadAdapter.uploadFile', () => {
      render(<VideoToolbarButton />);
      fireEvent.click(screen.getByText('Insert File'));
      expect(mockUploadFile).toHaveBeenCalled();
    });

    it('calls editor.update to create optimistic node', () => {
      render(<VideoToolbarButton />);
      fireEvent.click(screen.getByText('Insert File'));
      expect(mockEditor.update).toHaveBeenCalled();
    });
  });
});
