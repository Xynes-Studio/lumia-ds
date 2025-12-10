import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import type { IconId } from '@lumia-ui/icons';
import { SideNavItem } from './side-nav-item';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

describe('SideNavItem', () => {
  it('renders an anchor with active styling and icon support', async () => {
    const { host, root } = createTestRoot();
    const homeIcon = 'home' as IconId;

    await act(async () => {
      root.render(
        <SideNavItem
          label="Dashboard"
          href="#dashboard"
          icon={homeIcon}
          active
        />,
      );
    });

    const link = host.querySelector('a');
    const icon = host.querySelector('svg');

    expect(link?.getAttribute('href')).toBe('#dashboard');
    expect(link?.dataset.active).toBe('true');
    expect(link?.getAttribute('aria-current')).toBe('page');
    expect(icon).not.toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('handles onClick interactions and renders badge counts', async () => {
    const { host, root } = createTestRoot();
    const onClick = vi.fn();

    await act(async () => {
      root.render(
        <SideNavItem label="Alerts" badgeCount={3} onClick={onClick} />,
      );
    });

    const button = host.querySelector('button');
    const badge = host.querySelector('[aria-label$="items"]');

    expect(button).not.toBeNull();
    expect(badge?.textContent).toBe('3');

    await act(async () => {
      (button as HTMLButtonElement).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );
    });

    expect(onClick).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('hides the badge when the count is zero or undefined', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<SideNavItem label="Inbox" badgeCount={0} href="#inbox" />);
    });

    const badge = host.querySelector('[aria-label$="items"]');
    expect(badge).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
