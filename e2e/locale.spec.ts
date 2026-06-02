import {expect, test} from 'playwright/test';

/**
 * Tests locale selection in the host app.
 *
 * Assertions use aria-label (the button's accessible name) rather than
 * toContainText — labels live in a sibling <span> outside the <button>.
 *
 * Two representative locales: fr (Western, well-known), bg (Cyrillic alphabet).
 */
const SAMPLE_LOCALES = [
  {code: 'fr', step0: 'Étiqueter poissons et déchets'},
  {code: 'bg', step0: 'Маркирай риби и боклук'},
];

for (const {code, step0} of SAMPLE_LOCALES) {
  test(`?lang=${code} — step labels load in that locale`, async ({page}) => {
    await page.goto(`/?lang=${code}`);
    await expect(page.getByTestId('step-0')).toHaveAttribute('aria-label', step0);
  });
}

test('invalid ?lang= falls back to English', async ({page}) => {
  await page.goto('/?lang=xx');
  await expect(page.getByTestId('step-0')).toHaveAttribute('aria-label', 'Label Fish & Trash');
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
  await expect(page.getByTestId('step-0')).toHaveAttribute('aria-label', 'Etichettare pesci e rifiuti');
});

test('query param takes precedence over browser locale', async ({browser}) => {
  const ctx = await browser.newContext({locale: 'de-DE'});
  const page = await ctx.newPage();
  await page.goto('/?lang=fr');
  await expect(page.getByTestId('step-0')).toHaveAttribute('aria-label', 'Étiqueter poissons et déchets');
  await ctx.close();
});
