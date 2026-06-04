/**
 * Shared types for the marketing primitives.
 *
 * Each public component documents its own props inline. This module collects
 * the cross-component contracts (call-to-action shape, brand reference,
 * footer column shape) so consumers get one place to import the structural
 * helper types from.
 */
import type { BrandSize, BrandVariant } from '@lumia-ui/components';

/**
 * A call-to-action button rendered as an `<a>` (so right-click "Open in new
 * tab" works without JS). Renderers MUST validate the `href` against the
 * `isSafeMarketingHref` guard before composing the anchor.
 */
export type MarketingCta = {
  /** Visible label. Must be plain text — no rich content. */
  label: string;
  /** Anchor target. Validated by `isSafeMarketingHref`. */
  href: string;
  /** Visual variant. Defaults vary per parent component. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** Optional `target` (defaults to same-origin / `_self`). */
  target?: '_self' | '_blank';
  /**
   * Optional analytics-friendly id. The marketing primitives do NOT wire any
   * analytics by default; consumers attach a handler at the parent level if
   * needed.
   */
  id?: string;
};

/**
 * Reference to the brand mark rendered in nav / footer slots. The marketing
 * components delegate the actual SVG render to `<Brand>` from
 * `@lumia-ui/components`.
 */
export type MarketingBrand = {
  variant: BrandVariant;
  size?: BrandSize;
  /** Where the brand mark links to (typically the apex URL). */
  href: string;
  /** Accessible label for the brand mark. */
  label?: string;
};

/**
 * A single footer column. The plan calls for four columns: Product /
 * Developers / Company / Legal. Consumers compose any shape they need;
 * the component only enforces the structural contract.
 */
export type MarketingFooterColumn = {
  /** Section heading rendered as `<h3>` for assistive tech. */
  heading: string;
  /** Ordered list of links rendered as `<li>` rows. */
  links: ReadonlyArray<MarketingFooterLink>;
};

export type MarketingFooterLink = {
  label: string;
  href: string;
  /** External links should set this so the screen-reader hint renders. */
  external?: boolean;
  /** Optional opaque id for analytics consumers. */
  id?: string;
};

/**
 * License identifier shown on the trust strip. Constrained at the type level
 * to common OSS choices so a typo at the call-site is a compile error rather
 * than a copy bug in production.
 */
export type MarketingLicense =
  | 'AGPL-3.0'
  | 'AGPL-3.0-or-later'
  | 'MIT'
  | 'Apache-2.0'
  | 'BSD-3-Clause'
  | 'MPL-2.0'
  | 'GPL-3.0'
  | 'ISC'
  | 'Proprietary';
