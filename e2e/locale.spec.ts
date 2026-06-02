import {expect, test} from 'playwright/test';

/**
 * Tests locale selection in the host app.
 *
 * Strategy: verify the mechanism with a representative sample — not every language.
 * Translation correctness is covered by the JSON files (validated on build) and the
 * unit tests in the monorepo. Here we test the wiring: ?lang= param, dropdown sync,
 * and fallback logic.
 */

// Two structurally different locales: one with standard plurals (fr) and one with
// a Cyrillic alphabet (bg) to catch encoding issues. English is tested implicitly
// throughout the suite as the default.
const SAMPLE_LOCALES = [
  {code: 'fr', step0: "Entraîner l'I.A."},
  {code: 'bg', step0: 'Маркирай риби и боклук'},
];

for (const {code, step0} of SAMPLE_LOCALES) {
  test(`?lang=${code} — step labels load in that locale`, async ({page}) => {
    await page.goto(`/?lang=${code}`);
    await expect(page.getByTestId('step-0')).toContainText(step0);
  });
}

test('invalid ?lang= falls back to English', async ({page}) => {
  await page.goto('/?lang=xx');
  await expect(page.getByTestId('step-0')).toContainText('Label Fish & Trash');
});

test('language dropdown shows current locale', async ({page}) => {
  await page.goto('/?lang=fr');
  await expect(page.getByLabel('Language')).toHaveValue('fr');
});

test('changing dropdown updates URL param', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Language').selectOption('de');
  expect(page.url()).toContain('lang=de');
});

test('changing dropdown updates step labels immediately', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Language').selectOption('it');
  await expect(page.getByTestId('step-0')).toContainText("Etichettare pesci e rifiuti");
});

test('query param takes precedence over browser locale', async ({browser}) => {
  // Browser locale is de, but ?lang=fr should win.
  const ctx = await browser.newContext({locale: 'de-DE'});
  const page = await ctx.newPage();
  await page.goto('/?lang=fr');
  await expect(page.getByTestId('step-0')).toContainText("Entraîner l'I.A.");
  await ctx.close();
});
