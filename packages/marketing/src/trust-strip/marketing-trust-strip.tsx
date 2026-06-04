import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { Badge } from '@lumia-ui/components';

import { cn, isAllowedOssRepoUrl, isSafeMarketingHref } from '../lib/utils';
import type { MarketingLicense } from '../lib/types';

export type MarketingTrustStripProps = HTMLAttributes<HTMLElement> & {
  /**
   * Public OSS repository URL. Must resolve to one of the allowed hosts
   * (github.com, gitlab.com, gitea.io, codeberg.org). Invalid URLs cause the
   * repo chip to be omitted (fail closed).
   */
  repoUrl: string;
  /** SPDX-style license identifier rendered in a `<Badge>`. */
  license: MarketingLicense;
  /**
   * Security policy URL. Defaults to `/SECURITY.md` so any host that
   * surfaces a top-level SECURITY policy works out of the box.
   */
  securityUrl?: string;
  /** Short data-residency one-liner. Plain text only — no rich content. */
  residencyNote?: string;
  /**
   * Optional extra children rendered to the right of the residency note
   * (status-page link, uptime badge, etc.).
   */
  children?: ReactNode;
  'aria-label'?: string;
};

const LinkChip = ({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground',
      'transition-colors hover:bg-muted motion-reduce:transition-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
    )}
  >
    {label}
    {external ? <span className="sr-only"> (opens in new tab)</span> : null}
  </a>
);

/**
 * Compact strip surfacing trust signals: OSS repo, license badge, security
 * policy link, data-residency one-liner. Rendered as `<aside>` because it's
 * complementary to the main flow rather than a primary section.
 */
export const MarketingTrustStrip = forwardRef<
  HTMLElement,
  MarketingTrustStripProps
>(function MarketingTrustStrip(
  {
    repoUrl,
    license,
    securityUrl = '/SECURITY.md',
    residencyNote,
    children,
    className,
    'aria-label': ariaLabel = 'Trust and security',
    ...rest
  },
  ref,
) {
  const repoSafe = isAllowedOssRepoUrl(repoUrl);
  const securitySafe = isSafeMarketingHref(securityUrl);

  return (
    <aside
      ref={ref}
      aria-label={ariaLabel}
      data-lumia-marketing-trust-strip=""
      className={cn(
        'mx-auto w-full max-w-[64rem] px-4 sm:px-6 py-8',
        'border-t border-border',
        className,
      )}
      {...rest}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {repoSafe ? (
          <LinkChip href={repoUrl} label="Source code" external />
        ) : null}
        <Badge variant="default" data-marketing-license="">
          {license}
        </Badge>
        {securitySafe ? (
          <LinkChip
            href={securityUrl}
            label="Security policy"
            external={/^https?:\/\//i.test(securityUrl)}
          />
        ) : null}
        {residencyNote ? (
          <span data-marketing-residency="" className="text-sm">
            {residencyNote}
          </span>
        ) : null}
        {children}
      </div>
    </aside>
  );
});
