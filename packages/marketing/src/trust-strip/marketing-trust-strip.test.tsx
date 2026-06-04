import { describe, expect, it } from 'vitest';

import { MarketingTrustStrip } from './marketing-trust-strip';
import { createTestRoot, render, teardown } from '../lib/test-utils';

describe('<MarketingTrustStrip>', () => {
  it('renders the OSS repo link when the URL is allowlisted', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip
        repoUrl="https://github.com/Xynes-Studio/lumia-ds"
        license="AGPL-3.0"
      />,
    );
    const repoLink = ctx.host.querySelector(
      'a[href="https://github.com/Xynes-Studio/lumia-ds"]',
    );
    expect(repoLink).toBeTruthy();
    expect(repoLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(repoLink?.textContent).toContain('opens in new tab');
    await teardown(ctx);
  });

  it('omits the OSS repo link for non-allowlisted hosts', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip
        repoUrl="https://attacker.com/Xynes-Studio/lumia-ds"
        license="AGPL-3.0"
      />,
    );
    expect(ctx.host.querySelector('a[href*="attacker.com"]')).toBeNull();
    await teardown(ctx);
  });

  it('renders the license inside a Lumia Badge', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip repoUrl="https://github.com/x/y" license="MIT" />,
    );
    const license = ctx.host.querySelector('[data-marketing-license]');
    expect(license?.textContent).toBe('MIT');
    await teardown(ctx);
  });

  it('renders the residency note when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip
        repoUrl="https://github.com/x/y"
        license="AGPL-3.0"
        residencyNote="Hosted in the EU."
      />,
    );
    const note = ctx.host.querySelector('[data-marketing-residency]');
    expect(note?.textContent).toBe('Hosted in the EU.');
    await teardown(ctx);
  });

  it('defaults the security URL to /SECURITY.md', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip
        repoUrl="https://github.com/x/y"
        license="AGPL-3.0"
      />,
    );
    expect(ctx.host.querySelector('a[href="/SECURITY.md"]')).toBeTruthy();
    await teardown(ctx);
  });

  it('uses <aside> with a sensible aria-label', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingTrustStrip
        repoUrl="https://github.com/x/y"
        license="AGPL-3.0"
      />,
    );
    const aside = ctx.host.querySelector('aside');
    expect(aside).toBeTruthy();
    expect(aside?.getAttribute('aria-label')).toBe('Trust and security');
    await teardown(ctx);
  });
});
