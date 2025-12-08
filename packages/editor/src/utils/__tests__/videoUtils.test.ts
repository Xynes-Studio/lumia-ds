import { describe, test, expect } from 'vitest';
import {
  detectVideoProvider,
  extractYouTubeId,
  extractVimeoId,
  extractLoomId,
  getEmbedUrl,
  isValidVideoUrl,
  getThumbnailUrl,
  formatDuration,
} from '../videoUtils';

describe('videoUtils', () => {
  describe('detectVideoProvider', () => {
    test('detects YouTube URLs', () => {
      expect(
        detectVideoProvider('https://www.youtube.com/watch?v=abc123'),
      ).toBe('youtube');
      expect(detectVideoProvider('https://youtu.be/abc123')).toBe('youtube');
      expect(detectVideoProvider('https://youtube.com/embed/abc123')).toBe(
        'youtube',
      );
    });

    test('detects Vimeo URLs', () => {
      expect(detectVideoProvider('https://vimeo.com/123456789')).toBe('vimeo');
      expect(
        detectVideoProvider('https://player.vimeo.com/video/123456789'),
      ).toBe('vimeo');
    });

    test('detects Loom URLs', () => {
      expect(detectVideoProvider('https://www.loom.com/share/abc123')).toBe(
        'loom',
      );
    });

    test('detects HTML5 video files', () => {
      expect(detectVideoProvider('https://example.com/video.mp4')).toBe(
        'html5',
      );
      expect(detectVideoProvider('https://example.com/video.webm')).toBe(
        'html5',
      );
      expect(detectVideoProvider('https://example.com/video.mov')).toBe(
        'html5',
      );
    });

    test('handles URLs with query params', () => {
      expect(
        detectVideoProvider('https://example.com/video.mp4?token=abc'),
      ).toBe('html5');
    });

    test('returns undefined for unknown URLs', () => {
      expect(detectVideoProvider('https://example.com/page')).toBeUndefined();
    });

    test('trims whitespace', () => {
      expect(detectVideoProvider('  https://youtube.com/watch?v=test  ')).toBe(
        'youtube',
      );
    });
  });

  describe('extractYouTubeId', () => {
    test('extracts from watch URL', () => {
      expect(
        extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ).toBe('dQw4w9WgXcQ');
    });

    test('extracts from short URL', () => {
      expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ',
      );
    });

    test('extracts from embed URL', () => {
      expect(extractYouTubeId('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ',
      );
    });

    test('returns null for invalid URL', () => {
      expect(extractYouTubeId('https://example.com')).toBeNull();
    });
  });

  describe('extractVimeoId', () => {
    test('extracts from vimeo URL', () => {
      expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
    });

    test('returns null for invalid URL', () => {
      expect(extractVimeoId('https://example.com')).toBeNull();
    });
  });

  describe('extractLoomId', () => {
    test('extracts from loom share URL', () => {
      expect(extractLoomId('https://www.loom.com/share/abc123def456')).toBe(
        'abc123def456',
      );
    });

    test('returns null for invalid URL', () => {
      expect(extractLoomId('https://example.com')).toBeNull();
    });
  });

  describe('getEmbedUrl', () => {
    test('generates YouTube embed URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getEmbedUrl(url, 'youtube')).toBe(
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      );
    });

    test('generates Vimeo embed URL', () => {
      const url = 'https://vimeo.com/123456789';
      expect(getEmbedUrl(url, 'vimeo')).toBe(
        'https://player.vimeo.com/video/123456789',
      );
    });

    test('generates Loom embed URL', () => {
      const url = 'https://www.loom.com/share/abc123';
      expect(getEmbedUrl(url, 'loom')).toBe(
        'https://www.loom.com/embed/abc123',
      );
    });

    test('returns original URL for html5', () => {
      const url = 'https://example.com/video.mp4';
      expect(getEmbedUrl(url, 'html5')).toBe(url);
    });
  });

  describe('isValidVideoUrl', () => {
    test('returns true for valid YouTube URL', () => {
      expect(isValidVideoUrl('https://youtube.com/watch?v=test')).toBe(true);
    });

    test('returns true for valid Vimeo URL', () => {
      expect(isValidVideoUrl('https://vimeo.com/123456')).toBe(true);
    });

    test('returns true for valid mp4 URL', () => {
      expect(isValidVideoUrl('https://example.com/video.mp4')).toBe(true);
    });

    test('returns false for invalid URL', () => {
      expect(isValidVideoUrl('not-a-url')).toBe(false);
    });

    test('returns false for non-video URL', () => {
      expect(isValidVideoUrl('https://example.com/page')).toBe(false);
    });
  });

  describe('getThumbnailUrl', () => {
    test('generates YouTube thumbnail', () => {
      const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getThumbnailUrl(url, 'youtube')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      );
    });

    test('returns null for Vimeo', () => {
      expect(getThumbnailUrl('https://vimeo.com/123', 'vimeo')).toBeNull();
    });

    test('returns null for html5', () => {
      expect(
        getThumbnailUrl('https://example.com/video.mp4', 'html5'),
      ).toBeNull();
    });
  });

  describe('formatDuration', () => {
    test('formats seconds only', () => {
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(5)).toBe('0:05');
    });

    test('formats minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(125)).toBe('2:05');
    });

    test('formats hours, minutes, and seconds', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(3905)).toBe('1:05:05');
    });

    test('handles zero', () => {
      expect(formatDuration(0)).toBe('0:00');
    });
  });
});
