/**
 * Tiny class-name joiner used across the marketing package. Mirrors
 * `cn` in `@lumia-ui/components`. Kept local so the marketing package has no
 * runtime peer-import on `@lumia-ui/components` for utility helpers (the
 * `peerDependencies` / `dependencies` line in `package.json` lists
 * `@lumia-ui/components` for component re-exports only, not for `cn`).
 */
type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(' ');

/**
 * Same-origin / relative / safe-protocol URL guard. Rejects `javascript:`,
 * `data:` (except for SVG icon `data:image/svg+xml`), `vbscript:`, and
 * `file:` URLs. The marketing primitives use this to defend against
 * accidental string-interpolation of unvalidated copy into `href` props.
 *
 * Returns `true` if the URL is safe to render in an anchor `href` attribute.
 */
export function isSafeMarketingHref(href: string): boolean {
  if (typeof href !== 'string' || href.length === 0) return false;
  const trimmed = href.trim();
  if (trimmed.length === 0) return false;
  // Relative URLs are always safe (resolved against the page origin).
  if (trimmed.startsWith('/')) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('tel:')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return false;
}

/**
 * GitHub / GitLab / Gitea allowlist for the trust-strip OSS link.
 */
const OSS_HOST_ALLOWLIST: ReadonlyArray<string> = [
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'gitea.io',
  'codeberg.org',
];

export function isAllowedOssRepoUrl(url: string): boolean {
  if (!isSafeMarketingHref(url)) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const parsed = new URL(url);
    return OSS_HOST_ALLOWLIST.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export const MARKETING_OSS_HOST_ALLOWLIST = OSS_HOST_ALLOWLIST;
