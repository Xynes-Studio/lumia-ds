import { expect, test, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { lumiaTailwindPreset } from '@lumia-ui/theme/tailwind';
import { buttonStyles } from '../packages/components/src/button/button';

const classes = [
  buttonStyles.base,
  buttonStyles.variants.primary,
  buttonStyles.sizes.md,
].join(' ');
const actions = `<button class="${classes}">Primary action</button><a href="#" class="${classes}">Primary link</a>`;
const semanticCss = readFileSync(
  join(__dirname, '../packages/components/semantic.css'),
  'utf8',
);
let utilities: string;

test.beforeAll(async () => {
  utilities = (
    await postcss([
      tailwindcss({
        presets: [lumiaTailwindPreset],
        content: [{ raw: actions, extension: 'html' }],
      }),
    ]).process('@tailwind utilities;', { from: undefined })
  ).css;
});

async function checkActions(
  scope: Locator,
  foreground: string,
  background: string,
) {
  await expect(scope).toHaveCount(2);
  for (const action of await scope.all()) {
    await expect(action).toHaveCSS('color', foreground);
    await expect(action).toHaveCSS('background-color', background);
    const colors = await action.evaluate((el) => {
      const css = getComputedStyle(el);
      const luminance = (color: string) => {
        const rgb = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
        return rgb
          .map((v) => v / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      };
      const fg = luminance(css.color),
        bg = luminance(css.backgroundColor);
      return {
        foreground: css.color,
        background: css.backgroundColor,
        contrast: (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05),
      };
    });
    expect(colors.foreground).toBe(foreground);
    expect(colors.background).toBe(background);
    expect(colors.contrast).toBeGreaterThanOrEqual(4.5);
  }
}

for (const scheme of ['light', 'dark'] as const) {
  test(`Tailwind preset primary actions follow system ${scheme} without consumer aliases`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.setContent(
      `<style>${utilities}\n${semanticCss}</style><main>${actions}</main>`,
    );
    await checkActions(
      page.locator('main > button, main > a'),
      scheme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
      scheme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(15, 23, 42)',
    );
  });
}

test('explicit and nested themes update primary foreground with their own surface', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setContent(
    `<style>${utilities}\n${semanticCss}</style><main data-theme="light">${actions}<section data-theme="dark">${actions}</section></main>`,
  );
  await checkActions(
    page.locator('main > button, main > a'),
    'rgb(255, 255, 255)',
    'rgb(15, 23, 42)',
  );
  await checkActions(
    page.locator('section > button, section > a'),
    'rgb(15, 23, 42)',
    'rgb(226, 232, 240)',
  );
  await page
    .locator('section')
    .evaluate((el) => el.setAttribute('data-theme', 'light'));
  await checkActions(
    page.locator('section > button, section > a'),
    'rgb(255, 255, 255)',
    'rgb(15, 23, 42)',
  );
});

test('standalone fallback and explicit consumer foreground remain supported', async ({
  page,
}) => {
  await page.setContent(`<style>${utilities}</style><main>${actions}</main>`);
  await checkActions(
    page.locator('main > button, main > a'),
    'rgb(255, 255, 255)',
    'rgb(15, 23, 42)',
  );
  await page.addStyleTag({ content: semanticCss });
  await page
    .locator('main')
    .evaluate((el) => el.style.setProperty('--color-on-primary', '#171717'));
  await page
    .locator('main')
    .evaluate((el) => el.setAttribute('data-theme', 'dark'));
  await checkActions(
    page.locator('main > button, main > a'),
    'rgb(23, 23, 23)',
    'rgb(226, 232, 240)',
  );
});
