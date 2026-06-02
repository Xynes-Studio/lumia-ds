/**
 * BUG-LDS-5 / Bug A — viewport-aware positioning for the slash menu.
 *
 * These tests pin the pure `resolveSlashMenuPlacement` helper that powers the
 * SlashMenu component. The helper is the single source of truth for whether
 * the menu opens below the caret, flips above, or caps its max-height with
 * an internal scroll.
 */
import { describe, it, expect } from 'vitest';
import { resolveSlashMenuPlacement } from '../SlashMenu';

describe('resolveSlashMenuPlacement (BUG-LDS-5 / Bug A)', () => {
  const viewport = { width: 1024, height: 800 };

  it('opens below the caret when there is enough vertical room', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 100, left: 50 },
      { width: 240, height: 300 },
      viewport,
    );
    expect(placement.top).toBe(100); // unchanged from anchor
    expect(placement.left).toBe(50);
    expect(placement.maxHeight).toBeGreaterThanOrEqual(300);
  });

  it('flips above the caret when natural-below position would overflow', () => {
    // Caret sits 80px above viewport bottom; menu wants 300px below — overflow.
    const placement = resolveSlashMenuPlacement(
      { top: 720, left: 50 },
      { width: 240, height: 300 },
      viewport,
    );
    // Caret top ≈ 720 - 20 = 700; menu's bottom anchors at 700, top = 700 - 300 = 400.
    expect(placement.top).toBeLessThan(720); // above the anchor
    expect(placement.top).toBeGreaterThanOrEqual(8); // respects viewport padding
    expect(placement.top + 300).toBeLessThanOrEqual(720); // doesn't overlap caret
  });

  it('caps max-height when even the flipped position cannot fit the full menu', () => {
    // Caret sits almost at the bottom AND only 50px above viewport top.
    // Below has ~30px, above has ~30px — menu is 300px, must cap + scroll.
    const placement = resolveSlashMenuPlacement(
      { top: 50, left: 50 },
      { width: 240, height: 300 },
      { width: 1024, height: 80 },
    );
    // Below this anchor we have 80 - 50 - 8 = 22px. Above we have 50 - 20 - 8 = 22px.
    // Whichever the resolver picks, maxHeight is bounded by the available room
    // (so the CSS overflow-y:auto on .slash-menu can take over).
    expect(placement.maxHeight).toBeLessThan(300);
    expect(placement.maxHeight).toBeGreaterThan(0);
  });

  it('clamps the menu left edge inside the viewport on the right', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 100, left: 1000 },
      { width: 240, height: 200 },
      viewport,
    );
    // viewport width 1024 - menu 240 - padding 8 = 776 maxLeft.
    expect(placement.left).toBeLessThanOrEqual(1024 - 240 - 8);
    expect(placement.left).toBeGreaterThanOrEqual(8);
  });

  it('clamps the menu left edge inside the viewport on the left', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 100, left: -50 },
      { width: 240, height: 200 },
      viewport,
    );
    expect(placement.left).toBeGreaterThanOrEqual(8);
  });

  it('returns a positive maxHeight for tiny viewports as a defensive floor', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 5, left: 5 },
      { width: 240, height: 300 },
      { width: 100, height: 30 },
    );
    expect(placement.maxHeight).toBeGreaterThanOrEqual(1);
  });

  it('sanitises NaN / Infinity inputs', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 100, left: 50 },
      { width: Number.NaN, height: Number.POSITIVE_INFINITY },
      viewport,
    );
    expect(Number.isFinite(placement.top)).toBe(true);
    expect(Number.isFinite(placement.left)).toBe(true);
    expect(Number.isFinite(placement.maxHeight)).toBe(true);
  });

  it('handles zero-size menu (initial paint before measure) without throwing', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 100, left: 50 },
      { width: 0, height: 0 },
      viewport,
    );
    expect(placement.top).toBe(100);
    expect(placement.left).toBe(50);
    expect(placement.maxHeight).toBeGreaterThan(0);
  });

  it('honours the 8px viewport padding on the top edge', () => {
    const placement = resolveSlashMenuPlacement(
      { top: 5, left: 50 },
      { width: 240, height: 200 },
      viewport,
    );
    expect(placement.top).toBeGreaterThanOrEqual(8);
  });
});
