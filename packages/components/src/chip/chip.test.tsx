import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from './chip';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { host, root };
};

describe('Chip component', () => {
  it('renders icon by iconName', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<Chip iconName="add">Create</Chip>);
    });

    const chip = host.querySelector('[data-lumia-chip]');
    const icon = chip?.querySelector('svg');
    expect(icon).toBeTruthy();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders with label, icon, and trailing content', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Chip
          leadingIcon={<svg data-testid="icon" />}
          trailingContent={<span data-testid="count">2</span>}
        >
          Following
        </Chip>,
      );
    });

    const chip = host.querySelector('[data-lumia-chip]');
    expect(chip?.textContent).toContain('Following');
    expect(host.querySelector('[data-testid="icon"]')).toBeTruthy();
    expect(host.querySelector('[data-testid="count"]')?.textContent).toBe('2');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('sets aria-pressed only for toggle chips', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <>
          <Chip toggle active>
            Toggle On
          </Chip>
          <Chip active>Regular</Chip>
        </>,
      );
    });

    const chips = host.querySelectorAll('[data-lumia-chip]');
    expect(chips[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(chips[1]?.getAttribute('aria-pressed')).toBeNull();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies active styles and variant classes', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Chip variant="accent" active className="custom-chip">
          Favorites
        </Chip>,
      );
    });

    const chip = host.querySelector('[data-lumia-chip]');
    expect(chip?.getAttribute('data-active')).toBe('true');
    expect(chip?.className).toContain('border-primary/60');
    expect(chip?.className).toContain('custom-chip');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('honors disabled semantics and does not fire click', async () => {
    const { host, root } = createTestRoot();
    const onClick = vi.fn();

    await act(async () => {
      root.render(
        <Chip disabled onClick={onClick}>
          Disabled Chip
        </Chip>,
      );
    });

    const chip = host.querySelector(
      '[data-lumia-chip]',
    ) as HTMLButtonElement | null;
    expect(chip?.disabled).toBe(true);

    await act(async () => {
      if (chip) {
        Simulate.click(chip);
        await Promise.resolve();
      }
    });

    expect(onClick).toHaveBeenCalledTimes(0);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('prefers custom icon over iconName', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Chip iconName="add" icon={<span data-testid="custom-icon">*</span>}>
          Favorites
        </Chip>,
      );
    });

    expect(host.querySelector('[data-testid="custom-icon"]')?.textContent).toBe('*');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('normalizes custom icon size classes for sm chips', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(
        <Chip size="sm" icon={<svg data-testid="custom-svg" />}>
          Small
        </Chip>,
      );
    });

    const iconContainer = host.querySelector('[data-testid="custom-svg"]')?.parentElement;
    expect(iconContainer?.className).toContain('[&>svg]:h-4');
    expect(iconContainer?.className).toContain('[&>svg]:w-4');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies pointer cursor style', async () => {
    const { host, root } = createTestRoot();

    await act(async () => {
      root.render(<Chip>Hoverable</Chip>);
    });

    const chip = host.querySelector('[data-lumia-chip]');
    expect(chip?.className).toContain('cursor-pointer');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
