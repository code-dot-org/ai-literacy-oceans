import {expect, test} from 'playwright/test';

/**
 * Tests the host app's progress bar — rendering, step state, navigation, and the
 * onContinue integration point with OceansLab.
 *
 * Integration strategy: we drive OceansLab only to the point where the user can
 * click "Continue" (the training scene), then assert on the HOST APP's response
 * (progress bar state, data-mode). OceansLab internals (training, predicting, pond)
 * are covered by the monorepo e2e suite.
 */
test.describe('Progress bar — layout and navigation', () => {
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
    // Wait for OceansLab to reach the training scene — Continue becomes visible.
    const continueBtn = page.getByRole('button', {name: 'Continue'}).first();
    await continueBtn.waitFor({state: 'visible'});
    await continueBtn.click();

    // Host app response: step 0 → completed, step 1 → current, mode advances.
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'completed');
    await expect(page.getByTestId('step-1')).toHaveAttribute('data-state', 'current');
    await expect(page.getByTestId('lab-area')).toHaveAttribute(
      'data-mode',
      'creaturesvtrashdemo',
    );
  });
});
