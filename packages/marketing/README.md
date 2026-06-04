# @lumia-ui/marketing

Landing-page primitives for the Xynes design system. Implements the LP-DS story from `xynes-front-end/infra/docs/plans/2026-06-04-landing-page-template/01-lumia-ds-marketing-primitives.md`.

> **Status:** ✅ Landed 2026-06-04 (LP-DS). Consumed by LP-AUTH, LP-CMS, LP-SDK, LP-LUMIA, LP-I18N, LP-APEX (all deferred until each repo's per-story implementation lands).

## What's in the package

| Export | Purpose |
|---|---|
| `MarketingNav` | Sticky top nav with brand left, CTAs right, sticky-blur on scroll, hamburger collapse < 768 px, Escape-to-close menu. Client component. |
| `MarketingHero` | Hero with text headline OR wordmark brand, sub-copy, primary + optional secondary CTA, optional eyebrow + footnote. Server-component friendly. |
| `MarketingFeatureGrid` + `MarketingFeatureCard` | Responsive 1/2/3/4-column grid. Cards render as `<li>` so the grid is a semantic list. Headlines are `<h3>` (parent section owns `<h2>`). |
| `MarketingTrustStrip` | OSS repo link (allowlisted hosts only), license `<Badge>`, security policy link, residency one-liner. Rendered as `<aside>`. |
| `MarketingFigureCard` | Lazy-loaded image / SVG with mandatory alt-text at the TypeScript type level. Cross-origin sources require explicit `allowedOrigins`. |
| `MarketingFAQ` | Wraps Lumia DS `<Accordion>` with marketing-tuned spacing. Supports single + multi-open. |
| `MarketingFooter` | 4-column footer with optional brand, support `mailto:` (sanitised — strips `?subject=` injection), copyright slot. |
| `CookieDisclosure` | Sticky, non-blocking, non-modal cookie disclosure. `localStorage`-only persistence (no cookie set, no tracker call). |
| `isSafeMarketingHref` / `isAllowedOssRepoUrl` | URL guards reused by consumers building their own marketing surfaces. |

The `<Brand>` component lives in `@lumia-ui/components` (it's used in dashboard shells too, not just marketing). Import it from there.

## Quick start

```tsx
import { Brand } from '@lumia-ui/components';
import {
  MarketingNav,
  MarketingHero,
  MarketingFeatureGrid,
  MarketingFeatureCard,
  MarketingTrustStrip,
  MarketingFooter,
  CookieDisclosure,
} from '@lumia-ui/marketing';

export default function LandingPage() {
  return (
    <>
      <MarketingNav
        brand={{ variant: 'icon', href: 'https://xynes.com', label: 'xynes' }}
        actions={[
          { label: 'Sign in', href: 'https://auth.xynes.com/login?redirect=…', variant: 'ghost' },
          { label: 'Sign up', href: 'https://auth.xynes.com/signup?redirect=…', variant: 'primary' },
        ]}
      />
      <main>
        <MarketingHero
          headline="Publish from your team's directory."
          subhead="Workspace-scoped content management built for teams."
          primaryCta={{ label: 'Sign up', href: 'https://auth.xynes.com/signup' }}
          secondaryCta={{ label: 'Sign in', href: 'https://auth.xynes.com/login' }}
        />
        <MarketingFeatureGrid heading="Why xynes" columns={3}>
          <MarketingFeatureCard headline="Directory-first">Your folders map to URLs.</MarketingFeatureCard>
          <MarketingFeatureCard headline="Workspace-scoped">Permissions follow your team.</MarketingFeatureCard>
          <MarketingFeatureCard headline="Open source">AGPL-3.0. No vendor lock-in.</MarketingFeatureCard>
        </MarketingFeatureGrid>
        <MarketingTrustStrip
          repoUrl="https://github.com/Xynes-Studio/lumia-ds"
          license="AGPL-3.0"
          residencyNote="Hosted in the EU."
        />
      </main>
      <MarketingFooter
        brand={{ variant: 'wordmark', href: '/', label: 'xynes' }}
        columns={[
          { heading: 'Product', links: [{ label: 'Auth', href: 'https://auth.xynes.com' }] },
          { heading: 'Developers', links: [{ label: 'Docs', href: 'https://docs.xynes.com', external: true }] },
          { heading: 'Company', links: [{ label: 'About', href: '/about' }] },
          { heading: 'Legal', links: [
            { label: 'Privacy', href: '/legal/privacy' },
            { label: 'Terms', href: '/legal/terms' },
            { label: 'Cookies', href: '/legal/cookies' },
          ] },
        ]}
        supportEmail="support@xynes.com"
        copyright={<span>© 2026 Xynes Studio. Built in the open.</span>}
      />
      <CookieDisclosure policyUrl="/legal/cookies" />
    </>
  );
}
```

## Sign-in / sign-up handshake (LP-* canonical)

Every CTA that should send the visitor into the platform follows the cross-app auth contract from `xynes-front-end/infra/docs/plans/2026-02-19-fe-cross-app-auth-architecture.md`:

- `Sign in` → `https://auth.xynes.com/login?redirect=<encoded return URL>`
- `Sign up` → `https://auth.xynes.com/signup?redirect=<encoded return URL>`

The redirect URL must satisfy `@xynes/auth-sdk`'s `isValidRedirectUrl` against the env-configured `allowedDomains: ['xynes.com']` allowlist. No landing page is allowed to render its own login form.

## Security invariants (regression-guarded)

- **Safe-URL guard.** Every `href` is filtered through `isSafeMarketingHref` before reaching the DOM. `javascript:` / `data:` / `vbscript:` / `file:` / empty / whitespace all rejected. CTAs / footer links / brand href / cookie policy URL all enforce this. Hostile inputs fall closed (component-specific: action filtered out, figure card returns `null`, cookie disclosure returns `null`, brand href falls back to `/`).
- **OSS link allowlist.** `MarketingTrustStrip` accepts `github.com`, `gitlab.com`, `gitea.io`, `codeberg.org` only. Anything else is silently omitted.
- **External link hygiene.** Every `target="_blank"` link carries `rel="noopener noreferrer"` and a sr-only `(opens in new tab)` hint.
- **No tracking.** Cookie disclosure persists dismissal in `localStorage` only — no cookie is set, no third-party network call is made. No primitive emits an outbound request unless explicitly fed an `analytics` callback (MVP never wires one).
- **`<a>` for CTAs, never `<button>` wrapped in `<a>`.** CTAs render as anchors styled with Lumia's exported `buttonStyles` helper (the workspace-root AGENTS.md rule against nesting `<a>` inside Lumia `<Button>` is preserved). Right-click "Open in new tab" works without JS.
- **Mailto sanitisation.** `MarketingFooter`'s `supportEmail` is stripped of `?subject=` / `?body=` / `#fragment` before composing the `mailto:` href — defends against accidental copy-paste injection.
- **Mandatory alt text at the TS level.** `MarketingFigureCard` enforces `alt: string` for non-decorative figures via a discriminated union. Decorative figures must opt in via `alt=""` AND `decorative={true}` AND render `role="presentation"`.
- **No `dangerouslySetInnerHTML` anywhere.** FAQ answers accept `ReactNode` so consumers compose JSX.
- **No inline brand SVG.** The `no-inline-xynes-brand` ESLint rule (`eslint.config.js` LP-DS block) forbids importing or inlining any SVG matching `xynes-(icon|wordmark)` outside `packages/components/src/brand/`. Smoke-tested with a hostile fixture during landing.

## Accessibility invariants (regression-guarded)

- `MarketingNav` is a `<nav aria-label="Primary">` landmark with a keyboard-driven hamburger menu (`aria-expanded` / `aria-controls`); Escape closes the menu; Tab past the last item closes the menu.
- `MarketingHero` is a `<section aria-labelledby>` with a single `<h1>`.
- Section primitives use `<section>` + `aria-labelledby` (when there's a heading) OR `aria-label` (when there isn't).
- Feature cards use `<h3>` because the parent section owns `<h2>`.
- `MarketingFooter` is a `<footer aria-label="Site footer">` landmark.
- `CookieDisclosure` is a `<div role="region" aria-label="Cookie disclosure">` — NOT a modal, NOT `aria-modal`, does NOT trap focus, does NOT block content interaction.
- Reduced-motion: the nav's scroll-blur transition is disabled under `prefers-reduced-motion: reduce` (Tailwind's `motion-reduce:` modifier).
- Every interactive element renders Lumia DS's visible focus ring (`focus-visible:ring-2 focus-visible:ring-primary-500`).

## Performance contract

- Per-package output: ESM `~26 KB` / CJS `~30 KB` / DTS `~20 KB`. Below the LP-DS plan §13 50 KiB ceiling.
- The `<Brand>` component ships its SVG inline (no follow-up network round trip). Each variant fits under 2 KiB raw.
- `MarketingFigureCard` uses `loading="lazy"` + `decoding="async"` by default.
- Every primitive is tree-shakeable; consumer apps pull only what they import.

## i18n posture

The primitives are translation-friendly: every visible string is a consumer prop. No hard-coded English copy lives inside the components except the fallback `aria-label` defaults (`Primary`, `Introduction`, `Trust and security`, `Site footer`, `Cookie disclosure`, `Frequently asked questions`, `Features`) which consumers should override for non-English deployments.

The LP-* per-repo stories own the actual marketing copy — they keep it in `docs/marketing-copy.md` so when the i18n epic extends to marketing routes the migration is mechanical (move strings into `messages/marketing.<locale>.json`, swap getter for `useTranslations`).

## Tests + coverage

99 unit tests across 10 files, run via `pnpm --filter @lumia-ui/marketing test`. Coverage gate 80 % across statements / branches / funcs / lines; current overall 99.11 % / 96.14 % / 100 % / 99.11 %.

Per-touched file:

| File | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| `disclosure/cookie-disclosure.tsx` | 96.29 | 84.61 | 100 | 96.29 |
| `faq/marketing-faq.tsx` | 100 | 100 | 100 | 100 |
| `feature-grid/marketing-feature-grid.tsx` | 100 | 100 | 100 | 100 |
| `figure-card/marketing-figure-card.tsx` | 96.77 | 94.11 | 100 | 96.77 |
| `footer/marketing-footer.tsx` | 95.23 | 96 | 100 | 95.23 |
| `hero/marketing-hero.tsx` | 100 | 94.73 | 100 | 100 |
| `lib/utils.ts` | 93.75 | 96 | 100 | 93.75 |
| `nav/marketing-nav.tsx` | 98.82 | 93.18 | 100 | 98.82 |
| `trust-strip/marketing-trust-strip.tsx` | 98.52 | 92.3 | 100 | 98.52 |

## Out of scope

- Customer logo clouds with fabricated logos (LP-DS plan §3 anti-AI guard).
- Carousels / Lottie / auto-rotating testimonials.
- Storyblok / Sanity / Contentful integrations.
- Per-locale brand variants (i18n epic owns this).
- A dedicated `@lumia-ui/marketing-themes` token set — primitives use existing `@lumia-ui/tokens`.
