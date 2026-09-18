import { test, expect } from '@playwright/test';

test('Button Variants Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=components-button--variants&viewMode=story');
    await expect(
        page.locator('#storybook-root').getByRole('button', { name: 'Primary', exact: true }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot('button-variants.png');
});

test('Table Playground Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=components-table--playground&viewMode=story');
    await expect(page.locator('#storybook-root').getByRole('table')).toBeVisible();
    await expect(page).toHaveScreenshot('table-playground.png');
});

test('Editor Default Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=editor-lumiaeditor--default&viewMode=story');
    await expect(
        page.locator('#storybook-root [contenteditable="true"]'),
    ).toBeVisible();
    await expect(page).toHaveScreenshot('editor-default.png');
});
