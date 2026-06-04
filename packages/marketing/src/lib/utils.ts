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
 * `data:` (except for SVG icon `data:image/svg+xml`), `vbscript:`,
 * `file:`, and **protocol-relative** URLs (`//attacker.com/x`).
 *
 * The protocol-relative rejection was added in PR #229 review (Codex P2 #1):
 * a string starting with `//` is resolved by the browser to the current
 * page's protocol + the attacker-controlled host, which would silently
 * exfiltrate requests to an unapproved origin. Same-origin relative paths
 * use exactly one leading `/`.
 *
 * Returns `true` if the URL is safe to render in an anchor `href` attribute.
 */
export function isSafeMarketingHref(href: string): boolean {
  if (typeof href !== 'string' || href.length === 0) return false;
  const trimmed = href.trim();
  if (trimmed.length === 0) return false;
  // PR #229 Codex P2 #1 — protocol-relative URLs (`//evil.com/x`) resolve to
  // the page's protocol + the attacker host. Reject BEFORE the relative-path
  // branch so the `startsWith('/')` check below cannot accept them.
  if (trimmed.startsWith('//')) return false;
  // Relative URLs are safe (resolved against the page origin).
  if (trimmed.startsWith('/')) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('tel:')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return false;
}

/**
 * GitHub / GitLab / Gitea allowlist for the trust-strip OSS link.
 *
 * `Object.freeze`-d so a runtime `MARKETING_OSS_HOST_ALLOWLIST.push('evil.com')`
 * fails in strict mode (and silently no-ops in sloppy mode) instead of
 * weakening every subsequent `isAllowedOssRepoUrl` check (PR #229 Codex P2 #4).
 * `ReadonlyArray` only prevents mutation at compile time; the freeze is the
 * runtime gate.
 */
const OSS_HOST_ALLOWLIST = Object.freeze([
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'gitea.io',
  'codeberg.org',
] as const);

export function isAllowedOssRepoUrl(url: string): boolean {
  if (!isSafeMarketingHref(url)) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const parsed = new URL(url);
    return (OSS_HOST_ALLOWLIST as ReadonlyArray<string>).includes(
      parsed.hostname.toLowerCase(),
    );
  } catch {
    return false;
  }
}

/**
 * Frozen public allowlist of OSS-host names recognised by
 * {@link isAllowedOssRepoUrl}. Exposed as `ReadonlyArray<string>` for type
 * narrowing but the runtime array is `Object.freeze`-d so any attempt to
 * mutate it (`MARKETING_OSS_HOST_ALLOWLIST.push(...)`) throws under strict
 * mode and silently no-ops elsewhere — see PR #229 Codex P2 #4.
 */
export const MARKETING_OSS_HOST_ALLOWLIST: ReadonlyArray<string> =
  OSS_HOST_ALLOWLIST;
