import { describe, expect, it } from 'vitest';

import { MarketingHero } from './marketing-hero';
import { createTestRoot, render, teardown } from '../lib/test-utils';

describe('<MarketingHero>', () => {
  it('renders headline + subhead + primary CTA', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Publish from your team's directory."
        subhead="Workspace-scoped content management for teams that ship."
        primaryCta={{
          label: 'Sign up',
          href: 'https://auth.xynes.com/signup',
        }}
      />,
    );
    const h1 = ctx.host.querySelector('h1');
    expect(h1?.textContent).toBe("Publish from your team's directory.");
    expect(ctx.host.textContent).toContain('Workspace-scoped');
    const cta = ctx.host.querySelector(
      'a[href="https://auth.xynes.com/signup"]',
    );
    expect(cta).toBeTruthy();
    expect(cta?.tagName).toBe('A');
    await teardown(ctx);
  });

  it('renders the secondary CTA as a ghost-styled anchor', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Headline"
        subhead="Sub"
        primaryCta={{ label: 'Sign up', href: '/signup' }}
        secondaryCta={{ label: 'Sign in', href: '/login' }}
      />,
    );
    const signIn = ctx.host.querySelector('a[href="/login"]');
    expect(signIn).toBeTruthy();
    expect(signIn?.tagName).toBe('A');
    await teardown(ctx);
  });

  it('drops CTAs with unsafe href values', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Headline"
        subhead="Sub"
        primaryCta={{ label: 'Evil', href: 'javascript:alert(1)' }}
        secondaryCta={{ label: 'Safe', href: '/safe' }}
      />,
    );
    const all = Array.from(ctx.host.querySelectorAll('a'));
    expect(all.find((a) => a.getAttribute('href') === '/safe')).toBeTruthy();
    expect(
      all.find((a) => a.getAttribute('href')?.startsWith('javascript:')),
    ).toBeUndefined();
    await teardown(ctx);
  });

  it('renders the wordmark brand when headline is the literal "brand"', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="brand"
        subhead="Sub"
        primaryCta={{ label: 'Sign up', href: '/signup' }}
      />,
    );
    const h1 = ctx.host.querySelector('h1');
    expect(h1?.querySelector('[data-lumia-brand="wordmark"]')).toBeTruthy();
    await teardown(ctx);
  });

  it('renders the optional eyebrow above the headline', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        eyebrow="Open source"
        headline="Headline"
        subhead="Sub"
        primaryCta={{ label: 'Sign up', href: '/signup' }}
      />,
    );
    expect(
      ctx.host.querySelector('[data-marketing-eyebrow]')?.textContent,
    ).toBe('Open source');
    await teardown(ctx);
  });

  it('renders the optional footnote below the CTAs', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Headline"
        subhead="Sub"
        primaryCta={{ label: 'Sign up', href: '/signup' }}
        footnote={<span>No credit card required.</span>}
      />,
    );
    expect(ctx.host.textContent).toContain('No credit card required.');
    await teardown(ctx);
  });

  it('uses an aria-labelledby pointing at the heading id', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Headline"
        subhead="Sub"
        primaryCta={{ label: 'Sign up', href: '/signup' }}
      />,
    );
    const section = ctx.host.querySelector('section');
    const h1 = ctx.host.querySelector('h1');
    expect(section?.getAttribute('aria-labelledby')).toBe(
      h1?.getAttribute('id'),
    );
    await teardown(ctx);
  });

  it('forwards target="_blank" CTAs with rel and sr-only hint', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingHero
        headline="Headline"
        subhead="Sub"
        primaryCta={{
          label: 'Docs',
          href: 'https://docs.example.com',
          target: '_blank',
        }}
      />,
    );
    const docs = ctx.host.querySelector('a[href="https://docs.example.com"]');
    expect(docs?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(docs?.textContent).toContain('opens in new tab');
    await teardown(ctx);
  });
});
