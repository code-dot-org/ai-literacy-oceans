import {expect, test} from 'playwright/test';

test.describe('Locale — host app', () => {
  test('?lang=fr shows French step labels', async ({page}) => {
    await page.goto('/?lang=fr');
    await expect(page.getByTestId('step-0')).toContainText("Entraîner l'I.A.");
    await expect(page.getByTestId('step-4')).toContainText('Apprendre un nouveau mot');
  });

  test('?lang=de shows German step labels', async ({page}) => {
    await page.goto('/?lang=de');
    await expect(page.getByTestId('step-0')).toContainText('K.I. trainieren');
  });

  test('?lang=<invalid> falls back to English', async ({page}) => {
    await page.goto('/?lang=xx');
    await expect(page.getByTestId('step-0')).toContainText('Train the A.I.');
  });

  test('language dropdown is visible and shows current locale', async ({page}) => {
    await page.goto('/?lang=es');
    const select = page.getByLabel('Language');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('es');
  });

  test('changing dropdown updates URL param', async ({page}) => {
    await page.goto('/');
    await page.getByLabel('Language').selectOption('de');
    expect(page.url()).toContain('lang=de');
  });

  test('changing dropdown updates step labels immediately', async ({page}) => {
    await page.goto('/');
    await page.getByLabel('Language').selectOption('it');
    await expect(page.getByTestId('step-0')).toContainText("Addestrare l'I.A.");
  });
});
