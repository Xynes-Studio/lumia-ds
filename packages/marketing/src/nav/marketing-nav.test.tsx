import { describe, expect, it } from 'vitest';
import { act } from 'react';

import { MarketingNav } from './marketing-nav';
import { createTestRoot, render, teardown } from '../lib/test-utils';

const baseProps = {
  brand: {
    variant: 'icon' as const,
    href: 'https://xynes.com',
    label: 'xynes',
  },
  actions: [
    {
      label: 'Sign in',
      href: 'https://auth.xynes.com/login?redirect=https%3A%2F%2Fcms.xynes.com',
      variant: 'ghost' as const,
    },
    {
      label: 'Sign up',
      href: 'https://auth.xynes.com/signup?redirect=https%3A%2F%2Fcms.xynes.com',
      variant: 'primary' as const,
    },
  ],
};

describe('<MarketingNav>', () => {
  it('renders the brand mark with the supplied label', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const brand = ctx.host.querySelector('[data-lumia-brand]');
    expect(brand).toBeTruthy();
    expect(ctx.host.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Primary',
    );
    await teardown(ctx);
  });

  it('renders all safe CTAs as <a> elements (not <button>)', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const anchors = Array.from(
      ctx.host.querySelectorAll('nav a[href^="https://auth.xynes.com"]'),
    );
    // Both desktop + mobile rows render the actions, but mobile rows only
    // show when the menu is open. Filter for visible action anchors only.
    expect(anchors.length).toBeGreaterThanOrEqual(2);
    anchors.forEach((a) => expect(a.tagName).toBe('A'));
    await teardown(ctx);
  });

  it('filters out CTAs with unsafe href values (javascript:)', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav
        brand={baseProps.brand}
        actions={[
          { label: 'Safe', href: '/safe', variant: 'ghost' },
          {
            label: 'Evil',
            href: 'javascript:alert(1)',
            variant: 'primary',
          },
        ]}
      />,
    );
    const anchors = Array.from(ctx.host.querySelectorAll('nav a'));
    const labels = anchors.map((a) => a.textContent?.trim());
    expect(labels.some((l) => l?.includes('Safe'))).toBe(true);
    expect(labels.some((l) => l?.includes('Evil'))).toBe(false);
    await teardown(ctx);
  });

  it('renders external CTAs with rel="noopener noreferrer" and a sr-only hint', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav
        brand={baseProps.brand}
        actions={[
          {
            label: 'Docs',
            href: 'https://docs.example.com',
            target: '_blank',
            variant: 'ghost',
          },
        ]}
      />,
    );
    const external = ctx.host.querySelector(
      'nav a[href="https://docs.example.com"]',
    );
    expect(external?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(external?.textContent).toContain('opens in new tab');
    await teardown(ctx);
  });

  it('renders a hamburger toggle that announces aria-expanded state', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const toggle = ctx.host.querySelector(
      'button[aria-controls]',
    ) as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Open menu');
    await teardown(ctx);
  });

  it('falls back to a safe href when the brand href fails the safe-URL guard', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav
        brand={{
          variant: 'icon',
          href: 'javascript:alert(1)',
          label: 'xynes',
        }}
        actions={[]}
      />,
    );
    const brandAnchor = ctx.host.querySelector(
      'nav a[aria-label="xynes"]',
    ) as HTMLAnchorElement;
    expect(brandAnchor.getAttribute('href')).toBe('/');
    await teardown(ctx);
  });

  it('treats the brand mark as decorative when no label is supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav brand={{ variant: 'icon', href: '/' }} actions={[]} />,
    );
    // The aria-label on the wrapping anchor defaults to "xynes home" when the
    // brand prop has no label — the <Brand> itself is hidden from AT.
    const brandAnchor = ctx.host.querySelector(
      'nav a[aria-label="xynes home"]',
    );
    expect(brandAnchor).toBeTruthy();
    const svg = brandAnchor?.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    await teardown(ctx);
  });

  it('exposes the nav landmark with a custom aria-label when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav {...baseProps} aria-label="Marketing site" />,
    );
    expect(ctx.host.querySelector('nav')?.getAttribute('aria-label')).toBe(
      'Marketing site',
    );
    await teardown(ctx);
  });

  it('toggles the mobile menu open + closed on hamburger click', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const toggle = ctx.host.querySelector(
      'button[aria-controls]',
    ) as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(ctx.host.querySelector('[role="menu"]')).toBeNull();
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Close menu');
    const menu = ctx.host.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(menu?.querySelectorAll('a[role="menuitem"]').length).toBe(2);
    // Close
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(ctx.host.querySelector('[role="menu"]')).toBeNull();
    await teardown(ctx);
  });

  it('closes the mobile menu when Escape is pressed at the document level', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const toggle = ctx.host.querySelector(
      'button[aria-controls]',
    ) as HTMLButtonElement;
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(ctx.host.querySelector('[role="menu"]')).toBeTruthy();
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    expect(ctx.host.querySelector('[role="menu"]')).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await teardown(ctx);
  });

  it('closes the menu when Tab is pressed past the last focusable element', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} />);
    const toggle = ctx.host.querySelector(
      'button[aria-controls]',
    ) as HTMLButtonElement;
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const menu = ctx.host.querySelector('[role="menu"]') as HTMLDivElement;
    const items = menu.querySelectorAll<HTMLAnchorElement>('a');
    const last = items[items.length - 1];
    last.focus();
    await act(async () => {
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
      );
    });
    expect(ctx.host.querySelector('[role="menu"]')).toBeNull();
    await teardown(ctx);
  });

  it('updates data-scrolled on scroll past the threshold', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingNav {...baseProps} scrollThreshold={50} />,
    );
    const nav = ctx.host.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('data-scrolled')).toBe('false');
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(nav.getAttribute('data-scrolled')).toBe('true');
    // Reset back below threshold
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(nav.getAttribute('data-scrolled')).toBe('false');
    await teardown(ctx);
  });

  it('skips the scroll listener when sticky is false', async () => {
    const ctx = createTestRoot();
    await render(ctx.root, <MarketingNav {...baseProps} sticky={false} />);
    const nav = ctx.host.querySelector('nav') as HTMLElement;
    expect(nav.className).not.toContain('sticky');
    // Scrolling should not flip the attribute.
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
      configurable: true,
    });
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(nav.getAttribute('data-scrolled')).toBe('false');
    await teardown(ctx);
  });
});
