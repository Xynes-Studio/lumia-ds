import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useSlashMediaUpload,
  type SlashMediaUploadOptions,
} from './useSlashMediaUpload';
import { INSERT_IMAGE_BLOCK_COMMAND } from '../plugins/InsertImagePlugin';
import { INSERT_VIDEO_BLOCK_COMMAND } from '../plugins/InsertVideoPlugin';
import { INSERT_FILE_BLOCK_COMMAND } from '../plugins/InsertFilePlugin';

vi.mock('lexical', () => ({
  $insertNodes: vi.fn(),
  $isRootOrShadowRoot: vi.fn(() => true),
  $createParagraphNode: vi.fn(() => {
    const paragraphNode = {
      select: vi.fn(),
      selectEnd: vi.fn(),
    };
    return paragraphNode;
  }),
}));

vi.mock('@lexical/utils', () => ({
  $wrapNodeInElement: vi.fn(() => ({
    selectEnd: vi.fn(),
  })),
  $insertNodeToNearestRoot: vi.fn(),
}));

vi.mock('../plugins/InsertImagePlugin', () => ({
  INSERT_IMAGE_BLOCK_COMMAND: Symbol('INSERT_IMAGE_BLOCK_COMMAND'),
}));

vi.mock('../plugins/InsertVideoPlugin', () => ({
  INSERT_VIDEO_BLOCK_COMMAND: Symbol('INSERT_VIDEO_BLOCK_COMMAND'),
}));

vi.mock('../plugins/InsertFilePlugin', () => ({
  INSERT_FILE_BLOCK_COMMAND: Symbol('INSERT_FILE_BLOCK_COMMAND'),
}));

type WritableNode = Record<string, unknown> & {
  __type: string;
};

let activeNodeMap: Map<
  string,
  { __type: string; getWritable: () => WritableNode }
>;

const createMockNode = (key: string, type: string) => {
  const writable: WritableNode = { __type: type };
  const node = {
    __type: type,
    getWritable: () => writable,
  };

  activeNodeMap.set(key, node);

  return {
    getKey: () => key,
    getParentOrThrow: () => ({ __type: 'root' }),
    insertAfter: vi.fn(),
  };
};

vi.mock('../nodes/ImageBlockNode/ImageBlockNode', () => ({
  $createImageBlockNode: vi.fn(() =>
    createMockNode('image-key', 'image-block'),
  ),
}));

vi.mock('../nodes/VideoBlockNode', () => ({
  $createVideoBlockNode: vi.fn(() =>
    createMockNode('video-key', 'video-block'),
  ),
}));

vi.mock('../nodes/FileBlockNode/FileBlockNode', () => ({
  $createFileBlockNode: vi.fn(() => createMockNode('file-key', 'file-block')),
}));

describe('useSlashMediaUpload integration', () => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  const createEditor = () => {
    activeNodeMap = new Map();

    return {
      dispatchCommand: vi.fn(() => true),
      update: vi.fn((callback: () => void) => callback()),
      getEditorState: () => ({
        read: (callback: () => unknown) => callback(),
      }),
      _editorState: {
        _nodeMap: activeNodeMap,
      },
    };
  };

  const renderSlashUpload = (
    overrides: Partial<SlashMediaUploadOptions> = {},
  ) => {
    const editor = overrides.editor ?? createEditor();
    const onComplete = overrides.onComplete ?? vi.fn();
    const mediaConfig =
      'mediaConfig' in overrides
        ? overrides.mediaConfig
        : ({
            uploadAdapter: {
              uploadFile: vi.fn().mockResolvedValue({
                url: 'https://cdn.example.com/default',
                mime: 'application/octet-stream',
                size: 1024,
              }),
            },
            callbacks: {
              onUploadStart: vi.fn(),
              onUploadProgress: vi.fn(),
              onUploadComplete: vi.fn(),
              onUploadError: vi.fn(),
            },
          } as SlashMediaUploadOptions['mediaConfig']);

    const hook = renderHook(() =>
      useSlashMediaUpload({
        editor,
        mediaConfig,
        onComplete,
      }),
    );

    return {
      ...hook,
      editor,
      mediaConfig,
      onComplete,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockClear();
    activeNodeMap = new Map();
  });

  it('dispatches URL-based insert commands and completes the flow', () => {
    const { result, editor, onComplete } = renderSlashUpload();

    act(() => {
      result.current.handleInsertImageFromUrl(
        'https://cdn.example.com/photo.png',
        {
          alt: 'Photo',
        },
      );
      result.current.handleInsertVideoFromUrl(
        'https://cdn.example.com/video.mp4',
      );
      result.current.handleInsertFileFromUrl(
        'https://cdn.example.com/files/brief.pdf',
      );
    });

    expect(editor.dispatchCommand).toHaveBeenNthCalledWith(
      1,
      INSERT_IMAGE_BLOCK_COMMAND,
      {
        src: 'https://cdn.example.com/photo.png',
        alt: 'Photo',
      },
    );
    expect(editor.dispatchCommand).toHaveBeenNthCalledWith(
      2,
      INSERT_VIDEO_BLOCK_COMMAND,
      {
        src: 'https://cdn.example.com/video.mp4',
      },
    );
    expect(editor.dispatchCommand).toHaveBeenNthCalledWith(
      3,
      INSERT_FILE_BLOCK_COMMAND,
      {
        url: 'https://cdn.example.com/files/brief.pdf',
        filename: 'brief.pdf',
      },
    );
    expect(onComplete).toHaveBeenCalledTimes(3);
  });

  it('returns early for file uploads when no upload adapter is available', () => {
    const { result, editor, onComplete } = renderSlashUpload({
      mediaConfig: null,
    });

    act(() => {
      result.current.handleInsertImageFromFile(
        new File(['image'], 'photo.png', { type: 'image/png' }),
      );
    });

    expect(editor.update).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('uploads an image file and updates the node to uploaded', async () => {
    const uploadFile = vi.fn().mockResolvedValue({
      url: 'https://cdn.example.com/photo.png',
      mime: 'image/png',
      size: 2048,
    });
    const callbacks = {
      onUploadStart: vi.fn(),
      onUploadProgress: vi.fn(),
      onUploadComplete: vi.fn(),
      onUploadError: vi.fn(),
    };
    const { result, onComplete } = renderSlashUpload({
      mediaConfig: {
        uploadAdapter: { uploadFile },
        callbacks,
      },
    });
    const file = new File(['image'], 'photo.png', { type: 'image/png' });

    act(() => {
      result.current.handleInsertImageFromFile(file);
    });

    await waitFor(() => {
      const writable = activeNodeMap.get('image-key')?.getWritable();
      expect(writable?.__src).toBe('https://cdn.example.com/photo.png');
      expect(writable?.__status).toBe('uploaded');
    });

    expect(callbacks.onUploadStart).toHaveBeenCalledWith(
      file,
      'image',
      'file-picker',
    );
    expect(callbacks.onUploadComplete).toHaveBeenCalledWith(file, {
      url: 'https://cdn.example.com/photo.png',
      mime: 'image/png',
      size: 2048,
    });
    expect(callbacks.onUploadError).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('marks a video upload as error when the adapter rejects', async () => {
    const callbacks = {
      onUploadStart: vi.fn(),
      onUploadProgress: vi.fn(),
      onUploadComplete: vi.fn(),
      onUploadError: vi.fn(),
    };
    const uploadFailure = new Error('video upload failed');
    const { result } = renderSlashUpload({
      mediaConfig: {
        uploadAdapter: {
          uploadFile: vi.fn().mockRejectedValue(uploadFailure),
        },
        callbacks,
      },
    });
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

    act(() => {
      result.current.handleInsertVideoFromFile(file);
    });

    await waitFor(() => {
      const writable = activeNodeMap.get('video-key')?.getWritable();
      expect(writable?.__status).toBe('error');
    });

    expect(callbacks.onUploadStart).toHaveBeenCalledWith(
      file,
      'video',
      'file-picker',
    );
    expect(callbacks.onUploadError).toHaveBeenCalledWith(file, uploadFailure);
    expect(callbacks.onUploadComplete).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Upload failed:',
      uploadFailure,
    );
  });

  it('passes progress updates through file uploads and stores the uploaded URL', async () => {
    const callbacks = {
      onUploadStart: vi.fn(),
      onUploadProgress: vi.fn(),
      onUploadComplete: vi.fn(),
      onUploadError: vi.fn(),
    };
    const file = new File(['report'], 'report.pdf', {
      type: 'application/pdf',
    });
    const uploadFile = vi
      .fn()
      .mockImplementation(
        async (
          uploadedFile: File,
          options?: { onProgress?: (progress: number) => void },
        ) => {
          options?.onProgress?.(55);
          return {
            url: 'https://cdn.example.com/report.pdf',
            mime: uploadedFile.type,
            size: uploadedFile.size,
          };
        },
      );
    const { result } = renderSlashUpload({
      mediaConfig: {
        uploadAdapter: { uploadFile },
        callbacks,
      },
    });

    act(() => {
      result.current.handleInsertFileFromFile(file);
    });

    await waitFor(() => {
      const writable = activeNodeMap.get('file-key')?.getWritable();
      expect(writable?.__url).toBe('https://cdn.example.com/report.pdf');
      expect(writable?.__status).toBe('uploaded');
    });

    expect(callbacks.onUploadStart).toHaveBeenCalledWith(
      file,
      'file',
      'file-picker',
    );
    expect(callbacks.onUploadProgress).toHaveBeenCalledWith(file, 55);
    expect(callbacks.onUploadComplete).toHaveBeenCalledWith(file, {
      url: 'https://cdn.example.com/report.pdf',
      mime: 'application/pdf',
      size: file.size,
    });
  });
});
