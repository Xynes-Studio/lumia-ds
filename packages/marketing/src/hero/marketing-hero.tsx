import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { Brand, buttonStyles } from '@lumia-ui/components';

import { cn, isSafeMarketingHref } from '../lib/utils';
import type { MarketingCta } from '../lib/types';

export type MarketingHeroProps = HTMLAttributes<HTMLElement> & {
  /**
   * Hero headline. Renders as `<h1>`. When the consumer wants the wordmark
   * brand as the primary visual, pass `'brand'` and the hero will render the
   * Lumia `<Brand variant="wordmark">` instead.
   */
  headline: string | 'brand';
  /** One-sentence positioning copy below the headline. */
  subhead: string;
  /** Optional eyebrow above the headline (kicker). Plain text only. */
  eyebrow?: string;
  /** Primary CTA. Rendered as an `<a>` styled like a primary button. */
  primaryCta: MarketingCta;
  /** Optional secondary CTA. Rendered as an `<a>` styled like a ghost button. */
  secondaryCta?: MarketingCta;
  /**
   * Slot rendered below the CTA row — typical use is a small trust line
   * ("No credit card required") or a value-prop chip.
   */
  footnote?: ReactNode;
  /**
   * Accessible label for the hero `<section>` landmark. Defaults to
   * `"Introduction"`.
   */
  'aria-label'?: string;
};

const ctaClass = (variant: MarketingCta['variant']): string =>
  cn(
    buttonStyles.base,
    buttonStyles.sizes.lg,
    buttonStyles.variants[variant ?? 'primary'],
  );

const renderCta = (
  cta: MarketingCta,
  fallbackVariant: MarketingCta['variant'],
) => {
  if (!isSafeMarketingHref(cta.href)) return null;
  return (
    <a
      key={`${cta.label}:${cta.href}`}
      href={cta.href}
      target={cta.target}
      rel={cta.target === '_blank' ? 'noopener noreferrer' : undefined}
      data-cta-id={cta.id}
      className={ctaClass(cta.variant ?? fallbackVariant)}
    >
      {cta.label}
      {cta.target === '_blank' ? (
        <span className="sr-only"> (opens in new tab)</span>
      ) : null}
    </a>
  );
};

/**
 * Marketing hero — wordmark or text headline, sub-copy, two CTAs, optional
 * eyebrow + footnote. No carousel, no autoplay video (LP-DS §3 anti-AI
 * guard).
 *
 * Server-component-friendly (no client hooks).
 *
 * @see LP-DS plan §3 (forbidden patterns) and §4 (API contract).
 */
export const MarketingHero = forwardRef<HTMLElement, MarketingHeroProps>(
  function MarketingHero(
    {
      headline,
      subhead,
      eyebrow,
      primaryCta,
      secondaryCta,
      footnote,
      className,
      'aria-label': ariaLabel = 'Introduction',
      ...rest
    },
    ref,
  ) {
    const headingId = 'marketing-hero-heading';

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        aria-label={ariaLabel}
        data-lumia-marketing-hero=""
        className={cn(
          'mx-auto w-full max-w-[64rem] px-4 sm:px-6',
          'py-16 sm:py-24 lg:py-32',
          'flex flex-col items-start gap-6 text-left',
          'motion-reduce:transition-none',
          className,
        )}
        {...rest}
      >
        {eyebrow ? (
          <p
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            data-marketing-eyebrow=""
          >
            {eyebrow}
          </p>
        ) : null}
        {headline === 'brand' ? (
          <h1 id={headingId} className="m-0">
            <Brand variant="wordmark" size="xl" aria-label="xynes" />
          </h1>
        ) : (
          <h1
            id={headingId}
            className={cn(
              'm-0 text-4xl font-bold tracking-tight text-foreground',
              'sm:text-5xl lg:text-6xl',
            )}
          >
            {headline}
          </h1>
        )}
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {subhead}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {renderCta(primaryCta, 'primary')}
          {secondaryCta ? renderCta(secondaryCta, 'ghost') : null}
        </div>
        {footnote ? (
          <div className="text-sm text-muted-foreground">{footnote}</div>
        ) : null}
      </section>
    );
  },
);
