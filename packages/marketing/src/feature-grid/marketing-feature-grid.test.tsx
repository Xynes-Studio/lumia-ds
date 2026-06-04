import { describe, expect, it } from 'vitest';

import {
  MarketingFeatureGrid,
  MarketingFeatureCard,
} from './marketing-feature-grid';
import { createTestRoot, render, teardown } from '../lib/test-utils';

describe('<MarketingFeatureGrid>', () => {
  it('renders heading + description + cards', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid heading="Why xynes" description="Lower latency.">
        <MarketingFeatureCard headline="One">Body one.</MarketingFeatureCard>
        <MarketingFeatureCard headline="Two">Body two.</MarketingFeatureCard>
        <MarketingFeatureCard headline="Three">
          Body three.
        </MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    expect(ctx.host.querySelector('h2')?.textContent).toBe('Why xynes');
    expect(ctx.host.querySelectorAll('h3').length).toBe(3);
    await teardown(ctx);
  });

  it('renders feature cards as <li> inside a <ul>', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid>
        <MarketingFeatureCard headline="One">Body one.</MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    const ul = ctx.host.querySelector('ul');
    const li = ctx.host.querySelector('li');
    expect(ul).toBeTruthy();
    expect(li).toBeTruthy();
    expect(li?.parentElement).toBe(ul);
    await teardown(ctx);
  });

  it.each([1, 2, 3, 4] as const)('supports columns=%i', async (columns) => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid columns={columns}>
        <MarketingFeatureCard headline="One">Body.</MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    const ul = ctx.host.querySelector('ul');
    expect(ul?.className).toMatch(/grid-cols-1/);
    await teardown(ctx);
  });

  it('uses h3 for feature cards (section owns h2)', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid heading="Why">
        <MarketingFeatureCard headline="Headline">Body.</MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    expect(ctx.host.querySelector('h2')?.textContent).toBe('Why');
    expect(ctx.host.querySelector('h3')?.textContent).toBe('Headline');
    expect(ctx.host.querySelectorAll('h1').length).toBe(0);
    await teardown(ctx);
  });

  it('renders the optional icon slot above the headline (aria-hidden)', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid>
        <MarketingFeatureCard
          icon={<svg data-testid="icon" />}
          headline="Headline"
        >
          Body.
        </MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    const iconWrapper = ctx.host.querySelector('[data-marketing-feature-icon]');
    expect(iconWrapper?.getAttribute('aria-hidden')).toBe('true');
    expect(iconWrapper?.querySelector('[data-testid="icon"]')).toBeTruthy();
    await teardown(ctx);
  });

  it('falls back to a custom aria-label when heading is omitted', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFeatureGrid aria-label="Capabilities">
        <MarketingFeatureCard headline="Headline">Body.</MarketingFeatureCard>
      </MarketingFeatureGrid>,
    );
    const section = ctx.host.querySelector('section');
    expect(section?.getAttribute('aria-label')).toBe('Capabilities');
    expect(section?.getAttribute('aria-labelledby')).toBeNull();
    await teardown(ctx);
  });
});
