import { describe, expect, it } from 'vitest';

import {
  isAllowedOssRepoUrl,
  isSafeMarketingHref,
  MARKETING_OSS_HOST_ALLOWLIST,
  cn,
} from './utils';

describe('cn', () => {
  it('joins truthy class names with a single space', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('returns empty string when no truthy classes are supplied', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});

describe('isSafeMarketingHref', () => {
  it.each([
    '/dashboard',
    '#anchor',
    'https://example.com',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+15551234567',
  ])('accepts safe URL %s', (input) => {
    expect(isSafeMarketingHref(input)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:alert(1)',
    'file:///etc/passwd',
    '',
    '   ',
  ])('rejects unsafe URL %s', (input) => {
    expect(isSafeMarketingHref(input)).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isSafeMarketingHref(undefined as unknown as string)).toBe(false);
    expect(isSafeMarketingHref(null as unknown as string)).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(isSafeMarketingHref('   /dashboard   ')).toBe(true);
  });
});

describe('isAllowedOssRepoUrl', () => {
  it.each([
    'https://github.com/Xynes-Studio/lumia-ds',
    'https://gitlab.com/Xynes-Studio/lumia-ds',
    'https://gitea.io/xynes/lumia-ds',
    'https://codeberg.org/xynes/lumia-ds',
  ])('accepts allowlisted host %s', (input) => {
    expect(isAllowedOssRepoUrl(input)).toBe(true);
  });

  it('accepts www subdomain for github / gitlab', () => {
    expect(isAllowedOssRepoUrl('https://www.github.com/x/y')).toBe(true);
    expect(isAllowedOssRepoUrl('https://www.gitlab.com/x/y')).toBe(true);
  });

  it.each([
    'https://attacker.com/Xynes-Studio/lumia-ds',
    'https://github.attacker.com/Xynes-Studio/lumia-ds',
    'https://bitbucket.org/Xynes-Studio/lumia-ds',
    'javascript:alert(1)',
    '/relative/path',
    '',
    'not-a-url',
  ])('rejects %s', (input) => {
    expect(isAllowedOssRepoUrl(input)).toBe(false);
  });

  it('exports a frozen allowlist for downstream consumers', () => {
    expect(MARKETING_OSS_HOST_ALLOWLIST).toContain('github.com');
    expect(MARKETING_OSS_HOST_ALLOWLIST).toContain('gitlab.com');
  });
});
