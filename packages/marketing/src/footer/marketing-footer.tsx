import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { Brand } from '@lumia-ui/components';

import { cn, isSafeMarketingHref } from '../lib/utils';
import type { MarketingBrand, MarketingFooterColumn } from '../lib/types';

export type MarketingFooterProps = HTMLAttributes<HTMLElement> & {
  /** Optional brand mark rendered above the columns. */
  brand?: MarketingBrand;
  /** Footer columns. Plan §3 recommends 4 (Product / Developers / Company / Legal). */
  columns: ReadonlyArray<MarketingFooterColumn>;
  /**
   * Copy at the bottom of the footer (e.g. "© 2026 Xynes Studio. Built in the
   * open.").
   */
  copyright?: ReactNode;
  /**
   * Optional support inbox rendered as a `mailto:` link. Defense in depth:
   * stripped of any `?`/`#` query string before composing the href.
   */
  supportEmail?: string;
  'aria-label'?: string;
};

const sanitizeSupportEmail = (email: string): string => {
  // Strip query params + hash so a hostile copy paste cannot inject a hidden
  // subject / body / CC into the mailto: link.
  const cleaned = email.split('?')[0].split('#')[0].trim();
  return cleaned;
};

/**
 * Marketing footer with optional brand, 1-4 columns, support inbox row, and
 * copyright. Rendered as `<footer>` semantic landmark.
 */
export const MarketingFooter = forwardRef<HTMLElement, MarketingFooterProps>(
  function MarketingFooter(
    {
      brand,
      columns,
      copyright,
      supportEmail,
      className,
      'aria-label': ariaLabel = 'Site footer',
      ...rest
    },
    ref,
  ) {
    const safeSupport = supportEmail
      ? sanitizeSupportEmail(supportEmail)
      : undefined;
    const supportHref =
      safeSupport && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeSupport)
        ? `mailto:${safeSupport}`
        : undefined;

    return (
      <footer
        ref={ref}
        aria-label={ariaLabel}
        data-lumia-marketing-footer=""
        className={cn(
          'mx-auto w-full max-w-[64rem] px-4 sm:px-6',
          'py-12 sm:py-16',
          'border-t border-border',
          className,
        )}
        {...rest}
      >
        {brand ? (
          <div className="mb-8">
            {brand.label ? (
              <Brand
                variant={brand.variant}
                size={brand.size ?? 'md'}
                aria-label={brand.label}
              />
            ) : (
              <Brand
                variant={brand.variant}
                size={brand.size ?? 'md'}
                aria-hidden
              />
            )}
          </div>
        ) : null}
        <div
          className={cn(
            'grid gap-8',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="m-0 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {col.heading}
              </h3>
              <ul className="flex list-none flex-col gap-2 p-0">
                {col.links
                  .filter((link) => isSafeMarketingHref(link.href))
                  .map((link) => (
                    <li key={`${link.label}:${link.href}`}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        data-marketing-footer-link={link.id ?? link.label}
                        className={cn(
                          'text-sm text-foreground hover:underline',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded',
                        )}
                      >
                        {link.label}
                        {link.external ? (
                          <span className="sr-only"> (opens in new tab)</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        {(supportHref || copyright) && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
            {supportHref ? (
              <a
                href={supportHref}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                data-marketing-footer-support=""
              >
                {safeSupport}
              </a>
            ) : (
              <span aria-hidden />
            )}
            {copyright ? (
              <div data-marketing-footer-copyright="">{copyright}</div>
            ) : null}
          </div>
        )}
      </footer>
    );
  },
);
