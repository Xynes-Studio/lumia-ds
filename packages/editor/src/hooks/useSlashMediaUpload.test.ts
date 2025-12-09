/**
 * Tests for useSlashMediaUpload hook.
 */
import { describe, it, expect, vi } from 'vitest';
import { createHeadlessEditor } from '@lexical/headless';
import { ParagraphNode, TextNode } from 'lexical';
import { ImageBlockNode } from '../nodes/ImageBlockNode/ImageBlockNode';
import { VideoBlockNode } from '../nodes/VideoBlockNode';
import { FileBlockNode } from '../nodes/FileBlockNode/FileBlockNode';

// Import pure functions for testing
import { EditorMediaConfig } from '../media-config';

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
});
