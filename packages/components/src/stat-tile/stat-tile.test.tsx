import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { StatTile } from './stat-tile';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('StatTile component', () => {
  it('renders label, value, and optional icon', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(<StatTile label="Active users" value="1,204" icon="users" />);
    });

    const tile = host.querySelector('[data-lumia-stat-tile]');
    expect(tile).toBeTruthy();
    expect(tile?.textContent).toContain('Active users');
    expect(tile?.textContent).toContain('1,204');

    const icon = host.querySelector('svg');
    expect(icon).toBeTruthy();

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('displays delta styling based on direction', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <StatTile
          label="Revenue"
          value="$84k"
          delta={{ value: 6.5, direction: 'up' }}
        />,
      );
    });

    const delta = host.querySelector('[data-lumia-stat-tile-delta]');
    expect(delta?.getAttribute('data-direction')).toBe('up');
    expect(delta?.textContent).toContain('+6.5');
    expect(delta?.className).toContain('bg-emerald-50');

    await act(async () => {
      root.render(
        <StatTile
          label="Revenue"
          value="$84k"
          delta={{ value: 2.3, direction: 'down' }}
        />,
      );
    });

    const updatedDelta = host.querySelector('[data-lumia-stat-tile-delta]');
    expect(updatedDelta?.getAttribute('data-direction')).toBe('down');
    expect(updatedDelta?.textContent).toContain('-2.3');
    expect(updatedDelta?.className).toContain('bg-red-50');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });
});
