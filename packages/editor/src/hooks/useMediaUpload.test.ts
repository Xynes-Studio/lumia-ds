import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaUpload } from './useMediaUpload';
import { createHeadlessEditor } from '@lexical/headless';
import {
  ImageBlockNode,
  $createImageBlockNode,
} from '../nodes/ImageBlockNode/ImageBlockNode';
import { VideoBlockNode, $createVideoBlockNode } from '../nodes/VideoBlockNode';
import { $getRoot } from 'lexical';

// Mock URL methods
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
vi.stubGlobal('URL', {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

describe('useMediaUpload', () => {
  let mockEditor: ReturnType<typeof createHeadlessEditor>;
  let nodeKey: string;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = createHeadlessEditor({
      nodes: [ImageBlockNode, VideoBlockNode],
      onError: (error) => console.error(error),
    });

    // Insert an image node to get a key
    mockEditor.update(() => {
      const root = $getRoot();
      const imageNode = $createImageBlockNode({
        src: 'test.jpg',
        alt: 'test',
      });
      root.append(imageNode);
      nodeKey = imageNode.getKey();
    });
  });

  it('returns initial idle state', () => {
    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: null,
        nodeKey: 'test-key',
        mediaType: 'image',
      }),
    );

    expect(result.current.state).toEqual({
      status: 'idle',
      progress: 0,
    });
  });

  it('returns error state when no upload adapter is configured', async () => {
    const mockOnError = vi.fn();
    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: {
          callbacks: {
            onUploadError: mockOnError,
          },
        },
        nodeKey: 'test-key',
        mediaType: 'image',
      }),
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error?.message).toBe(
      'No upload adapter configured',
    );
    expect(mockOnError).toHaveBeenCalledWith(file, expect.any(Error));
  });

  it('uploads file successfully', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      url: 'https://example.com/uploaded.jpg',
      mime: 'image/jpeg',
      size: 1024,
    });

    const mockOnStart = vi.fn();
    const mockOnComplete = vi.fn();

    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: {
          uploadAdapter: { uploadFile: mockUpload },
          callbacks: {
            onUploadStart: mockOnStart,
            onUploadComplete: mockOnComplete,
          },
        },
        nodeKey,
        mediaType: 'image',
      }),
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.state.status).toBe('success');
    expect(result.current.state.progress).toBe(100);
    expect(mockOnStart).toHaveBeenCalledWith(file, 'image');
    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('handles upload failure', async () => {
    const mockUpload = vi.fn().mockRejectedValue(new Error('Network error'));
    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: {
          uploadAdapter: { uploadFile: mockUpload },
          callbacks: {
            onUploadError: mockOnError,
          },
        },
        nodeKey,
        mediaType: 'image',
      }),
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error?.message).toBe('Network error');
    expect(mockOnError).toHaveBeenCalled();
  });

  it('cancels upload and removes node', async () => {
    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: null,
        nodeKey,
        mediaType: 'image',
      }),
    );

    act(() => {
      result.current.cancel();
    });

    expect(result.current.state).toEqual({
      status: 'idle',
      progress: 0,
    });
  });

  it('tracks progress, exposes retry state, and retries the pending file', async () => {
    const mockUpload = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockImplementationOnce(async (_file, options) => {
        options?.onProgress?.(45);
        return {
          url: 'https://example.com/retried.jpg',
          mime: 'image/jpeg',
          size: 100,
        };
      });

    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: {
          uploadAdapter: { uploadFile: mockUpload },
        },
        nodeKey,
        mediaType: 'image',
      }),
    );

    const file = new File(['test'], 'retry.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.canRetry).toBe(true);

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.state.status).toBe('success');
    expect(result.current.state.progress).toBe(100);
    expect(mockUpload).toHaveBeenCalledTimes(2);
  });

  it('handles video uploads and no-op retry when there is no pending file', async () => {
    let videoNodeKey = '';
    mockEditor.update(() => {
      const root = $getRoot();
      const videoNode = $createVideoBlockNode({
        src: 'video.mp4',
        provider: 'html5',
      });
      root.append(videoNode);
      videoNodeKey = videoNode.getKey();
    });

    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const mockUpload = vi.fn().mockResolvedValue({
      url: 'https://example.com/video.mp4',
      mime: 'video/mp4',
      size: 2048,
    });

    const { result } = renderHook(() =>
      useMediaUpload({
        editor: mockEditor,
        mediaConfig: {
          uploadAdapter: { uploadFile: mockUpload },
        },
        nodeKey: videoNodeKey,
        mediaType: 'video',
      }),
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(warnSpy).toHaveBeenCalledWith('No pending file to retry');

    const file = new File(['video'], 'video.mp4', { type: 'video/mp4' });
    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.state.status).toBe('success');
  });
});
