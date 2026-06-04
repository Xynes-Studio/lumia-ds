import { describe, expect, it } from 'vitest';

import { MarketingFigureCard } from './marketing-figure-card';
import { createTestRoot, render, teardown } from '../lib/test-utils';

describe('<MarketingFigureCard>', () => {
  it('renders a same-origin relative image with mandatory alt text', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard
        src="/diagrams/architecture.svg"
        alt="System architecture diagram"
      />,
    );
    const img = ctx.host.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('System architecture diagram');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('decoding')).toBe('async');
    await teardown(ctx);
  });

  it('renders decorative figures with role="presentation" and empty alt', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard src="/decorative.svg" alt="" decorative />,
    );
    const img = ctx.host.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
    expect(img?.getAttribute('role')).toBe('presentation');
    await teardown(ctx);
  });

  it('renders a caption when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard
        src="/diagrams/architecture.svg"
        alt="diagram"
        caption="Figure 1. Storage data path."
      />,
    );
    const caption = ctx.host.querySelector('figcaption');
    expect(caption?.textContent).toBe('Figure 1. Storage data path.');
    await teardown(ctx);
  });

  it('rejects cross-origin sources by default (renders nothing)', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard src="https://attacker.example.com/x.svg" alt="x" />,
    );
    expect(ctx.host.querySelector('figure')).toBeNull();
    expect(ctx.host.querySelector('img')).toBeNull();
    await teardown(ctx);
  });

  it('accepts cross-origin sources when explicitly allowlisted', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard
        src="https://cdn.xynes.com/diagrams/x.svg"
        allowedOrigins={['cdn.xynes.com']}
        alt="diagram"
      />,
    );
    expect(ctx.host.querySelector('img')).toBeTruthy();
    await teardown(ctx);
  });

  it('rejects unsafe javascript: hrefs even when allowlisted', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard
        src="javascript:alert(1)"
        allowedOrigins={['cdn.xynes.com']}
        alt="x"
      />,
    );
    expect(ctx.host.querySelector('figure')).toBeNull();
    await teardown(ctx);
  });

  it('preserves layout-stability hints when supplied', async () => {
    const ctx = createTestRoot();
    await render(
      ctx.root,
      <MarketingFigureCard src="/x.svg" alt="x" width={1024} height={576} />,
    );
    const img = ctx.host.querySelector('img');
    expect(img?.getAttribute('width')).toBe('1024');
    expect(img?.getAttribute('height')).toBe('576');
    await teardown(ctx);
  });
});
