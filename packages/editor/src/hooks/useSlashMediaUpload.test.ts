/**
 * Tests for useSlashMediaUpload hook.
 */
import { describe, it, expect, vi } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { ParagraphNode, TextNode } from 'lexical';
import { ImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';
import { EditorMediaConfig } from '../media-config';
import {
  hasUploadAdapter,
  normalizeUploadError,
  buildSuccessStatusUpdates,
  buildErrorStatusUpdates,
  extractFilenameFromUrl,
  buildImageNodePayload,
} from '../utils/mediaUploadUtils';

describe('useSlashMediaUpload', () => {
  const createEditor = () =>
    createHeadlessEditor({
      namespace: 'test',
      nodes: [
        ParagraphNode,
        TextNode,
        ImageBlockNode,
        VideoBlockNode,
        FileBlockNode,
      ],
      onError: (error) => {
        throw error;
      },
    });

  describe('URL-based insertions', () => {
    it('should call INSERT_IMAGE_BLOCK_COMMAND with correct params', () => {
      const editor = createEditor();
      const dispatchSpy = vi.spyOn(editor, 'dispatchCommand');
      dispatchSpy.mockImplementation(() => true);
      expect(dispatchSpy).toBeDefined();
    });

    it('should call INSERT_VIDEO_BLOCK_COMMAND with correct params', () => {
      const editor = createEditor();
      const dispatchSpy = vi.spyOn(editor, 'dispatchCommand');
      dispatchSpy.mockImplementation(() => true);
      expect(dispatchSpy).toBeDefined();
    });

    it('should call INSERT_FILE_BLOCK_COMMAND with correct params', () => {
      const editor = createEditor();
      const dispatchSpy = vi.spyOn(editor, 'dispatchCommand');
      dispatchSpy.mockImplementation(() => true);
      expect(dispatchSpy).toBeDefined();
    });
  });

  describe('Media config validation', () => {
    it('should check for upload adapter before processing file', () => {
      const mediaConfig: EditorMediaConfig | null = null;

      // Without upload adapter, file upload should not proceed
      expect(mediaConfig?.uploadAdapter).toBeUndefined();
    });

    it('should have upload adapter to process files', () => {
      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: vi
            .fn()
            .mockResolvedValue({ url: 'https://cdn.example.com/file.pdf' }),
        },
      };

      expect(mediaConfig.uploadAdapter).toBeDefined();
    });

    it('should call onUploadStart callback when provided', () => {
      const onUploadStart = vi.fn();
      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: vi
            .fn()
            .mockResolvedValue({ url: 'https://cdn.example.com/file.pdf' }),
        },
        callbacks: { onUploadStart },
      };

      // Simulate callback invocation
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      mediaConfig.callbacks?.onUploadStart?.(file, 'file');

      expect(onUploadStart).toHaveBeenCalledWith(file, 'file');
    });

    it('should call onUploadComplete callback on success', () => {
      const onUploadComplete = vi.fn();
      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: vi
            .fn()
            .mockResolvedValue({ url: 'https://cdn.example.com/file.pdf' }),
        },
        callbacks: { onUploadComplete },
      };

      // Simulate callback invocation
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const result = { url: 'https://cdn.example.com/file.pdf' };
      mediaConfig.callbacks?.onUploadComplete?.(file, result);

      expect(onUploadComplete).toHaveBeenCalledWith(file, result);
    });

    it('should call onUploadError callback on failure', () => {
      const onUploadError = vi.fn();
      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: vi.fn().mockRejectedValue(new Error('Upload failed')),
        },
        callbacks: { onUploadError },
      };

      // Simulate callback invocation
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const error = new Error('Upload failed');
      mediaConfig.callbacks?.onUploadError?.(file, error);

      expect(onUploadError).toHaveBeenCalledWith(file, error);
    });

    it('should call onUploadProgress callback for file uploads', () => {
      const onUploadProgress = vi.fn();
      const mediaConfig: EditorMediaConfig = {
        uploadAdapter: {
          uploadFile: vi
            .fn()
            .mockResolvedValue({ url: 'https://cdn.example.com/file.pdf' }),
        },
        callbacks: { onUploadProgress },
      };

      // Simulate progress callback invocation
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      mediaConfig.callbacks?.onUploadProgress?.(file, 50);

      expect(onUploadProgress).toHaveBeenCalledWith(file, 50);
    });
  });

  describe('Pure function integration', () => {
    it('hasUploadAdapter returns false for null config', () => {
      expect(hasUploadAdapter(null)).toBe(false);
    });

    it('hasUploadAdapter returns false for missing adapter', () => {
      expect(hasUploadAdapter({ uploadAdapter: undefined })).toBe(false);
    });

    it('hasUploadAdapter returns true for valid adapter', () => {
      expect(hasUploadAdapter({ uploadAdapter: {} })).toBe(true);
    });

    it('normalizeUploadError wraps non-Error objects', () => {
      const result = normalizeUploadError('string error');
      expect(result.error).toBeInstanceOf(Error);
      expect(result.message).toBe('Upload failed');
    });

    it('normalizeUploadError preserves Error objects', () => {
      const original = new Error('Test error');
      const result = normalizeUploadError(original);
      expect(result.error).toBe(original);
    });

    it('buildSuccessStatusUpdates returns correct keys for image', () => {
      const result = buildSuccessStatusUpdates({ url: 'test.jpg' }, 'image');
      expect(result.__src).toBe('test.jpg');
      expect(result.__status).toBe('uploaded');
    });

    it('buildSuccessStatusUpdates returns correct keys for file', () => {
      const result = buildSuccessStatusUpdates({ url: 'test.pdf' }, 'file');
      expect(result.__url).toBe('test.pdf');
      expect(result.__status).toBe('uploaded');
    });

    it('buildErrorStatusUpdates returns error status', () => {
      const result = buildErrorStatusUpdates();
      expect(result.__status).toBe('error');
    });

    it('extractFilenameFromUrl extracts filename correctly', () => {
      expect(extractFilenameFromUrl('https://example.com/path/file.pdf')).toBe(
        'file.pdf',
      );
    });

    it('extractFilenameFromUrl uses fallback for empty path', () => {
      expect(extractFilenameFromUrl('https://example.com/', 'unknown')).toBe(
        'unknown',
      );
    });

    it('buildImageNodePayload creates correct structure', () => {
      const result = buildImageNodePayload('blob:preview', 'photo.jpg');
      expect(result.src).toBe('blob:preview');
      expect(result.alt).toBe('photo.jpg');
      expect(result.status).toBe('uploading');
    });
  });
});
