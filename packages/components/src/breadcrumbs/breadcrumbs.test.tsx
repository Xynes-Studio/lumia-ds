import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import type { IconId } from '@lumia-ui/icons';
import { Breadcrumbs } from './breadcrumbs';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('Breadcrumbs', () => {
  it('renders a navigable list and marks the current page', async () => {
    const { host, root } = createTestRoot();
    const onTeamClick = vi.fn();

    await act(async () => {
      root.render(
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#home' },
            { label: 'Teams', onClick: onTeamClick },
            { label: 'Design System' },
          ]}
        />,
      );
    });

    const nav = host.querySelector('nav[aria-label="Breadcrumb"]');
    const listItems = host.querySelectorAll('ol li');
    const current = host.querySelector('[aria-current="page"]');
    const buttons = host.querySelectorAll('button');

    expect(nav).not.toBeNull();
    expect(listItems).toHaveLength(3);
    expect(current?.textContent).toContain('Design System');

    await act(async () => {
      (buttons[0] as HTMLButtonElement)?.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });
    expect(onTeamClick).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('collapses middle items when maxItems is provided', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#home' },
            { label: 'Platform' },
            { label: 'Teams' },
            { label: 'Design' },
            { label: 'Components' },
          ]}
          maxItems={3}
        />,
      );
    });

    const ellipsis = host.querySelector('[data-breadcrumb-ellipsis]');
    const textContent = host.textContent ?? '';

    expect(ellipsis?.textContent).toBe('...');
    expect(textContent).toContain('Home');
    expect(textContent).toContain('Components');
    expect(textContent).not.toContain('Platform');
    expect(textContent).not.toContain('Teams');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('shows an icon when provided on an item', async () => {
    const { host, root } = createTestRoot();
    const homeIcon = 'home' as IconId;

    await act(async () => {
      root.render(
        <Breadcrumbs
          items={[
            { label: 'Home', href: '#home', icon: homeIcon },
            { label: 'Library' },
          ]}
        />,
      );
    });

    const icon = host.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('width')).toBe('16');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
