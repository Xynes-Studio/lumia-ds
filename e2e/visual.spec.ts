import { test, expect } from '@playwright/test';

test('Button Variants Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=components-button--variants&viewMode=story');
    await page.waitForSelector('button');
    await expect(page).toHaveScreenshot('button-variants.png');
});

test('Table Playground Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=components-table--playground&viewMode=story');
    // Ideally waiting for a specific part of table if 'table' tag is present
    await page.waitForSelector('table');
    await expect(page).toHaveScreenshot('table-playground.png');
});

test('Editor Default Visual Test', async ({ page }) => {
    await page.goto('/iframe.html?id=editor-lumiaeditor--default&viewMode=story');
    await page.waitForSelector('[contenteditable="true"]');
    await expect(page).toHaveScreenshot('editor-default.png');
});
