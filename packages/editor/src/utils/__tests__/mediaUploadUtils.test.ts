/**
 * Tests for mediaUploadUtils - Pure functions for media upload.
 * ADR-001 Tier 1: Unit tests for pure functions.
 */
import { describe, test, expect } from 'vitest';
import {
  hasUploadAdapter,
  extractFilenameFromUrl,
  normalizeUploadError,
  buildSuccessStatusUpdates,
  buildErrorStatusUpdates,
  validateFileForUpload,
  getMediaTypeFromMime,
  buildImageNodePayload,
  buildVideoNodePayload,
  buildFileNodePayload,
} from '../mediaUploadUtils';

describe('mediaUploadUtils', () => {
  describe('hasUploadAdapter', () => {
    test('returns true when adapter exists', () => {
      expect(hasUploadAdapter({ uploadAdapter: {} })).toBe(true);
    });

    test('returns false when adapter is null', () => {
      expect(hasUploadAdapter({ uploadAdapter: null })).toBe(false);
    });

    test('returns false when adapter is undefined', () => {
      expect(hasUploadAdapter({ uploadAdapter: undefined })).toBe(false);
    });

    test('returns false when config is null', () => {
      expect(hasUploadAdapter(null)).toBe(false);
    });
  });

  describe('extractFilenameFromUrl', () => {
    test('extracts filename from URL', () => {
      expect(
        extractFilenameFromUrl('https://example.com/path/document.pdf'),
      ).toBe('document.pdf');
    });

    test('returns fallback for empty path', () => {
      expect(extractFilenameFromUrl('https://example.com/')).toBe('file');
    });

    test('uses custom fallback', () => {
      expect(extractFilenameFromUrl('https://example.com/', 'unknown')).toBe(
        'unknown',
      );
    });

    test('handles URL without path', () => {
      expect(extractFilenameFromUrl('https://example.com')).toBe('example.com');
    });
  });

  describe('normalizeUploadError', () => {
    test('returns same error if already Error instance', () => {
      const error = new Error('Test error');
      const result = normalizeUploadError(error);
      expect(result.error).toBe(error);
      expect(result.message).toBe('Test error');
    });

    test('creates new Error for non-Error input', () => {
      const result = normalizeUploadError('string error');
      expect(result.error).toBeInstanceOf(Error);
      expect(result.message).toBe('Upload failed');
    });

    test('handles null input', () => {
      const result = normalizeUploadError(null);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('buildSuccessStatusUpdates', () => {
    test('builds updates for image', () => {
      const result = buildSuccessStatusUpdates(
        { url: 'https://cdn.com/img.jpg' },
        'image',
      );
      expect(result.__src).toBe('https://cdn.com/img.jpg');
      expect(result.__status).toBe('uploaded');
    });

    test('builds updates for video', () => {
      const result = buildSuccessStatusUpdates(
        { url: 'https://cdn.com/vid.mp4' },
        'video',
      );
      expect(result.__src).toBe('https://cdn.com/vid.mp4');
      expect(result.__status).toBe('uploaded');
    });

    test('builds updates for file with __url key', () => {
      const result = buildSuccessStatusUpdates(
        { url: 'https://cdn.com/doc.pdf' },
        'file',
      );
      expect(result.__url).toBe('https://cdn.com/doc.pdf');
      expect(result.__status).toBe('uploaded');
    });
  });

  describe('buildErrorStatusUpdates', () => {
    test('returns error status', () => {
      const result = buildErrorStatusUpdates();
      expect(result.__status).toBe('error');
    });
  });

  describe('validateFileForUpload', () => {
    test('returns valid for acceptable file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileForUpload(file, 10, ['image/jpeg']);
      expect(result.isValid).toBe(true);
    });

    test('returns invalid for oversized file', () => {
      const content = new Array(2 * 1024 * 1024).fill('x').join('');
      const file = new File([content], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFileForUpload(file, 1);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('1MB');
    });

    test('returns invalid for disallowed type', () => {
      const file = new File(['content'], 'test.exe', {
        type: 'application/x-executable',
      });
      const result = validateFileForUpload(file, undefined, [
        'image/jpeg',
        'image/png',
      ]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    test('returns valid when no restrictions', () => {
      const file = new File(['content'], 'any.bin', {
        type: 'application/octet-stream',
      });
      const result = validateFileForUpload(file);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getMediaTypeFromMime', () => {
    test('returns image for image MIME types', () => {
      expect(getMediaTypeFromMime('image/jpeg')).toBe('image');
      expect(getMediaTypeFromMime('image/png')).toBe('image');
      expect(getMediaTypeFromMime('image/gif')).toBe('image');
    });

    test('returns video for video MIME types', () => {
      expect(getMediaTypeFromMime('video/mp4')).toBe('video');
      expect(getMediaTypeFromMime('video/webm')).toBe('video');
    });

    test('returns file for other MIME types', () => {
      expect(getMediaTypeFromMime('application/pdf')).toBe('file');
      expect(getMediaTypeFromMime('text/plain')).toBe('file');
    });
  });

  describe('buildImageNodePayload', () => {
    test('builds correct payload', () => {
      const result = buildImageNodePayload('blob:preview', 'photo.jpg');
      expect(result.src).toBe('blob:preview');
      expect(result.alt).toBe('photo.jpg');
      expect(result.status).toBe('uploading');
    });
  });

  describe('buildVideoNodePayload', () => {
    test('builds correct payload', () => {
      const result = buildVideoNodePayload('blob:preview', 'clip.mp4');
      expect(result.src).toBe('blob:preview');
      expect(result.provider).toBe('html5');
      expect(result.title).toBe('clip.mp4');
      expect(result.status).toBe('uploading');
    });
  });

  describe('buildFileNodePayload', () => {
    test('builds correct payload', () => {
      const file = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(file, 'size', { value: 1024 });
      const result = buildFileNodePayload('blob:preview', file);
      expect(result.url).toBe('blob:preview');
      expect(result.filename).toBe('document.pdf');
      expect(result.mime).toBe('application/pdf');
      expect(result.status).toBe('uploading');
    });
  });
});
