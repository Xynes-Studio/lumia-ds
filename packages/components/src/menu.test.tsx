import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from './menu';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof PointerEvent === 'undefined') {
  // happy-dom does not provide PointerEvent which Radix listens for
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

const MenuFixture = ({ onSelect }: { onSelect?: () => void }) => (
  <Menu>
    <MenuTrigger asChild>
      <Button type="button">Open menu</Button>
    </MenuTrigger>
    <MenuContent>
      <MenuItem label="Profile" onSelect={onSelect} />
      <MenuSeparator />
      <MenuItem label="Sign out" />
    </MenuContent>
  </Menu>
);

describe('Menu', () => {
  it('opens and closes around selections', async () => {
    const { root, host } = createTestRoot();
    const onSelect = vi.fn();

    await act(async () => {
      root.render(<MenuFixture onSelect={onSelect} />);
    });

    const trigger = host.querySelector('button');
    expect(trigger?.textContent).toBe('Open menu');

    await act(async () => {
      trigger?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => {});

    const content = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(content).not.toBeNull();
    expect(content?.getAttribute('role')).toBe('menu');
    expect(content?.querySelectorAll('[role="separator"]').length).toBe(1);

    const firstItem = content?.querySelector('[data-lumia-menu-item]');
    expect(firstItem?.textContent).toContain('Profile');

    await act(async () => {
      firstItem?.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      firstItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {});

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[data-lumia-menu-content]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports keyboard navigation and escape close', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<MenuFixture />);
    });

    const trigger = host.querySelector('button');

    await act(async () => {
      trigger?.focus();
      trigger?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    });
    await act(async () => {});

    const content = document.body.querySelector(
      '[data-lumia-menu-content]',
    ) as HTMLElement | null;
    expect(content).toBeTruthy();

    const getHighlightedText = () =>
      content?.querySelector('[data-highlighted]')?.textContent ?? '';
    const visitedLabels: string[] = [];
    const initialLabel =
      getHighlightedText() || document.activeElement?.textContent || '';
    visitedLabels.push(initialLabel);

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    await act(async () => {});

    visitedLabels.push(
      getHighlightedText() || document.activeElement?.textContent || '',
    );

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });
    await act(async () => {});

    visitedLabels.push(
      getHighlightedText() || document.activeElement?.textContent || '',
    );

    expect(visitedLabels.some((label) => label?.includes('Profile'))).toBe(
      true,
    );
    expect(visitedLabels.some((label) => label?.includes('Sign out'))).toBe(
      true,
    );

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });
    await act(async () => {});

    expect(document.body.querySelector('[data-lumia-menu-content]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
