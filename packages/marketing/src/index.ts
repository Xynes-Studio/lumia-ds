/**
 * `@lumia-ui/marketing` — landing-page primitives.
 *
 * Public surface uses per-symbol re-exports (PFU-5 pattern from
 * `xynes-front-end/lumia-ds`) so linked-workspace consumers
 * (`xynes-auth-app`, `xynes-cms-console-web`, future apex `xynes-marketing-web`)
 * resolve every component + props type cleanly under `tsc --noEmit` even when
 * the package is consumed via `link:` rather than a published tarball.
 *
 * @see LP-DS plan §4 (API contract) at
 *   `xynes-front-end/infra/docs/plans/2026-06-04-landing-page-template/01-lumia-ds-marketing-primitives.md`.
 */
import './styles.css';

// Marketing primitives.
export { MarketingNav } from './nav/marketing-nav';
export type { MarketingNavProps } from './nav/marketing-nav';

export { MarketingHero } from './hero/marketing-hero';
export type { MarketingHeroProps } from './hero/marketing-hero';

export {
  MarketingFeatureGrid,
  MarketingFeatureCard,
} from './feature-grid/marketing-feature-grid';
export type {
  MarketingFeatureGridProps,
  MarketingFeatureGridColumns,
  MarketingFeatureCardProps,
} from './feature-grid/marketing-feature-grid';

export { MarketingTrustStrip } from './trust-strip/marketing-trust-strip';
export type { MarketingTrustStripProps } from './trust-strip/marketing-trust-strip';

export { MarketingFigureCard } from './figure-card/marketing-figure-card';
export type { MarketingFigureCardProps } from './figure-card/marketing-figure-card';

export { MarketingFAQ } from './faq/marketing-faq';
export type { MarketingFAQProps, MarketingFAQItem } from './faq/marketing-faq';

export { MarketingFooter } from './footer/marketing-footer';
export type { MarketingFooterProps } from './footer/marketing-footer';

export {
  CookieDisclosure,
  COOKIE_DISCLOSURE_STORAGE_KEY,
} from './disclosure/cookie-disclosure';
export type { CookieDisclosureProps } from './disclosure/cookie-disclosure';

// Shared types + helpers (re-exported so consumers can build typed copy).
export type {
  MarketingCta,
  MarketingBrand,
  MarketingFooterColumn,
  MarketingFooterLink,
  MarketingLicense,
} from './lib/types';

export {
  isSafeMarketingHref,
  isAllowedOssRepoUrl,
  MARKETING_OSS_HOST_ALLOWLIST,
} from './lib/utils';
