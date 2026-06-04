import { describe, expect, it } from 'vitest';

import { MarketingFooter } from './marketing-footer';
import { createTestRoot, render, teardown } from '../lib/test-utils';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Auth', href: 'https://auth.xynes.com' },
      { label: 'CMS', href: 'https://cms.xynes.com' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'Docs', href: 'https://docs.xynes.com', external: true },
      {
        label: 'GitHub',
        href: 'https://github.com/Xynes-Studio',
        external: true,
      },
    ],
  },
  {
    heading: 'Company',
    links: [{ label: 'About', href: '/about' }],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Cookies', href: '/legal/cookies' },
    ],
  },
];

describe('<MarketingFooter>', () => {
  it('renders every column heading as an <h3>', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFooter columns={columns} />);
    const h3s = Array.from(ctx.host.querySelectorAll('footer h3')).map(
      (h) => h.textContent,
    );
    expect(h3s).toEqual(['Product', 'Developers', 'Company', 'Legal']);
    await teardown(ctx);
  });

  it('renders external links with rel + sr-only hint', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFooter columns={columns} />);
    const docs = ctx.host.querySelector(
      'footer a[href="https://docs.xynes.com"]',
    );
    expect(docs?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(docs?.textContent).toContain('opens in new tab');
    await teardown(ctx);
  });

  it('omits internal links from the rel="noopener noreferrer" treatment', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFooter columns={columns} />);
    const about = ctx.host.querySelector('footer a[href="/about"]');
    expect(about?.getAttribute('rel')).toBeNull();
    expect(about?.textContent).toBe('About');
    await teardown(ctx);
  });

  it('filters out unsafe href values', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter
        columns={[
          {
            heading: 'Hostile',
            links: [
              { label: 'Evil', href: 'javascript:alert(1)' },
              { label: 'Safe', href: '/safe' },
            ],
          },
        ]}
      />,
    );
    expect(ctx.host.querySelector('footer a[href^="javascript:"]')).toBeNull();
    expect(ctx.host.querySelector('footer a[href="/safe"]')).toBeTruthy();
    await teardown(ctx);
  });

  it('renders a sanitised mailto: when supportEmail is supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter columns={columns} supportEmail="support@xynes.com" />,
    );
    const support = ctx.host.querySelector(
      'a[href="mailto:support@xynes.com"]',
    );
    expect(support).toBeTruthy();
    expect(support?.textContent).toBe('support@xynes.com');
    await teardown(ctx);
  });

  it('strips ?subject= injection from supportEmail before composing the mailto:', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter
        columns={columns}
        supportEmail="support@xynes.com?subject=Hijacked&body=evil"
      />,
    );
    const support = ctx.host.querySelector('a[href^="mailto:"]');
    expect(support?.getAttribute('href')).toBe('mailto:support@xynes.com');
    expect(support?.getAttribute('href')).not.toContain('subject');
    expect(support?.getAttribute('href')).not.toContain('body');
    await teardown(ctx);
  });

  it('omits the support link entirely when the email is malformed', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter columns={columns} supportEmail="not-an-email" />,
    );
    expect(ctx.host.querySelector('a[href^="mailto:"]')).toBeNull();
    await teardown(ctx);
  });

  it('renders the copyright slot when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter
        columns={columns}
        copyright={<span>© 2026 Xynes Studio.</span>}
      />,
    );
    expect(
      ctx.host.querySelector('[data-marketing-footer-copyright]')?.textContent,
    ).toBe('© 2026 Xynes Studio.');
    await teardown(ctx);
  });

  it('renders the optional brand mark with the supplied label', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFooter
        columns={columns}
        brand={{ variant: 'wordmark', href: '/', label: 'xynes' }}
      />,
    );
    const brand = ctx.host.querySelector(
      'footer [data-lumia-brand="wordmark"]',
    );
    expect(brand).toBeTruthy();
    expect(brand?.querySelector('title')?.textContent).toBe('xynes');
    await teardown(ctx);
  });

  it('uses footer landmark with default aria-label', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingFooter columns={columns} />);
    const footer = ctx.host.querySelector('footer');
    expect(footer?.getAttribute('aria-label')).toBe('Site footer');
    await teardown(ctx);
  });
});
