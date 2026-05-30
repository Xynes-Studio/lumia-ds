/* global __dirname */
import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * BUG-LDS-3 — Editor focus-ring polish + dropdown migration.
 *
 * Runtime proof of the two contracts the jsdom unit tests can only assert by
 * class name / role:
 *  1. The toolbar block-type control is the Lumia DS Popover-based `Dropdown`
 *     (`role="combobox"` + `data-lumia-component="dropdown"`), not a native
 *     `<select>`. There must be zero native `<select>` elements in the editor.
 *  2. Focusing the content-editable does NOT paint the old blue active-state
 *     ring on the editor wrapper (the ring is reserved for inputs / dropdowns /
 *     buttons, which keep their own focus-visible styles).
 *
 * Targets the rendered `Editor/LumiaEditor` Storybook story (Storybook resolves
 * `@lumia-ui/editor` to source, so this exercises the branch code).
 */

const STORY_URL =
  '/iframe.html?id=editor-lumiaeditor--default&viewMode=story';

const EVIDENCE_DIR = path.resolve(
  __dirname,
  '../docs/visual-evidence/2026-Q2-bugfix-sprint/BUG-LDS-3',
);

test.describe('BUG-LDS-3 editor dropdown + focus ring', () => {
  test('block type is a Lumia dropdown and the focused editor has no blue ring', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 720 });
    await page.goto(STORY_URL);

    const editor = page.getByRole('textbox', { name: /Rich Text Editor/i });
    await editor.waitFor();

    // 1. No native <select> anywhere in the editor.
    expect(await page.locator('select').count()).toBe(0);

    // 2. Block-type control is the Lumia Dropdown combobox.
    const blockType = page.getByRole('combobox', { name: 'Block Type' });
    await expect(blockType).toHaveAttribute('data-lumia-component', 'dropdown');
    await expect(blockType).toHaveAttribute('aria-haspopup', 'listbox');

    // 3. Open the dropdown and confirm a real listbox of options renders.
    await blockType.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(page.getByRole('option', { name: 'Heading 1' })).toBeVisible();
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'block-type-dropdown-open.png'),
    });

    // Close the dropdown before focusing the editor.
    await page.keyboard.press('Escape');

    // 4. Focus + type, then assert the wrapper carries the focused class but no
    //    blue box-shadow ring.
    await editor.click();
    await editor.pressSequentially('Typing in the editor');

    const wrapper = page.locator('.editor-input-wrapper');
    await expect(wrapper).toHaveClass(/editor-input-wrapper--focused/);

    const boxShadow = await wrapper.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    // No ring at all (or at least no blue ring).
    expect(boxShadow === 'none' || !boxShadow.includes('37, 99, 235')).toBe(
      true,
    );

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'editor-focused-no-ring.png'),
    });
  });
});
