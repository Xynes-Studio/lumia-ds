import { describe, test, expect } from 'vitest';
import {
  validateFileSize,
  getFileSizeErrorMessage,
  formatFileSize,
  getFileExtension,
  isFileTypeAllowed,
  extractFileMetadata,
  getFileIcon,
} from '../fileUtils';

describe('fileUtils', () => {
  describe('validateFileSize', () => {
    test('returns true when no max size defined', () => {
      expect(validateFileSize(10000000, undefined)).toBe(true);
    });

    test('returns true when file is within limit', () => {
      expect(validateFileSize(1024 * 1024, 2)).toBe(true); // 1MB < 2MB
    });

    test('returns true when file equals limit', () => {
      expect(validateFileSize(2 * 1024 * 1024, 2)).toBe(true); // 2MB = 2MB
    });

    test('returns false when file exceeds limit', () => {
      expect(validateFileSize(3 * 1024 * 1024, 2)).toBe(false); // 3MB > 2MB
    });

    test('handles zero size', () => {
      expect(validateFileSize(0, 1)).toBe(true);
    });
  });

  describe('getFileSizeErrorMessage', () => {
    test('returns correct error message', () => {
      expect(getFileSizeErrorMessage(5)).toBe('File size exceeds 5MB');
      expect(getFileSizeErrorMessage(10)).toBe('File size exceeds 10MB');
    });
  });

  describe('formatFileSize', () => {
    test('formats zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    test('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    test('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    test('formats megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    test('formats gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('getFileExtension', () => {
    test('extracts extension from filename', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.PNG')).toBe('png');
    });

    test('handles multiple dots', () => {
      expect(getFileExtension('file.name.tar.gz')).toBe('gz');
    });

    test('returns empty for no extension', () => {
      expect(getFileExtension('filename')).toBe('');
    });

    test('returns empty if dot at end', () => {
      expect(getFileExtension('filename.')).toBe('');
    });

    test('handles hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });
  });

  describe('isFileTypeAllowed', () => {
    test('returns true when no allowed types specified', () => {
      expect(isFileTypeAllowed('image/png', undefined)).toBe(true);
      expect(isFileTypeAllowed('image/png', [])).toBe(true);
    });

    test('returns true for exact match', () => {
      expect(isFileTypeAllowed('image/png', ['image/png', 'image/jpeg'])).toBe(
        true,
      );
    });

    test('returns false for non-match', () => {
      expect(isFileTypeAllowed('video/mp4', ['image/png', 'image/jpeg'])).toBe(
        false,
      );
    });

    test('supports wildcard matching', () => {
      expect(isFileTypeAllowed('image/png', ['image/*'])).toBe(true);
      expect(isFileTypeAllowed('image/jpeg', ['image/*'])).toBe(true);
      expect(isFileTypeAllowed('video/mp4', ['image/*'])).toBe(false);
    });

    test('supports multiple wildcards', () => {
      expect(isFileTypeAllowed('video/mp4', ['image/*', 'video/*'])).toBe(true);
    });
  });

  describe('extractFileMetadata', () => {
    test('extracts metadata from File object', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const metadata = extractFileMetadata(file);

      expect(metadata.filename).toBe('test.pdf');
      expect(metadata.size).toBe(7); // 'content' is 7 bytes
      expect(metadata.mime).toBe('application/pdf');
    });

    test('uses default mime for empty type', () => {
      const file = new File(['data'], 'unknown');
      const metadata = extractFileMetadata(file);

      expect(metadata.mime).toBe('application/octet-stream');
    });
  });

  describe('getFileIcon', () => {
    test('returns image for image types', () => {
      expect(getFileIcon('image/png')).toBe('image');
      expect(getFileIcon('image/jpeg')).toBe('image');
      expect(getFileIcon('image/gif')).toBe('image');
    });

    test('returns video for video types', () => {
      expect(getFileIcon('video/mp4')).toBe('video');
      expect(getFileIcon('video/webm')).toBe('video');
    });

    test('returns audio for audio types', () => {
      expect(getFileIcon('audio/mpeg')).toBe('audio');
      expect(getFileIcon('audio/wav')).toBe('audio');
    });

    test('returns pdf for PDF', () => {
      expect(getFileIcon('application/pdf')).toBe('pdf');
    });

    test('returns archive for compressed files', () => {
      expect(getFileIcon('application/zip')).toBe('archive');
      expect(getFileIcon('application/x-compressed')).toBe('archive');
    });

    test('returns document for word files', () => {
      expect(getFileIcon('application/msword')).toBe('document');
      expect(
        getFileIcon(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ).toBe('document');
    });

    test('returns spreadsheet for excel files', () => {
      expect(getFileIcon('application/vnd.ms-excel')).toBe('spreadsheet');
    });

    test('returns presentation for powerpoint files', () => {
      expect(getFileIcon('application/vnd.ms-powerpoint')).toBe('presentation');
    });

    test('returns file for unknown types', () => {
      expect(getFileIcon('application/unknown')).toBe('file');
      expect(getFileIcon('')).toBe('file');
    });
  });
});
