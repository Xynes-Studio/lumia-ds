import { describe, expect, it } from 'vitest';
import { getTableActionMenuLayout } from './TableActionMenuPlugin';

describe('getTableActionMenuLayout', () => {
  it('places the menu above the table when there is enough room', () => {
    const layout = getTableActionMenuLayout(
      {
        top: 240,
        bottom: 320,
        left: 120,
      } as DOMRect,
      900,
      1440,
    );

    expect(layout.placeAbove).toBe(true);
    expect(layout.top).toBe(232);
    expect(layout.left).toBe(120);
  });

  it('places the menu below the table when the table is near the top of the viewport', () => {
    const layout = getTableActionMenuLayout(
      {
        top: 32,
        bottom: 112,
        left: 120,
      } as DOMRect,
      900,
      1440,
    );

    expect(layout.placeAbove).toBe(false);
    expect(layout.top).toBe(120);
    expect(layout.left).toBe(120);
  });

  it('clamps the menu away from the viewport edge', () => {
    const layout = getTableActionMenuLayout(
      {
        top: 32,
        bottom: 112,
        left: 2,
      } as DOMRect,
      900,
      1440,
    );

    expect(layout.left).toBe(8);
  });
});
