/* global __dirname */
import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * BUG-LDS-1 — Dashboard shell fixed-height sidebar + scroll containment.
 *
 * Runtime proof of the contract the jsdom unit tests in
 * `packages/layout/src/dashboard-shell/dashboard-shell.test.tsx` cannot assert:
 * the document does not scroll, the right content pane owns its own scroll, and
 * the rail's anchored switcher/profile stay pinned while the pane scrolls.
 *
 * Targets the rendered `Runtime/DashboardShell` Storybook story (Storybook
 * resolves `@lumia-ui/layout` to source, so this exercises the branch code).
 */

const STORY_URL =
  '/iframe.html?id=runtime-dashboardshell--basic-dashboard-shell&viewMode=story';

const EVIDENCE_DIR = path.resolve(
  __dirname,
  '../docs/visual-evidence/2026-Q2-bugfix-sprint/BUG-LDS-1',
);

const VIEWPORT_HEIGHTS = [720, 900, 1200];

/** Force the right pane to overflow so scroll containment is observable. */
async function injectTallContent(page: Page) {
  await page.evaluate(() => {
    const scrollFrame = document.querySelector(
      '[data-testid="dashboard-main-scroll-frame"]',
    );
    if (!scrollFrame) throw new Error('main scroll frame not found');
    const filler = document.createElement('div');
    filler.setAttribute('data-testid', 'bug-lds-1-filler');
    filler.style.height = '3000px';
    // Defeat flex-shrink so the synthetic block actually overflows the pane.
    filler.style.flexShrink = '0';
    filler.textContent = 'overflowing content';
    scrollFrame.appendChild(filler);
  });
}

test.describe('BUG-LDS-1 dashboard shell scroll containment', () => {
  for (const height of VIEWPORT_HEIGHTS) {
    test(`contract holds at 1440x${height}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height });
      await page.goto(STORY_URL);
      await page.waitForSelector('[data-testid="dashboard-root"]');
      await injectTallContent(page);

      // 1. The document itself must not scroll (AC#2).
      const docScrollable = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollHeight - el.clientHeight;
      });
      expect(docScrollable).toBeLessThanOrEqual(1);

      // 2. The right pane owns the scroll and is actually scrollable (AC#4).
      const scrollFrame = page.getByTestId('dashboard-main-scroll-frame');
      const overflow = await scrollFrame.evaluate(
        (el) => el.scrollHeight - el.clientHeight,
      );
      expect(overflow).toBeGreaterThan(100);

      // 3. The rail's bottom-anchored profile stays pinned while the right
      //    pane scrolls (AC#1: switcher/profile do not move with content).
      const profile = page.getByTestId('dashboard-profile-trigger');
      const beforeBottom = await profile.evaluate(
        (el) => el.getBoundingClientRect().bottom,
      );

      await scrollFrame.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      const scrolledTop = await scrollFrame.evaluate((el) => el.scrollTop);
      expect(scrolledTop).toBeGreaterThan(0);

      const afterBottom = await profile.evaluate(
        (el) => el.getBoundingClientRect().bottom,
      );
      expect(Math.abs(afterBottom - beforeBottom)).toBeLessThanOrEqual(1);

      // 4. Profile anchor sits within the viewport (not pushed off-screen).
      expect(afterBottom).toBeLessThanOrEqual(height + 1);

      // Reset scroll for a clean screenshot, then capture evidence.
      await scrollFrame.evaluate((el) => {
        el.scrollTop = 0;
      });
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, `dashboard-shell-${height}.png`),
      });
    });
  }
});
