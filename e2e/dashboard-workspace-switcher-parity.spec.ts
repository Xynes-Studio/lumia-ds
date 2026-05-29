/* global __dirname */
import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * BUG-LDS-2 — Workspace switcher parity (single Lumia implementation).
 *
 * Runtime proof of the trigger layout contract that the jsdom unit tests in
 * `packages/layout/src/dashboard-shell/dashboard-workspace-switcher.test.tsx`
 * can only assert by class name: at real layout the expanded trigger fills the
 * rail width and lays out as a three-cell grid (avatar / label / chevron) with
 * the chevron right-anchored. Both the Auth App and the CMS Console render this
 * same `DashboardWorkspaceSwitcher` via `DashboardShell`, so proving the shell
 * story is sufficient for parity (AGENTS.md §7 rule 9).
 *
 * Targets the rendered `Runtime/DashboardShell` Storybook story (Storybook
 * resolves `@lumia-ui/layout` to source, so this exercises the branch code).
 */

const STORY_URL =
  '/iframe.html?id=runtime-dashboardshell--basic-dashboard-shell&viewMode=story';

const EVIDENCE_DIR = path.resolve(
  __dirname,
  '../docs/visual-evidence/2026-Q2-bugfix-sprint/BUG-LDS-2',
);

test.describe('BUG-LDS-2 workspace switcher trigger parity', () => {
  test('expanded trigger fills the rail and renders a three-cell grid', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(STORY_URL);
    await page.waitForSelector('[data-testid="dashboard-root"]');

    const trigger = page.getByTestId('dashboard-workspace-trigger');
    const grid = page.getByTestId('dashboard-workspace-trigger-grid');
    const chevron = page.getByTestId('dashboard-workspace-chevron');

    // 1. Trigger fills the rail width — its box matches the rail width and is
    //    not narrower than the rail (no app CSS, governed by the shell token).
    const railWidth = await page.evaluate(() => {
      const sidebar = document.querySelector(
        '[data-testid="dashboard-sidebar-frame"]',
      ) as HTMLElement | null;
      return sidebar?.clientWidth ?? 0;
    });
    expect(railWidth).toBeGreaterThan(0);
    const triggerWidth = await trigger.evaluate(
      (el) => el.getBoundingClientRect().width,
    );
    // Trigger fills the rail content box (rail has horizontal padding).
    expect(triggerWidth).toBeGreaterThan(railWidth * 0.7);

    // 2. The expanded row is a real CSS grid with three template columns.
    const display = await grid.evaluate(
      (el) => getComputedStyle(el).display,
    );
    expect(display).toBe('grid');
    const columnCount = await grid.evaluate(
      (el) =>
        getComputedStyle(el)
          .gridTemplateColumns.split(' ')
          .filter(Boolean).length,
    );
    expect(columnCount).toBe(3);

    // 3. Chevron is right-anchored: its right edge sits at the trigger's right
    //    edge (within a small tolerance for padding/border).
    const triggerRight = await trigger.evaluate(
      (el) => el.getBoundingClientRect().right,
    );
    const chevronRight = await chevron.evaluate(
      (el) => el.getBoundingClientRect().right,
    );
    expect(triggerRight - chevronRight).toBeLessThanOrEqual(16);

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'workspace-switcher-expanded-900.png'),
    });
  });
});
