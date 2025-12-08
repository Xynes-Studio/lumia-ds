import { describe, test, expect } from 'vitest';
import {
  isValidUrl,
  extractDomain,
  normalizeUrlForDisplay,
  isInternalLink,
  getLinkDisplayText,
  needsHttpsUpgrade,
  sanitizeUrl,
} from '../linkUtils';

describe('linkUtils', () => {
  describe('isValidUrl', () => {
    test('returns true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/page')).toBe(true);
    });

    test('returns false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    test('handles whitespace', () => {
      expect(isValidUrl('  https://example.com  ')).toBe(true);
    });
  });

  describe('extractDomain', () => {
    test('extracts domain from URL', () => {
      expect(extractDomain('https://www.example.com/page')).toBe(
        'www.example.com',
      );
    });

    test('returns null for invalid URL', () => {
      expect(extractDomain('not a url')).toBeNull();
    });
  });

  describe('normalizeUrlForDisplay', () => {
    test('trims whitespace', () => {
      expect(normalizeUrlForDisplay('  https://example.com  ')).toBe(
        'https://example.com',
      );
    });

    test('removes trailing slashes', () => {
      expect(normalizeUrlForDisplay('https://example.com/')).toBe(
        'https://example.com',
      );
      expect(normalizeUrlForDisplay('https://example.com///')).toBe(
        'https://example.com',
      );
    });
  });

  describe('isInternalLink', () => {
    test('returns true for same domain', () => {
      expect(isInternalLink('https://example.com/page', 'example.com')).toBe(
        true,
      );
    });

    test('returns true for subdomain', () => {
      expect(
        isInternalLink('https://blog.example.com/post', 'example.com'),
      ).toBe(true);
    });

    test('returns false for different domain', () => {
      expect(isInternalLink('https://other.com', 'example.com')).toBe(false);
    });
  });

  describe('getLinkDisplayText', () => {
    test('returns domain and path', () => {
      expect(getLinkDisplayText('https://example.com/page')).toBe(
        'example.com/page',
      );
    });

    test('truncates long URLs', () => {
      const longUrl = 'https://example.com/very/long/path/that/exceeds/limit';
      expect(getLinkDisplayText(longUrl, 20)).toHaveLength(20);
    });

    test('handles root path', () => {
      expect(getLinkDisplayText('https://example.com/')).toBe('example.com');
    });
  });

  describe('needsHttpsUpgrade', () => {
    test('returns true for HTTP', () => {
      expect(needsHttpsUpgrade('http://example.com')).toBe(true);
    });

    test('returns false for HTTPS', () => {
      expect(needsHttpsUpgrade('https://example.com')).toBe(false);
    });

    test('handles whitespace', () => {
      expect(needsHttpsUpgrade('  http://example.com')).toBe(true);
    });
  });

  describe('sanitizeUrl', () => {
    test('blocks javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    test('blocks data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    test('allows safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    test('trims whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe(
        'https://example.com',
      );
    });
  });
});
