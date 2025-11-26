import type { SVGProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  Icon,
  clearIconRegistry,
  getIcon,
  registerIcon,
  resetIconRegistry,
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

describe('<Icon />', () => {
  beforeEach(() => {
    resetIconRegistry();
  });

  it('renders an icon with default size and fill-current class', () => {
    const markup = renderToStaticMarkup(<Icon id="user" />);

    expect(markup).toContain('fill-current');
    expect(markup).toContain('width="24"');
    expect(markup).toContain('height="24"');
  });

  it('applies custom className and size overrides', () => {
    const markup = renderToStaticMarkup(
      <Icon id="search" size={32} className="text-primary-500" />,
    );

    expect(markup).toContain('text-primary-500');
    expect(markup).toContain('width="32"');
    expect(markup).toContain('height="32"');
  });

  it('returns null when the id is not found', () => {
    const markup = renderToStaticMarkup(
      <Icon id={'missing-icon' as IconId} className="text-muted" />,
    );

    expect(markup).toBe('');
  });
});
