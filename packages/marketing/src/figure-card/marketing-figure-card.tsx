import { forwardRef } from 'react';
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

import { cn, isSafeMarketingHref } from '../lib/utils';

type LabelledFigure = {
  /** Mandatory alt text. Empty string allowed ONLY when `decorative` is true. */
  alt: string;
  decorative?: false;
};

type DecorativeFigure = {
  alt: '';
  decorative: true;
};

export type MarketingFigureCardProps = HTMLAttributes<HTMLElement> & {
  /**
   * Image / SVG source URL. Must be a relative URL or one of the
   * `allowedOrigins` URLs.
   */
  src: string;
  /** Optional list of allowed cross-origin hosts. Defaults to `[]` (same-origin only). */
  allowedOrigins?: ReadonlyArray<string>;
  /** Optional caption rendered as `<figcaption>`. */
  caption?: ReactNode;
  /** Image width hint for layout-stability (CLS budget). */
  width?: number;
  /** Image height hint for layout-stability. */
  height?: number;
  /**
   * Optional native `<img>` loading strategy. Defaults to `lazy` (LP-DS §9
   * performance contract).
   */
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
} & (LabelledFigure | DecorativeFigure);

const isSafeImageSrc = (
  src: string,
  allowedOrigins: ReadonlyArray<string>,
): boolean => {
  if (!isSafeMarketingHref(src)) return false;
  if (src.startsWith('/') || src.startsWith('#')) return true;
  try {
    const parsed = new URL(src);
    return allowedOrigins.some(
      (origin) => parsed.host.toLowerCase() === origin.toLowerCase(),
    );
  } catch {
    return false;
  }
};

/**
 * Lazy-loaded figure card for landing-page architecture diagrams + product
 * shots. Forces alt text at the TypeScript type level — decorative figures
 * must opt-in via `alt=""` AND `decorative={true}`.
 *
 * Per the LP-DS performance contract, `loading="lazy"` and
 * `decoding="async"` are the defaults.
 */
export const MarketingFigureCard = forwardRef<
  HTMLElement,
  MarketingFigureCardProps
>(function MarketingFigureCard(
  {
    src,
    alt,
    decorative,
    allowedOrigins = [],
    caption,
    width,
    height,
    className,
    loading = 'lazy',
    ...rest
  },
  ref,
) {
  const safe = isSafeImageSrc(src, allowedOrigins);
  if (!safe) {
    return null;
  }
  return (
    <figure
      ref={ref}
      data-lumia-marketing-figure-card=""
      className={cn(
        'mx-auto w-full max-w-[64rem] px-4 sm:px-6 py-8',
        className,
      )}
      {...rest}
    >
      <img
        src={src}
        alt={decorative ? '' : alt}
        role={decorative ? 'presentation' : undefined}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        className="block w-full rounded-lg border border-border"
      />
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
});
