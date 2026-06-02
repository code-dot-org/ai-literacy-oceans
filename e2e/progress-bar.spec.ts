import {expect, test} from 'playwright/test';

/**
 * Tests the host app's progress bar — rendering, step state, and navigation.
 * Does not interact with OceansLab internals; that suite lives in the monorepo.
 * The onContinue → progress advance path requires OceansLab and is out of scope here.
 */
test.describe('Progress bar', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('renders 5 labelled steps', async ({page}) => {
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).toBeVisible();
    }
  });

  test('shows correct English labels', async ({page}) => {
    await expect(page.getByTestId('step-0')).toContainText('Label Fish & Trash');
    await expect(page.getByTestId('step-1')).toContainText('Bias in Action');
    await expect(page.getByTestId('step-2')).toContainText('Retrain Fairly');
    await expect(page.getByTestId('step-3')).toContainText('Pick a Simple Word');
    await expect(page.getByTestId('step-4')).toContainText('Teach AI a New Word');
  });

  test('step 0 is current and rest are upcoming on fresh load', async ({page}) => {
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'current');
    for (let i = 1; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).toHaveAttribute('data-state', 'upcoming');
    }
  });

  test('progress bar sits above the lab canvas', async ({page}) => {
    const barBox = await page.getByTestId('step-0').boundingBox();
    const labBox = await page.getByTestId('lab-area').boundingBox();
    expect(barBox!.y).toBeLessThan(labBox!.y);
  });

  test('clicking a step makes it current', async ({page}) => {
    await page.getByTestId('step-3').click();
    await expect(page.getByTestId('step-3')).toHaveAttribute('data-state', 'current');
  });

  test('clicking a step updates the active lab mode', async ({page}) => {
    const cases: [number, string][] = [
      [1, 'creaturesvtrashdemo'],
      [2, 'creaturesvtrash'],
      [3, 'short'],
      [4, 'long'],
      [0, 'fishvtrash'],
    ];
    for (const [idx, mode] of cases) {
      await page.getByTestId(`step-${idx}`).click();
      await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', mode);
    }
  });
});
