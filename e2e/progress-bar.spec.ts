import {expect, test} from 'playwright/test';

/**
 * Tests the host app's progress bar — rendering, step state, and navigation.
 *
 * Step labels live in a sibling <span> outside the <button> (two-row layout).
 * The button's aria-label carries the translated label text — tests use that
 * as the authoritative assertion surface.
 */
test.describe('Progress bar — layout and navigation', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('renders 5 steps', async ({page}) => {
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).toBeVisible();
    }
  });

  test('shows correct English labels via aria-label', async ({page}) => {
    await expect(page.getByTestId('step-0')).toHaveAttribute('aria-label', 'Label Fish & Trash');
    await expect(page.getByTestId('step-1')).toHaveAttribute('aria-label', 'Bias in Action');
    await expect(page.getByTestId('step-2')).toHaveAttribute('aria-label', 'Retrain Fairly');
    await expect(page.getByTestId('step-3')).toHaveAttribute('aria-label', 'Labels Shape A.I.');
    await expect(page.getByTestId('step-4')).toHaveAttribute('aria-label', 'Teach AI a New Word');
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

  test('clicking a step makes it current and updates the lab mode', async ({page}) => {
    const cases: [number, string][] = [
      [1, 'creaturesvtrashdemo'],
      [3, 'short'],
      [0, 'fishvtrash'],
    ];
    for (const [idx, mode] of cases) {
      await page.getByTestId(`step-${idx}`).click();
      await expect(page.getByTestId(`step-${idx}`)).toHaveAttribute('data-state', 'current');
      await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', mode);
    }
  });
});

test.describe('Progress bar — onContinue integration', () => {
  test('completing a mode marks it done and advances to the next step', async ({page}) => {
    await page.goto('/');
    const continueBtn = page.getByRole('button', {name: 'Continue'}).first();
    await continueBtn.waitFor({state: 'visible'});
    await continueBtn.click();

    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'completed');
    await expect(page.getByTestId('step-1')).toHaveAttribute('data-state', 'current');
    await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', 'creaturesvtrashdemo');
  });
});
