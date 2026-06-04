import type { SVGProps } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

/**
 * Variant of the Xynes brand mark.
 *
 * - `wordmark` — the full "xynes" wordmark, designed for header/landing surfaces.
 * - `icon` — the square X-Y monogram with the brand gradient, for compact contexts
 *   (favicons, mobile nav, dashboard rails).
 */
export type BrandVariant = 'wordmark' | 'icon';

/**
 * Visual size of the brand. Translates to a Tailwind height utility; SVG
 * scales by its viewBox so the rendered width follows the source aspect ratio.
 */
export type BrandSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<BrandSize, string> = {
  xs: 'h-4',
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
};

const baseClasses =
  'inline-block w-auto select-none text-foreground [&_svg]:h-full [&_svg]:w-auto';

/**
 * Public props for {@link Brand}. The component renders a span wrapper so the
 * SVG inherits `color` via `currentColor`. Either `aria-label` or
 * `aria-hidden="true"` must be supplied — when the variant is `wordmark`,
 * unlabelled instances are an accessibility bug (the wordmark itself encodes
 * the product name to a sighted user but is invisible to assistive tech
 * without an explicit label or a decorative opt-out).
 */
export type BrandProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'ref' | 'role' | 'viewBox' | 'fill' | 'xmlns'
> & {
  variant: BrandVariant;
  /**
   * Visual height. Defaults to `md` (`h-8`).
   */
  size?: BrandSize;
  /**
   * Accessible label. Required unless `aria-hidden` is explicitly set to
   * `true` (decorative usage). The TypeScript type-system enforces this via
   * the {@link BrandLabelledProps} / {@link BrandDecorativeProps} discriminated
   * union below.
   */
  'aria-label'?: string;
  /**
   * Mark the brand as decorative. When `true`, `aria-label` is omitted and
   * the SVG is hidden from assistive tech.
   */
  'aria-hidden'?: boolean | 'true' | 'false';
  /**
   * Extra Tailwind classes appended after the size class.
   */
  className?: string;
};

/**
 * Type-level guard: either `aria-label` must be supplied (labelled) or
 * `aria-hidden` must be the literal `true` (decorative). Consumers get a
 * TypeScript error if both are omitted.
 */
export type BrandLabelledProps = BrandProps & {
  'aria-label': string;
  'aria-hidden'?: false | 'false';
};

export type BrandDecorativeProps = BrandProps & {
  'aria-hidden': true | 'true';
  'aria-label'?: never;
};

const wordmarkPaths = [
  // Reference: packages/components/src/brand/assets/xynes-wordmark.svg
  // The SVG is inlined here to keep the component a single bundled chunk
  // (no follow-up network roundtrip on first paint). The viewBox / path data
  // matches the prepared asset byte-for-byte; tests guard against drift.
  'M0 395.5V0H187.25V395.5H0ZM109.2 320.95H177.8V301H158.2L108.15 241.85L156.8 185.15H175V165.2H112.7V185.15H131.25L95.2 229.25L60.2 185.15H81.2V165.2H10.15V185.15H31.15L80.5 243.25L31.5 301H10.15V320.95H74.9V301H56.35L93.1 256.2L129.5 301H109.2V320.95Z',
  'M178.76 395.5V0H364.61V395.5H290.06V375.55H263.46L284.46 320.95L339.41 185.15H357.96V165.2H289.36V185.15H314.56L275.71 289.8H273.61L229.86 185.15H257.16V165.2H185.06V185.15H203.61L260.31 320.6L240.01 375.55H210.96V395.5H178.76Z',
  'M356.152 395.5V0H564.052V395.5H356.152ZM478.302 320.95H557.052V301H530.102V221.2C530.102 200.433 524.969 185.383 514.702 176.05C504.436 166.717 491.719 162.05 476.552 162.05C451.352 162.05 433.152 172.317 421.952 192.85V165.2H369.452V185.15H397.452V301H370.152V320.95H449.252V301H421.952V228.2C422.419 216.3 426.852 205.8 435.252 196.7C443.886 187.367 455.202 182.7 469.202 182.7C479.702 182.7 488.336 186.2 495.102 193.2C501.869 199.967 505.252 211.75 505.252 228.55V301H478.302V320.95Z',
  'M555.762 395.5V0H727.262V395.5H555.762ZM711.512 276.15L690.862 271.6C688.528 281.167 683.862 288.867 676.862 294.7C669.862 300.533 660.178 303.45 647.812 303.45C616.312 303.45 599.862 285.25 598.462 248.85H708.012C709.412 242.55 710.112 236.367 710.112 230.3C709.878 211.867 704.162 195.883 692.962 182.35C681.762 168.817 665.428 162.05 643.962 162.05C622.028 162.05 604.645 169.867 591.812 185.5C578.978 201.133 572.562 221.083 572.562 245.35C572.562 270.55 579.328 290.033 592.862 303.8C606.395 317.567 624.128 324.45 646.062 324.45C665.195 324.45 680.362 319.783 691.562 310.45C702.762 300.883 709.412 289.45 711.512 276.15ZM684.212 230.65H598.812C600.445 217.583 604.645 206.267 611.412 196.7C618.178 187.133 628.795 182.35 643.262 182.35C658.428 182.35 669.278 187.483 675.812 197.75C682.578 208.017 685.378 218.983 684.212 230.65Z',
  'M718.799 395.5V0H878.749V395.5H718.799ZM861.949 275.8C861.949 263.433 858.682 254.333 852.149 248.5C845.616 242.433 837.566 238.233 827.999 235.9C818.432 233.567 808.865 231.7 799.299 230.3C789.732 228.667 781.682 226.217 775.149 222.95C768.615 219.45 765.349 213.617 765.349 205.45C765.349 197.517 768.499 191.683 774.799 187.95C781.099 184.217 789.149 182.35 798.949 182.35C810.382 182.35 820.999 184.917 830.799 190.05L834.649 215.25L854.949 212.8L851.099 176.4C844.565 172.433 836.516 169.05 826.949 166.25C817.616 163.45 807.582 162.05 796.849 162.05C782.615 162.05 769.432 165.433 757.299 172.2C745.165 178.967 739.099 190.633 739.099 207.2C739.099 219.333 742.365 228.317 748.899 234.15C755.432 239.75 763.599 243.717 773.399 246.05C783.199 248.383 792.882 250.367 802.449 252C812.249 253.633 820.416 256.2 826.949 259.7C833.482 263.2 836.749 269.267 836.749 277.9C836.749 286.767 832.432 293.417 823.799 297.85C815.399 302.05 805.716 304.15 794.749 304.15C782.382 304.15 770.832 301.583 760.099 296.45L761.149 275.8L741.549 273.7L736.649 309.05C743.415 313.483 752.165 317.217 762.899 320.25C773.865 323.05 784.832 324.45 795.799 324.45C814.465 324.45 830.099 320.133 842.699 311.5C855.532 302.867 861.949 290.967 861.949 275.8Z',
];

// Icon variant gradient stops — these match the prepared asset and the
// LP-DS plan §3.2 reference colours byte-for-byte. The conic gradient from
// the original Figma export is flattened into a single linear gradient so
// Safari + strict-CSP environments render the icon without a foreignObject.
const ICON_GRADIENT_STOPS: ReadonlyArray<{
  offset: string;
  color: string;
}> = [
  { offset: '0', color: 'rgb(111,109,241)' },
  { offset: '0.1875', color: 'rgb(254,0,193)' },
  { offset: '0.4115', color: 'rgb(254,0,0)' },
  { offset: '0.6406', color: 'rgb(255,241,0)' },
  { offset: '0.8073', color: 'rgb(0,255,1)' },
  { offset: '1', color: 'rgb(101,254,215)' },
];

const iconClipPath = 'M109 109H0V0h109v109ZM27 23v69h65V23H27Z';
const iconLetterPath =
  'M26.232 93.632V21.312h34.24v72.32H26.232Zm19.968-13.632h12.544v-3.648H55.16L46.008 65.536 54.904 55.168h3.328V51.52H46.84v3.648h3.392L43.64 63.232l-6.4-8.064h3.84V51.52H28.088v3.648h3.84L40.952 65.792 31.992 76.352h-3.904V80h11.84v-3.648h-3.392l6.72-8.192L48.376 76.352H46.2V80Zm12.7195 13.632V21.312h33.984v72.32H79.2715v-3.648h-4.864l3.84-9.984L88.2955 55.168h3.392V51.52H79.1435v3.648h4.608L76.6475 74.304h-.384L68.2635 55.168h4.992V51.52H60.0715v3.648h3.392L73.8315 79.936 70.1195 89.984h-5.312v3.648H58.9195Z';

/**
 * Renders the Xynes brand wordmark or icon as an inline SVG. The component is
 * tree-shakeable and emits zero network requests on mount — the SVG bytes
 * ship inside the component bundle so the brand renders on first paint.
 *
 * Accessibility (enforced at the TypeScript level via the
 * {@link BrandLabelledProps} | {@link BrandDecorativeProps} discriminated
 * union — see Codex review on PR #229):
 *   - `<Brand variant="wordmark" aria-label="xynes" />` — labelled (default).
 *   - `<Brand variant="icon" aria-hidden />` — decorative (e.g. paired with a
 *     visible "xynes" text label nearby).
 *
 * @see LP-DS plan §3 (asset preparation) and §4 (API contract) at
 *   `xynes-front-end/infra/docs/plans/2026-06-04-landing-page-template/01-lumia-ds-marketing-primitives.md`.
 */
export const Brand = forwardRef<
  SVGSVGElement,
  BrandLabelledProps | BrandDecorativeProps
>(function Brand(
  {
    variant,
    size = 'md',
    className,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...rest
  },
  ref,
) {
  const isDecorative = ariaHidden === true || ariaHidden === 'true';
  const effectiveAriaLabel =
    isDecorative || ariaLabel === undefined ? undefined : ariaLabel;
  const titleId =
    !isDecorative && effectiveAriaLabel
      ? `lumia-brand-${variant}-${deterministicSuffix(effectiveAriaLabel)}`
      : undefined;

  const sharedSvgProps = {
    ref,
    role: 'img' as const,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    focusable: false as const,
    'aria-hidden': isDecorative ? true : undefined,
    'aria-labelledby': titleId,
    ...rest,
  };

  return (
    <span
      data-lumia-brand={variant}
      className={cn(baseClasses, sizeClasses[size], className)}
    >
      {variant === 'wordmark' ? (
        <svg viewBox="0 0 879 396" {...sharedSvgProps}>
          {titleId ? <title id={titleId}>{effectiveAriaLabel}</title> : null}
          {wordmarkPaths.map((d) => (
            <path key={d} d={d} fill="currentColor" />
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 109 109" {...sharedSvgProps}>
          {titleId ? <title id={titleId}>{effectiveAriaLabel}</title> : null}
          <defs>
            <linearGradient
              id="lumia-brand-icon-gradient"
              x1="0"
              y1="0"
              x2="74"
              y2="0"
              gradientUnits="userSpaceOnUse"
              gradientTransform="rotate(45 37 37)"
            >
              {ICON_GRADIENT_STOPS.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>
          <rect
            x="24"
            y="28"
            width="74"
            height="74"
            fill="url(#lumia-brand-icon-gradient)"
          />
          <path d={iconClipPath} fill="currentColor" />
          <path d={iconLetterPath} fill="currentColor" />
        </svg>
      )}
    </span>
  );
});

// Deterministic suffix derived from the label so SSR + first client render
// produce the same DOM (avoids React 18 hydration warnings without pulling in
// `useId` which would force a `'use client'` boundary on every consumer). This
// is intentionally NOT a React hook — it's a pure string hash; the `use*`
// naming convention is reserved for hooks.
function deterministicSuffix(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6);
}

export const brandStyles = {
  base: baseClasses,
  sizes: sizeClasses,
};
