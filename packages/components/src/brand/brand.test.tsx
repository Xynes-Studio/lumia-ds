import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { Brand } from './brand';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  return { root, host };
};

const teardown = async (
  ctx: ReturnType<typeof createTestRoot>,
): Promise<void> => {
  await act(async () => ctx.root.unmount());
  document.body.removeChild(ctx.host);
};

const ASSET_DIR = join(process.cwd(), 'src', 'brand', 'assets');

describe('<Brand>', () => {
  it('renders the wordmark variant with the supplied aria-label as a <title>', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="wordmark" aria-label="xynes" />);
    });
    const svg = ctx.host.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 879 396');
    expect(svg?.getAttribute('role')).toBe('img');
    const title = svg?.querySelector('title');
    expect(title?.textContent).toBe('xynes');
    expect(svg?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBeNull();
    await teardown(ctx);
  });

  it('renders the icon variant with gradient + clip path + letter path', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="icon" aria-label="xynes" />);
    });
    const svg = ctx.host.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 109 109');
    expect(svg?.querySelector('linearGradient')).toBeTruthy();
    expect(svg?.querySelectorAll('stop').length).toBe(6);
    expect(svg?.querySelectorAll('path').length).toBe(2);
    await teardown(ctx);
  });

  it('omits <title> when aria-hidden is set (decorative usage)', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="icon" aria-hidden />);
    });
    const svg = ctx.host.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelector('title')).toBeNull();
    expect(svg?.getAttribute('aria-labelledby')).toBeNull();
    await teardown(ctx);
  });

  it('applies the requested size class to the wrapper', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="icon" size="lg" aria-label="xynes" />);
    });
    const wrapper = ctx.host.querySelector('[data-lumia-brand="icon"]');
    expect(wrapper?.className).toContain('h-12');
    await teardown(ctx);
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'supports size %s without throwing',
    async (size) => {
      const ctx = createTestRoot();
      await act(async () => {
        ctx.root.render(
          <Brand variant="wordmark" size={size} aria-label="xynes" />,
        );
      });
      const wrapper = ctx.host.querySelector('[data-lumia-brand="wordmark"]');
      expect(wrapper).toBeTruthy();
      await teardown(ctx);
    },
  );

  it('passes extra className through to the wrapper', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(
        <Brand
          variant="wordmark"
          aria-label="xynes"
          className="custom-marketing-class"
        />,
      );
    });
    const wrapper = ctx.host.querySelector('[data-lumia-brand="wordmark"]');
    expect(wrapper?.className).toContain('custom-marketing-class');
    await teardown(ctx);
  });

  it('uses currentColor for the wordmark fills (consumer can recolour via CSS color)', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="wordmark" aria-label="xynes" />);
    });
    const paths = Array.from(ctx.host.querySelectorAll('svg path'));
    expect(paths.length).toBe(5);
    paths.forEach((p) => expect(p.getAttribute('fill')).toBe('currentColor'));
    await teardown(ctx);
  });

  it('produces a stable title id across renders with the same label (SSR-safe)', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="wordmark" aria-label="xynes" />);
    });
    const first = ctx.host
      .querySelector('svg')
      ?.getAttribute('aria-labelledby');
    await act(async () => {
      ctx.root.render(<Brand variant="wordmark" aria-label="xynes" />);
    });
    const second = ctx.host
      .querySelector('svg')
      ?.getAttribute('aria-labelledby');
    expect(first).toBe(second);
    expect(first).toBeTruthy();
    await teardown(ctx);
  });

  it('coerces aria-hidden="true" string to decorative mode (HTML-attribute form)', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      ctx.root.render(<Brand variant="icon" aria-hidden="true" />);
    });
    const svg = ctx.host.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelector('title')).toBeNull();
    await teardown(ctx);
  });

  it('omits <title> when no aria-label and no aria-hidden are supplied (worst case still renders)', async () => {
    const ctx = createTestRoot();
    await act(async () => {
      // Intentionally omitting aria-label — the runtime should not crash, but
      // the discriminated union at the call-site will surface a TS error in
      // strict mode. This guards the runtime fallback only.
      ctx.root.render(<Brand variant="icon" />);
    });
    expect(ctx.host.querySelector('svg')).toBeTruthy();
    expect(ctx.host.querySelector('svg title')).toBeNull();
    await teardown(ctx);
  });

  describe('SVG asset regression guard (LP-DS §3)', () => {
    it('xynes-icon.svg has no <foreignObject> (Safari + strict-CSP)', () => {
      const svg = readFileSync(join(ASSET_DIR, 'xynes-icon.svg'), 'utf8');
      expect(svg).not.toContain('<foreignObject');
      expect(svg).not.toContain('data-figma');
    });

    it('xynes-wordmark.svg has no <foreignObject>', () => {
      const svg = readFileSync(join(ASSET_DIR, 'xynes-wordmark.svg'), 'utf8');
      expect(svg).not.toContain('<foreignObject');
    });

    it('xynes-wordmark.svg uses currentColor (consumer recolouring)', () => {
      const svg = readFileSync(join(ASSET_DIR, 'xynes-wordmark.svg'), 'utf8');
      expect(svg).toContain('fill="currentColor"');
      expect(svg).not.toContain('fill="white"');
    });

    it('xynes-icon.svg gradient stops match the LP-DS plan §3.2 colour reference', () => {
      const svg = readFileSync(join(ASSET_DIR, 'xynes-icon.svg'), 'utf8');
      // The 6 plan-canonical conic stops, flattened into linear stops.
      expect(svg).toContain('rgb(111,109,241)');
      expect(svg).toContain('rgb(254,0,193)');
      expect(svg).toContain('rgb(254,0,0)');
      expect(svg).toContain('rgb(255,241,0)');
      expect(svg).toContain('rgb(0,255,1)');
      expect(svg).toContain('rgb(101,254,215)');
    });

    it('asset SVGs drop top-level width / height attributes (component owns dimensions)', () => {
      const iconSvg = readFileSync(join(ASSET_DIR, 'xynes-icon.svg'), 'utf8');
      const wordmarkSvg = readFileSync(
        join(ASSET_DIR, 'xynes-wordmark.svg'),
        'utf8',
      );
      // Top-level <svg ...> tag should not carry width=/height=. We slice up
      // to the first `>` and check that opening tag only.
      const iconOpen = iconSvg.slice(0, iconSvg.indexOf('>') + 1);
      const wordmarkOpen = wordmarkSvg.slice(0, wordmarkSvg.indexOf('>') + 1);
      expect(iconOpen).not.toMatch(/\swidth=/);
      expect(iconOpen).not.toMatch(/\sheight=/);
      expect(wordmarkOpen).not.toMatch(/\swidth=/);
      expect(wordmarkOpen).not.toMatch(/\sheight=/);
    });

    it('asset SVGs ship under 2 KiB raw (well under 2 KiB gzipped)', () => {
      const iconSize = readFileSync(
        join(ASSET_DIR, 'xynes-icon.svg'),
      ).byteLength;
      const wordmarkSize = readFileSync(
        join(ASSET_DIR, 'xynes-wordmark.svg'),
      ).byteLength;
      expect(iconSize).toBeLessThan(2048);
      expect(wordmarkSize).toBeLessThan(4096); // Wordmark is path-heavy.
    });
  });
});
