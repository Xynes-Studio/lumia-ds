import type { SVGProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { IconCheck, IconChatBubble } from './generated';
import {
  Icon,
  IconSparkle,
  IconSprite,
  SpriteIcon,
  SPRITE_ICONS,
  clearIconRegistry,
  getIcon,
  registerIcon,
  resetIconRegistry,
  resolveSize,
  resolveColor,
  isColorPreset,
  SIZE_MAP,
  COLOR_MAP,
  type IconComponent,
  type IconId,
} from './index';

const CircleIcon: IconComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SquareIcon: IconComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <rect x="4" y="4" width="16" height="16" />
  </svg>
);

describe('registry utilities', () => {
  beforeEach(() => {
    clearIconRegistry();
  });

  afterEach(() => {
    resetIconRegistry();
  });

  it('registers an icon and retrieves it by id', () => {
    const iconId: IconId = 'circle';

    registerIcon(iconId, CircleIcon);

    expect(getIcon(iconId)).toBe(CircleIcon);
  });

  it('overwrites existing entries when registering the same id', () => {
    registerIcon('chevron', CircleIcon);
    registerIcon('chevron', SquareIcon);

    expect(getIcon('chevron')).toBe(SquareIcon);
  });

  it('returns undefined when the id is not registered', () => {
    expect(getIcon('missing-icon')).toBeUndefined();
  });
});

describe('default icon registry', () => {
  beforeEach(() => {
    resetIconRegistry();
  });

  it('seeds lucide icons under curated ids', () => {
    const baseIds: IconId[] = [
      'home',
      'user',
      'users',
      'settings',
      'reports',
      'add',
      'edit',
      'delete',
      'filter',
      'search',
      'check',
      'alert',
      'info',
    ];

    baseIds.forEach((id) => {
      expect(getIcon(id)).toBeDefined();
    });
  });
});

describe('generated icon registry', () => {
  beforeEach(() => {
    resetIconRegistry();
  });

  it('registers icons produced by the CLI generator', () => {
    expect(getIcon('chat-bubble')).toBeDefined();
    expect(getIcon('sparkle')).toBeDefined();
  });

  it('re-exports generated components for direct import', () => {
    const markup = renderToStaticMarkup(
      <IconSparkle className="text-accent" />,
    );

    expect(markup).toContain('text-accent');
    expect(markup).toContain('viewBox="0 0 24 24"');
  });
});

// ============================================
// Size Utilities Tests
// ============================================
describe('resolveSize', () => {
  it('resolves "sm" to 16', () => {
    expect(resolveSize('sm')).toBe(16);
  });

  it('resolves "md" to 24', () => {
    expect(resolveSize('md')).toBe(24);
  });

  it('resolves "lg" to 32', () => {
    expect(resolveSize('lg')).toBe(32);
  });

  it('passes through custom number size', () => {
    expect(resolveSize(48)).toBe(48);
    expect(resolveSize(20)).toBe(20);
    expect(resolveSize(100)).toBe(100);
  });
});

describe('SIZE_MAP', () => {
  it('contains expected preset values', () => {
    expect(SIZE_MAP.sm).toBe(16);
    expect(SIZE_MAP.md).toBe(24);
    expect(SIZE_MAP.lg).toBe(32);
  });
});

// ============================================
// Color Utilities Tests
// ============================================
describe('isColorPreset', () => {
  it('returns true for preset colors', () => {
    expect(isColorPreset('default')).toBe(true);
    expect(isColorPreset('muted')).toBe(true);
    expect(isColorPreset('primary')).toBe(true);
    expect(isColorPreset('danger')).toBe(true);
  });

  it('returns false for custom colors', () => {
    expect(isColorPreset('#ff0000')).toBe(false);
    expect(isColorPreset('rgb(255, 0, 0)')).toBe(false);
    expect(isColorPreset('blue')).toBe(false);
  });
});

describe('resolveColor', () => {
  it('resolves "default" to text-foreground className', () => {
    const result = resolveColor('default');
    expect(result.className).toBe('text-foreground');
    expect(result.style).toBeUndefined();
  });

  it('resolves "muted" to text-muted-foreground className', () => {
    const result = resolveColor('muted');
    expect(result.className).toBe('text-muted-foreground');
    expect(result.style).toBeUndefined();
  });

  it('resolves "primary" to text-primary className', () => {
    const result = resolveColor('primary');
    expect(result.className).toBe('text-primary');
    expect(result.style).toBeUndefined();
  });

  it('resolves "danger" to text-destructive className', () => {
    const result = resolveColor('danger');
    expect(result.className).toBe('text-destructive');
    expect(result.style).toBeUndefined();
  });

  it('resolves custom hex color to inline style', () => {
    const result = resolveColor('#ff5500');
    expect(result.className).toBeUndefined();
    expect(result.style).toEqual({ color: '#ff5500' });
  });

  it('resolves custom rgb color to inline style', () => {
    const result = resolveColor('rgb(255, 0, 0)');
    expect(result.className).toBeUndefined();
    expect(result.style).toEqual({ color: 'rgb(255, 0, 0)' });
  });

  it('resolves custom named color to inline style', () => {
    const result = resolveColor('tomato');
    expect(result.className).toBeUndefined();
    expect(result.style).toEqual({ color: 'tomato' });
  });
});

describe('COLOR_MAP', () => {
  it('contains expected preset values', () => {
    expect(COLOR_MAP.default).toBe('text-foreground');
    expect(COLOR_MAP.muted).toBe('text-muted-foreground');
    expect(COLOR_MAP.primary).toBe('text-primary');
    expect(COLOR_MAP.danger).toBe('text-destructive');
  });
});

// ============================================
// Unified <Icon /> Component Tests
// ============================================
describe('<Icon />', () => {
  beforeEach(() => {
    resetIconRegistry();
  });

  describe('size mapping', () => {
    it('renders with default "md" size (24px)', () => {
      const markup = renderToStaticMarkup(<Icon name="info" />);

      expect(markup).toContain('width="24"');
      expect(markup).toContain('height="24"');
    });

    it('renders with "sm" size (16px)', () => {
      const markup = renderToStaticMarkup(<Icon name="check" size="sm" />);

      expect(markup).toContain('width="16"');
      expect(markup).toContain('height="16"');
    });

    it('renders with "lg" size (32px)', () => {
      const markup = renderToStaticMarkup(<Icon name="alert" size="lg" />);

      expect(markup).toContain('width="32"');
      expect(markup).toContain('height="32"');
    });

    it('renders with custom number size', () => {
      const markup = renderToStaticMarkup(<Icon name="search" size={48} />);

      expect(markup).toContain('width="48"');
      expect(markup).toContain('height="48"');
    });
  });

  describe('color mapping', () => {
    it('applies default color class', () => {
      const markup = renderToStaticMarkup(<Icon name="info" />);

      expect(markup).toContain('text-foreground');
    });

    it('applies muted color class', () => {
      const markup = renderToStaticMarkup(<Icon name="info" color="muted" />);

      expect(markup).toContain('text-muted-foreground');
    });

    it('applies primary color class', () => {
      const markup = renderToStaticMarkup(
        <Icon name="check" color="primary" />,
      );

      expect(markup).toContain('text-primary');
    });

    it('applies danger color class', () => {
      const markup = renderToStaticMarkup(<Icon name="alert" color="danger" />);

      expect(markup).toContain('text-destructive');
    });

    it('applies custom color as inline style', () => {
      const markup = renderToStaticMarkup(<Icon name="info" color="#ff5500" />);

      expect(markup).toContain('color:#ff5500');
    });
  });

  describe('rendering path selection', () => {
    it('renders sprite icons via <use> element', () => {
      SPRITE_ICONS.forEach((name) => {
        const markup = renderToStaticMarkup(<Icon name={name} />);
        expect(markup).toContain(`<use href="#icon-${name}"`);
      });
    });

    it('renders registry icons as SVGR components', () => {
      const markup = renderToStaticMarkup(<Icon name="home" />);

      // SVGR components render as inline SVG, not <use>
      expect(markup).not.toContain('<use');
      expect(markup).toContain('<svg');
    });

    it('renders generated icons from registry', () => {
      const markup = renderToStaticMarkup(<Icon name="chat-bubble" />);

      expect(markup).toContain('<svg');
      expect(markup).not.toContain('<use');
    });
  });

  describe('accessibility', () => {
    it('renders with aria-hidden when no title provided', () => {
      const markup = renderToStaticMarkup(<Icon name="info" />);

      expect(markup).toContain('aria-hidden="true"');
    });

    it('renders with title and aria-labelledby when title provided', () => {
      const markup = renderToStaticMarkup(
        <Icon name="alert" title="Warning message" />,
      );

      expect(markup).toContain('<title');
      expect(markup).toContain('Warning message');
      expect(markup).toContain('aria-labelledby="icon-title-alert"');
      expect(markup).toContain('role="img"');
      expect(markup).not.toContain('aria-hidden="true"');
    });

    it('renders sprite icon with title correctly', () => {
      const markup = renderToStaticMarkup(
        <Icon name="check" title="Success" />,
      );

      expect(markup).toContain('<title id="icon-title-check">Success</title>');
      expect(markup).toContain('<use href="#icon-check"');
    });
  });

  describe('className merging', () => {
    it('merges color class with custom className', () => {
      const markup = renderToStaticMarkup(
        <Icon name="info" color="primary" className="my-custom-class" />,
      );

      expect(markup).toContain('text-primary');
      expect(markup).toContain('my-custom-class');
    });

    it('applies only custom className when custom color used', () => {
      const markup = renderToStaticMarkup(
        <Icon name="info" color="#ff0000" className="my-icon" />,
      );

      expect(markup).toContain('my-icon');
      expect(markup).toContain('color:#ff0000');
    });
  });

  describe('missing icons', () => {
    it('returns null when the name is not found', () => {
      const markup = renderToStaticMarkup(
        <Icon name="non-existent-icon-xyz" />,
      );

      expect(markup).toBe('');
    });
  });

  describe('backward compatibility', () => {
    it('renders generated IconChatBubble component directly', () => {
      const markup = renderToStaticMarkup(<IconChatBubble />);
      expect(markup).toContain('viewBox="0 0 24 24"');
    });

    it('renders generated IconCheck component directly', () => {
      const markup = renderToStaticMarkup(<IconCheck />);
      expect(markup).toContain('<svg');
      expect(markup).toContain('<path');
    });
  });
});

// ============================================
// Sprite Components Tests
// ============================================
describe('<SpriteIcon />', () => {
  it('renders <use href="#icon-chevron-down">', () => {
    const markup = renderToStaticMarkup(<SpriteIcon name="chevron-down" />);

    expect(markup).toContain('<use href="#icon-chevron-down"');
  });

  it('renders with default size of 24', () => {
    const markup = renderToStaticMarkup(<SpriteIcon name="check" />);

    expect(markup).toContain('width="24"');
    expect(markup).toContain('height="24"');
  });

  it('applies custom size', () => {
    const markup = renderToStaticMarkup(<SpriteIcon name="add" size={32} />);

    expect(markup).toContain('width="32"');
    expect(markup).toContain('height="32"');
  });

  it('applies custom className', () => {
    const markup = renderToStaticMarkup(
      <SpriteIcon name="search" className="text-primary" />,
    );

    expect(markup).toContain('text-primary');
  });

  it('includes aria-hidden for accessibility', () => {
    const markup = renderToStaticMarkup(<SpriteIcon name="info" />);

    expect(markup).toContain('aria-hidden="true"');
  });
});

describe('<IconSprite />', () => {
  it('renders hidden SVG container', () => {
    const markup = renderToStaticMarkup(<IconSprite />);

    expect(markup).toContain('display:none');
    expect(markup).toContain('aria-hidden="true"');
  });

  it('contains symbol for chevron-down', () => {
    const markup = renderToStaticMarkup(<IconSprite />);

    expect(markup).toContain('<symbol id="icon-chevron-down"');
    expect(markup).toContain('viewBox="0 0 24 24"');
  });

  it('contains all core sprite icons', () => {
    const markup = renderToStaticMarkup(<IconSprite />);

    SPRITE_ICONS.forEach((name: string) => {
      expect(markup).toContain(`id="icon-${name}"`);
    });
  });

  it('renders valid SVG paths for each symbol', () => {
    const markup = renderToStaticMarkup(<IconSprite />);

    // Check that symbols have path or circle content
    expect(markup).toContain('<path');
    expect(markup).toContain('<circle');
  });
});
