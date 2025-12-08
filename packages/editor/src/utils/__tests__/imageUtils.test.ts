import { describe, test, expect } from 'vitest';
import {
  getLayoutClassName,
  calculateAspectRatio,
  fitDimensions,
  isValidImageUrl,
  getImageFormat,
  generateAltFromFilename,
  needsResizing,
  calculatePercentWidth,
  snapToWidth,
} from '../imageUtils';

describe('imageUtils', () => {
  describe('getLayoutClassName', () => {
    test('returns default class', () => {
      expect(getLayoutClassName('default')).toBe('image-default');
    });

    test('returns fullWidth class', () => {
      expect(getLayoutClassName('fullWidth')).toBe('image-full-width');
    });

    test('returns breakout class', () => {
      expect(getLayoutClassName('breakout')).toBe('image-breakout');
    });
  });

  describe('calculateAspectRatio', () => {
    test('calculates 16:9 ratio', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.777, 2);
    });

    test('calculates 4:3 ratio', () => {
      expect(calculateAspectRatio(800, 600)).toBeCloseTo(1.333, 2);
    });

    test('calculates 1:1 ratio', () => {
      expect(calculateAspectRatio(500, 500)).toBe(1);
    });

    test('returns null for zero width', () => {
      expect(calculateAspectRatio(0, 100)).toBeNull();
    });

    test('returns null for zero height', () => {
      expect(calculateAspectRatio(100, 0)).toBeNull();
    });

    test('returns null for negative values', () => {
      expect(calculateAspectRatio(-100, 100)).toBeNull();
    });
  });

  describe('fitDimensions', () => {
    test('scales down width', () => {
      const result = fitDimensions(1000, 500, 500, 500);
      expect(result.width).toBe(500);
      expect(result.height).toBe(250);
    });

    test('scales down height', () => {
      const result = fitDimensions(500, 1000, 500, 500);
      expect(result.width).toBe(250);
      expect(result.height).toBe(500);
    });

    test('keeps original if within bounds', () => {
      const result = fitDimensions(300, 200, 500, 500);
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });

    test('returns zero for invalid dimensions', () => {
      const result = fitDimensions(0, 0, 500, 500);
      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
    });
  });

  describe('isValidImageUrl', () => {
    test('returns true for jpg', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
    });

    test('returns true for png', () => {
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
    });

    test('returns true for webp', () => {
      expect(isValidImageUrl('https://example.com/image.webp')).toBe(true);
    });

    test('returns true for svg', () => {
      expect(isValidImageUrl('https://example.com/image.svg')).toBe(true);
    });

    test('handles query params', () => {
      expect(isValidImageUrl('https://example.com/image.jpg?token=abc')).toBe(
        true,
      );
    });

    test('returns false for non-image', () => {
      expect(isValidImageUrl('https://example.com/page.html')).toBe(false);
    });
  });

  describe('getImageFormat', () => {
    test('extracts from MIME type', () => {
      expect(getImageFormat('image/png')).toBe('png');
      expect(getImageFormat('image/jpeg')).toBe('jpeg');
    });

    test('extracts from URL', () => {
      expect(getImageFormat('https://example.com/photo.webp')).toBe('webp');
    });

    test('handles query params', () => {
      expect(getImageFormat('https://example.com/image.png?v=1')).toBe('png');
    });

    test('returns unknown for invalid', () => {
      expect(getImageFormat('invalid')).toBe('unknown');
    });
  });

  describe('generateAltFromFilename', () => {
    test('removes extension', () => {
      expect(generateAltFromFilename('photo.jpg')).toBe('Photo');
    });

    test('replaces hyphens with spaces', () => {
      expect(generateAltFromFilename('my-photo.png')).toBe('My photo');
    });

    test('replaces underscores with spaces', () => {
      expect(generateAltFromFilename('my_photo.png')).toBe('My photo');
    });

    test('capitalizes first letter', () => {
      expect(generateAltFromFilename('image.webp')).toBe('Image');
    });
  });

  describe('needsResizing', () => {
    test('returns true when width exceeds max', () => {
      expect(needsResizing(1000, 500)).toBe(true);
    });

    test('returns false when width within max', () => {
      expect(needsResizing(300, 500)).toBe(false);
    });

    test('returns false for zero maxWidth', () => {
      expect(needsResizing(1000, 0)).toBe(false);
    });
  });

  describe('calculatePercentWidth', () => {
    test('calculates 50%', () => {
      expect(calculatePercentWidth(500, 1000)).toBe(50);
    });

    test('caps at 100%', () => {
      expect(calculatePercentWidth(1200, 1000)).toBe(100);
    });

    test('returns 100 for zero container', () => {
      expect(calculatePercentWidth(500, 0)).toBe(100);
    });
  });

  describe('snapToWidth', () => {
    test('snaps to 50%', () => {
      const result = snapToWidth(480, 1000); // 48% -> snaps to 50%
      expect(result).toBe(500);
    });

    test('snaps to 25%', () => {
      const result = snapToWidth(260, 1000); // 26% -> snaps to 25%
      expect(result).toBe(250);
    });

    test('does not snap if too far', () => {
      const result = snapToWidth(350, 1000); // 35% -> no snap
      expect(result).toBe(350);
    });

    test('uses custom snap points', () => {
      const result = snapToWidth(330, 1000, [33, 66, 100]); // 33% snap point
      expect(result).toBe(330);
    });
  });
});
