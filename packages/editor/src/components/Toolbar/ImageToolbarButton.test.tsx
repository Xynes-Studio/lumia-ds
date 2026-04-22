import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageToolbarButton } from './ImageToolbarButton';
import { vi, describe, beforeEach, it, expect, Mock } from 'vitest';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMediaContext } from '../../EditorProvider';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
} from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createImageBlockNode } from '../../nodes/ImageBlockNode/ImageBlockNode';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';

// Mock dependencies
vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

vi.mock('lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lexical')>();
  return {
    ...actual,
    $createParagraphNode: vi.fn(),
    $insertNodes: vi.fn(),
    $isRootOrShadowRoot: vi.fn(),
  };
});

vi.mock('@lexical/utils', () => ({
  $wrapNodeInElement: vi.fn(),
}));

vi.mock('../../nodes/ImageBlockNode/ImageBlockNode', () => ({
  $createImageBlockNode: vi.fn(),
}));

vi.mock('../../plugins/InsertImagePlugin', () => ({
  INSERT_IMAGE_BLOCK_COMMAND: 'INSERT_IMAGE_BLOCK_COMMAND',
}));

vi.mock('@lumia-ui/components', () => ({
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
      <button onClick={() => onInsertFromUrl('https://example.com/image.jpg')}>
        Insert URL
      </button>
      <button
        onClick={() =>
          onInsertFromFile(
            new File(['image'], 'example.png', { type: 'image/png' }),
          )
        }
      >
        Insert File
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('ImageToolbarButton', () => {
  const mockDispatchCommand = vi.fn();
  const mockUpdate = vi.fn((callback: () => void) => callback());
  const nodeMap = new Map<
    string,
    { __type: string; getWritable: () => Record<string, unknown> }
  >();
  const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
    getEditorState: vi.fn(() => ({
      read: vi.fn((callback: () => unknown) => callback()),
      _nodeMap: nodeMap,
    })),
    _editorState: {
      _nodeMap: nodeMap,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    nodeMap.clear();
    (useLexicalComposerContext as Mock).mockReturnValue([mockEditor]);
    (useMediaContext as Mock).mockReturnValue(null);
    ($isRootOrShadowRoot as Mock).mockReturnValue(true);
    ($createParagraphNode as Mock).mockReturnValue({});
    ($wrapNodeInElement as Mock).mockReturnValue({ selectEnd: vi.fn() });
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL: vi.fn(() => 'blob:image-preview'),
      },
      configurable: true,
    });
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

    expect(mockDispatchCommand).toHaveBeenCalledWith(
      INSERT_IMAGE_BLOCK_COMMAND,
      {
        src: 'https://example.com/image.jpg',
        alt: '',
      },
    );
  });

  it('closes popover when cancel is clicked', () => {
    render(<ImageToolbarButton />);

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Popover should still be in DOM but a state change happened
    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('shows alt text option for images', () => {
    render(<ImageToolbarButton />);

    const mediaInsert = screen.getByTestId('media-insert-tabs');
    expect(mediaInsert).toHaveAttribute('data-media-type', 'image');
  });

  it('uploads an image file and updates the inserted node on success', async () => {
    const writable = { __src: '', __status: '' };
    nodeMap.set('image-key', {
      __type: 'image-block',
      getWritable: () => writable,
    });
    const uploadFile = vi.fn().mockResolvedValue({
      url: 'https://cdn.example/final-image.png',
    });
    const onUploadStart = vi.fn();
    const onUploadComplete = vi.fn();
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: {
        uploadFile,
      },
      callbacks: {
        onUploadStart,
        onUploadComplete,
      },
    });
    ($createImageBlockNode as Mock).mockReturnValue({
      getParentOrThrow: () => ({ type: 'root' }),
      getKey: () => 'image-key',
    });

    render(<ImageToolbarButton />);
    fireEvent.click(screen.getByText('Insert File'));

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(onUploadStart).toHaveBeenCalled();
    expect($insertNodes).toHaveBeenCalled();
    expect($wrapNodeInElement).toHaveBeenCalled();
    expect(writable.__src).toBe('https://cdn.example/final-image.png');
    expect(writable.__status).toBe('uploaded');
  });

  it('marks the inserted node as errored when image upload fails', async () => {
    const writable = { __src: '', __status: '' };
    nodeMap.set('image-key', {
      __type: 'image-block',
      getWritable: () => writable,
    });
    const onUploadError = vi.fn();
    (useMediaContext as Mock).mockReturnValue({
      uploadAdapter: {
        uploadFile: vi.fn().mockRejectedValue(new Error('upload failed')),
      },
      callbacks: {
        onUploadError,
      },
    });
    ($createImageBlockNode as Mock).mockReturnValue({
      getParentOrThrow: () => ({ type: 'root' }),
      getKey: () => 'image-key',
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(<ImageToolbarButton />);
    fireEvent.click(screen.getByText('Insert File'));

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled();
    });

    expect(errorSpy).toHaveBeenCalled();
    expect(writable.__status).toBe('error');
  });
});
