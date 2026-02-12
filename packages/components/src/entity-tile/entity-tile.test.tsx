import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { EntityTile } from './entity-tile';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('EntityTile component', () => {
  it('renders grid with hidden action rail by default and list with always visible actions', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <>
          <EntityTile
            tileId="app-1"
            view="grid"
            title="Xynes-CMS"
            actions={[
              { id: 'pin', label: 'Pin', icon: 'check', onSelect: vi.fn() },
            ]}
          />
          <EntityTile
            tileId="app-2"
            view="list"
            title="Xynes-CMS"
            actions={[
              { id: 'pin', label: 'Pin', icon: 'check', onSelect: vi.fn() },
            ]}
          />
        </>,
      );
    });

    const tiles = host.querySelectorAll('[data-lumia-entity-tile]');
    expect(tiles).toHaveLength(2);

    const gridRail = host.querySelector(
      '[data-lumia-entity-tile][data-view="grid"] [data-lumia-entity-tile-actions]',
    ) as HTMLElement | null;
    const listRail = host.querySelector(
      '[data-lumia-entity-tile][data-view="list"] [data-lumia-entity-tile-actions]',
    ) as HTMLElement | null;

    expect(gridRail).toBeTruthy();
    expect(gridRail?.getAttribute('data-visible')).toBe('false');
    expect(listRail).toBeTruthy();
    expect(listRail?.getAttribute('data-visible')).toBe('true');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('calls action callback with rich context', async () => {
    const { root, host } = createTestRoot();
    const onSelect = vi.fn();
    const item = { id: 'app-1', name: 'Xynes-CMS' };

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-1"
          item={item}
          view="list"
          title="Xynes-CMS"
          selected
          actions={[{ id: 'pin', label: 'Pin', icon: 'check', onSelect }]}
        />,
      );
    });

    const action = host.querySelector(
      '[data-lumia-tile-action-id="pin"]',
    ) as HTMLButtonElement | null;

    await act(async () => {
      action?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({
      actionId: 'pin',
      item,
      tileId: 'app-1',
      view: 'list',
      selected: true,
    });

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('isolates checkbox and action clicks from tile activation', async () => {
    const { root, host } = createTestRoot();
    const onActivate = vi.fn();
    const onSelectedChange = vi.fn();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-1"
          view="list"
          title="Xynes-CMS"
          selectable
          selected={false}
          onSelectedChange={onSelectedChange}
          onActivate={onActivate}
          actions={[
            { id: 'pin', label: 'Pin', icon: 'check', onSelect: vi.fn() },
          ]}
        />,
      );
    });

    const checkbox = host.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    const action = host.querySelector(
      '[data-lumia-tile-action-id="pin"]',
    ) as HTMLButtonElement | null;

    await act(async () => {
      checkbox?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      checkbox?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(0);

    await act(async () => {
      action?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onActivate).toHaveBeenCalledTimes(0);

    await act(async () => {
      const tile = host.querySelector(
        '[data-lumia-entity-tile]',
      ) as HTMLDivElement | null;
      tile?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onActivate).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('supports keyboard activation and enforces quick action max of 3', async () => {
    const { root, host } = createTestRoot();
    const onActivate = vi.fn();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-1"
          view="list"
          title="Xynes-CMS"
          onActivate={onActivate}
          actions={[
            { id: 'a1', label: 'A1', icon: 'check', onSelect: vi.fn() },
            { id: 'a2', label: 'A2', icon: 'check', onSelect: vi.fn() },
            { id: 'a3', label: 'A3', icon: 'check', onSelect: vi.fn() },
            { id: 'a4', label: 'A4', icon: 'check', onSelect: vi.fn() },
          ]}
        />,
      );
    });

    const tile = host.querySelector(
      '[data-lumia-entity-tile]',
    ) as HTMLDivElement | null;

    await act(async () => {
      tile?.focus();
      tile?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      tile?.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
    });

    expect(onActivate).toHaveBeenCalledTimes(2);

    const actions = host.querySelectorAll('[data-lumia-tile-action-id]');
    expect(actions).toHaveLength(3);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('applies hover accent token and keeps list row layout stable', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-3"
          view="list"
          title="Xynes-CMS"
          hoverAccentColor="rgb(10 20 30 / 0.5)"
          selectable
          actions={[
            { id: 'pin', label: 'Pin', icon: 'check', onSelect: vi.fn() },
          ]}
        />,
      );
    });

    const tile = host.querySelector(
      '[data-lumia-entity-tile]',
    ) as HTMLElement | null;
    expect(tile).toBeTruthy();
    expect(tile?.className).toContain('flex');
    expect(tile?.className).toContain('items-center');
    expect(tile?.style.getPropertyValue('--entity-tile-accent')).toBe(
      'rgb(10 20 30 / 0.5)',
    );

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders initials fallback when avatarSrc is missing', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-4"
          view="grid"
          title="Xynes CMS"
          avatarFallbackInitials="XC"
        />,
      );
    });

    const image = host.querySelector('img');
    expect(image).toBeNull();
    expect(host.textContent).toContain('XC');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders a default action glyph when icon is not provided', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-5"
          view="list"
          title="Xynes-CMS"
          actions={[{ id: 'more', label: 'More', onSelect: vi.fn() }]}
        />,
      );
    });

    const action = host.querySelector(
      '[data-lumia-tile-action-id="more"]',
    ) as HTMLButtonElement | null;
    expect(action).toBeTruthy();
    expect(action?.querySelector('svg')).toBeTruthy();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('renders a native anchor when href is provided', async () => {
    const { root, host } = createTestRoot();
    const onActivate = vi.fn();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-6"
          view="list"
          title="Xynes-CMS"
          href="/apps/xynes-cms"
          onActivate={onActivate}
        />,
      );
    });

    const tile = host.querySelector(
      '[data-lumia-entity-tile]',
    ) as HTMLAnchorElement | null;
    expect(tile).toBeTruthy();
    expect(tile?.tagName).toBe('A');
    expect(tile?.getAttribute('href')).toBe('/apps/xynes-cms');

    await act(async () => {
      tile?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onActivate).toHaveBeenCalledTimes(1);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('does not prevent Enter on anchor tiles and still forwards onKeyDown', async () => {
    const { root, host } = createTestRoot();
    const onKeyDown = vi.fn();

    await act(async () => {
      root.render(
        <EntityTile
          tileId="app-7"
          view="list"
          title="Xynes-CMS"
          href="/apps/xynes-cms"
          onKeyDown={onKeyDown}
        />,
      );
    });

    const tile = host.querySelector(
      '[data-lumia-entity-tile]',
    ) as HTMLAnchorElement | null;
    expect(tile?.tagName).toBe('A');

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    await act(async () => {
      tile?.dispatchEvent(event);
    });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
