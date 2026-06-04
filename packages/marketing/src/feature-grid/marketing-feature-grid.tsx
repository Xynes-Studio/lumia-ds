import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/utils';

export type MarketingFeatureGridColumns = 1 | 2 | 3 | 4;

export type MarketingFeatureGridProps = HTMLAttributes<HTMLElement> & {
  /** Section heading rendered as `<h2>`. Optional but recommended for SEO + a11y. */
  heading?: string;
  /** Optional sub-copy under the heading. */
  description?: string;
  /** Column count at the `lg` breakpoint. Defaults to `3`. */
  columns?: MarketingFeatureGridColumns;
  /** Accessible label for the `<section>` landmark. */
  'aria-label'?: string;
  children: ReactNode;
};

const columnClasses: Record<MarketingFeatureGridColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Responsive grid of `<MarketingFeatureCard>` children. The plan calls for
 * 3-6 cards; the component itself does not enforce that range so consumers
 * can experiment, but the recommended count is 3 (default) or 4.
 */
export const MarketingFeatureGrid = forwardRef<
  HTMLElement,
  MarketingFeatureGridProps
>(function MarketingFeatureGrid(
  {
    heading,
    description,
    columns = 3,
    className,
    children,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const headingId = heading ? 'marketing-feature-grid-heading' : undefined;
  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      aria-label={!heading ? (ariaLabel ?? 'Features') : undefined}
      data-lumia-marketing-feature-grid=""
      className={cn(
        'mx-auto w-full max-w-[64rem] px-4 sm:px-6',
        'py-12 sm:py-16 lg:py-20',
        className,
      )}
      {...rest}
    >
      {heading ? (
        <div className="mb-8 flex flex-col gap-3 sm:mb-12">
          <h2
            id={headingId}
            className="m-0 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {heading}
          </h2>
          {description ? (
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <ul
        className={cn('grid gap-6 list-none p-0 m-0', columnClasses[columns])}
      >
        {children}
      </ul>
    </section>
  );
});

export type MarketingFeatureCardProps = HTMLAttributes<HTMLLIElement> & {
  /**
   * Icon rendered above the headline. Accepts any React node — typically an
   * icon from `@lumia-ui/icons`. The component does NOT enforce a specific
   * icon source so future repos with different icon libraries can integrate.
   */
  icon?: ReactNode;
  /** Card headline rendered as `<h3>`. */
  headline: string;
  /** Card body copy. 2 lines on desktop is the visual target. */
  children: ReactNode;
};

/**
 * A single feature card. Renders as `<li>` so the parent grid stays a
 * semantic list. Uses `<h3>` because the parent section owns the `<h2>`.
 */
export const MarketingFeatureCard = forwardRef<
  HTMLLIElement,
  MarketingFeatureCardProps
>(function MarketingFeatureCard(
  { icon, headline, children, className, ...rest },
  ref,
) {
  return (
    <li
      ref={ref}
      data-lumia-marketing-feature-card=""
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-background p-6',
        'transition-colors motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <div
          data-marketing-feature-icon=""
          className="text-primary"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <h3 className="m-0 text-lg font-semibold text-foreground">{headline}</h3>
      <p className="m-0 text-sm text-muted-foreground sm:text-base">
        {children}
      </p>
    </li>
  );
});
