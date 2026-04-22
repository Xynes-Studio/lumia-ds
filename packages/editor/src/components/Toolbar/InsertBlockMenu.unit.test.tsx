import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { InsertBlockMenu } from './InsertBlockMenu';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { getInsertableBlocks } from '../../blocks';
import { useMediaContext } from '../../EditorProvider';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
} from 'lexical';
import { $insertNodeToNearestRoot, $wrapNodeInElement } from '@lexical/utils';
import { $toggleTableHeaderRow } from '../../plugins/TableActionMenuPlugin/tableUtils';
import { $createImageBlockNode } from '../../nodes/ImageBlockNode/ImageBlockNode';
import { $createVideoBlockNode } from '../../nodes/VideoBlockNode';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../../plugins/InsertImagePlugin';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../../plugins/InsertVideoPlugin';
import { INSERT_FILE_BLOCK_COMMAND } from '../../plugins/InsertFilePlugin';
import { INSERT_PANEL_COMMAND } from '../../plugins/InsertPanelPlugin';
import { INSERT_STATUS_COMMAND } from '../../plugins/InsertStatusPlugin';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: vi.fn(),
}));

vi.mock('../../blocks', () => ({
  getInsertableBlocks: vi.fn(),
}));

vi.mock('../../EditorProvider', () => ({
  useMediaContext: vi.fn(),
}));

vi.mock('@lumia-ui/components', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Menu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('../MediaInsert', () => ({
  MediaInsertTabs: ({
    mediaType,
    onInsertFromUrl,
    onInsertFromFile,
    onCancel,
    showAltText,
  }: {
    mediaType: string;
    onInsertFromUrl: (url: string, metadata?: { alt?: string }) => void;
    onInsertFromFile: (file: File) => void;
    onCancel: () => void;
    showAltText?: boolean;
  }) => (
    <div data-testid={`${mediaType}-insert-tabs`}>
      <button
        onClick={() =>
          onInsertFromUrl(
            `https://cdn.example/${mediaType}`,
            showAltText ? { alt: 'Alt text' } : undefined,
          )
        }
      >
        {`Insert ${mediaType} URL`}
      </button>
      <button
        onClick={() =>
          onInsertFromFile(
            new File(
              [mediaType],
              `${mediaType}.${mediaType === 'image' ? 'png' : 'mp4'}`,
              {
                type: mediaType === 'image' ? 'image/png' : 'video/mp4',
              },
            ),
          )
        }
      >
        {`Insert ${mediaType} file`}
      </button>
      <button onClick={onCancel}>{`Cancel ${mediaType}`}</button>
    </div>
  ),
}));

vi.mock('lexical', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lexical')>();
  return {
    ...actual,
    $insertNodes: vi.fn(),
    $isRootOrShadowRoot: vi.fn(),
    $createParagraphNode: vi.fn(),
  };
});

vi.mock('@lexical/utils', () => ({
  $wrapNodeInElement: vi.fn(),
  $insertNodeToNearestRoot: vi.fn(),
}));

vi.mock('../../plugins/TableActionMenuPlugin/tableUtils', () => ({
  $toggleTableHeaderRow: vi.fn(),
}));

vi.mock('../../nodes/ImageBlockNode/ImageBlockNode', () => ({
  $createImageBlockNode: vi.fn(),
}));

vi.mock('../../nodes/VideoBlockNode', () => ({
  $createVideoBlockNode: vi.fn(),
}));

vi.mock('@lexical/table', () => ({
  INSERT_TABLE_COMMAND: 'INSERT_TABLE_COMMAND',
}));

vi.mock('../../plugins/InsertImagePlugin', () => ({
  INSERT_IMAGE_BLOCK_COMMAND: 'INSERT_IMAGE_BLOCK_COMMAND',
}));

vi.mock('../../plugins/InsertVideoPlugin', () => ({
  INSERT_VIDEO_BLOCK_COMMAND: 'INSERT_VIDEO_BLOCK_COMMAND',
}));

vi.mock('../../plugins/InsertFilePlugin', () => ({
  INSERT_FILE_BLOCK_COMMAND: 'INSERT_FILE_BLOCK_COMMAND',
}));

vi.mock('../../plugins/InsertPanelPlugin', () => ({
  INSERT_PANEL_COMMAND: 'INSERT_PANEL_COMMAND',
}));

vi.mock('../../plugins/InsertStatusPlugin', () => ({
  INSERT_STATUS_COMMAND: 'INSERT_STATUS_COMMAND',
}));

describe('InsertBlockMenu unit', () => {
  const dispatchCommand = vi.fn();
  const update = vi.fn((callback: () => void) => callback());
  const editorStateNodeMap = new Map<
    string,
    { __type: string; getWritable: () => Record<string, unknown> }
  >();
  const editor = {
    dispatchCommand,
    update,
    _editorState: {
      _nodeMap: editorStateNodeMap,
    },
  };
  const paragraphSelect = vi.fn();
  const selectEnd = vi.fn();
  const onUploadStart = vi.fn();
  const onUploadComplete = vi.fn();
  const onUploadError = vi.fn();
  const createObjectURL = vi.fn(() => 'blob:preview');
  const mediaConfig = {
    uploadAdapter: {
      uploadFile: vi.fn(),
    },
    callbacks: {
      onUploadStart,
      onUploadComplete,
      onUploadError,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    editorStateNodeMap.clear();
    (useLexicalComposerContext as Mock).mockReturnValue([editor]);
    (useMediaContext as Mock).mockReturnValue(mediaConfig);
    ($createParagraphNode as Mock).mockReturnValue({
      select: paragraphSelect,
    });
    ($wrapNodeInElement as Mock).mockReturnValue({ selectEnd });
    ($isRootOrShadowRoot as Mock).mockReturnValue(true);
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL,
      },
      configurable: true,
    });
  });

  it('dispatches table and status commands and toggles the header row', () => {
    vi.useFakeTimers();
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'table',
        label: 'Table',
        icon: () => null,
        insertAction: 'command',
      },
      {
        type: 'status',
        label: 'Status',
        icon: () => null,
        insertAction: 'command',
      },
    ]);

    render(<InsertBlockMenu />);

    fireEvent.click(screen.getByRole('button', { name: /table/i }));
    vi.runAllTimers();
    fireEvent.click(screen.getByRole('button', { name: /status/i }));

    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: false,
    });
    expect(update).toHaveBeenCalled();
    expect($toggleTableHeaderRow).toHaveBeenCalledWith(true);
    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_STATUS_COMMAND, {
      text: 'Status',
      color: 'info',
    });
  });

  it('warns when a simple insert block type has no handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'mystery',
        label: 'Mystery',
        icon: () => null,
        insertAction: 'command',
      },
    ]);

    render(<InsertBlockMenu />);
    fireEvent.click(screen.getByRole('button', { name: /mystery/i }));

    expect(warn).toHaveBeenCalledWith(
      'No simple insert handler for block type: mystery',
    );
  });

  it('dispatches image insertion from a URL', () => {
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'image',
        label: 'Image',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);

    render(<InsertBlockMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Insert image URL' }));

    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_IMAGE_BLOCK_COMMAND, {
      src: 'https://cdn.example/image',
      alt: 'Alt text',
    });
  });

  it('uploads an image file and updates the inserted node on success', async () => {
    const writable = { __src: '', __status: '' };
    editorStateNodeMap.set('image-key', {
      __type: 'image-block',
      getWritable: () => writable,
    });
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'image',
        label: 'Image',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);
    (mediaConfig.uploadAdapter.uploadFile as Mock).mockResolvedValue({
      url: 'https://cdn.example/final-image.png',
    });
    ($createImageBlockNode as Mock).mockReturnValue({
      getParentOrThrow: () => ({ type: 'root' }),
      getKey: () => 'image-key',
    });

    render(<InsertBlockMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Insert image file' }));

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(onUploadStart).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect($insertNodes).toHaveBeenCalled();
    expect($wrapNodeInElement).toHaveBeenCalled();
    expect(writable.__src).toBe('https://cdn.example/final-image.png');
    expect(writable.__status).toBe('uploaded');
  });

  it('marks an image node as errored when upload fails', async () => {
    const writable = { __src: '', __status: '' };
    editorStateNodeMap.set('image-key', {
      __type: 'image-block',
      getWritable: () => writable,
    });
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'image',
        label: 'Image',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);
    (mediaConfig.uploadAdapter.uploadFile as Mock).mockRejectedValue(
      new Error('upload failed'),
    );
    ($createImageBlockNode as Mock).mockReturnValue({
      getParentOrThrow: () => ({ type: 'root' }),
      getKey: () => 'image-key',
    });

    render(<InsertBlockMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Insert image file' }));

    await waitFor(() => {
      expect(onUploadError).toHaveBeenCalled();
    });

    expect(writable.__status).toBe('error');
  });

  it('dispatches video insertion from a URL and uploads video files', async () => {
    const writable = { __src: '', __status: '' };
    const insertAfter = vi.fn();
    editorStateNodeMap.set('video-key', {
      __type: 'video-block',
      getWritable: () => writable,
    });
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'video',
        label: 'Video',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);
    (mediaConfig.uploadAdapter.uploadFile as Mock).mockResolvedValue({
      url: 'https://cdn.example/final-video.mp4',
    });
    ($createVideoBlockNode as Mock).mockReturnValue({
      getKey: () => 'video-key',
      insertAfter,
    });
    ($createParagraphNode as Mock).mockReturnValue({
      select: paragraphSelect,
    });

    render(<InsertBlockMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Insert video URL' }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert video file' }));

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    });

    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_VIDEO_BLOCK_COMMAND, {
      src: 'https://cdn.example/video',
    });
    expect($insertNodeToNearestRoot).toHaveBeenCalled();
    expect(insertAfter).toHaveBeenCalled();
    expect(paragraphSelect).toHaveBeenCalled();
    expect(writable.__src).toBe('https://cdn.example/final-video.mp4');
    expect(writable.__status).toBe('uploaded');
  });

  it('dispatches file and panel insert commands', () => {
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'file',
        label: 'File',
        icon: () => null,
        insertAction: 'custom',
      },
      {
        type: 'panel',
        label: 'Panel',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);

    render(<InsertBlockMenu />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(['report'], 'report.pdf', { type: 'application/pdf' }),
        ],
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Success' }));

    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_FILE_BLOCK_COMMAND, {
      url: '',
      filename: 'report.pdf',
      size: 6,
      mime: 'application/pdf',
      file: expect.any(File),
    });
    expect(dispatchCommand).toHaveBeenCalledWith(INSERT_PANEL_COMMAND, {
      variant: 'success',
      title: 'Success',
    });
  });

  it('renders a fallback custom item for unknown block types', () => {
    (getInsertableBlocks as Mock).mockReturnValue([
      {
        type: 'unknown',
        label: 'Unknown',
        icon: () => null,
        insertAction: 'custom',
      },
    ]);

    render(<InsertBlockMenu />);

    expect(
      screen.getByRole('button', { name: /unknown/i }),
    ).toBeInTheDocument();
  });
});
