import {expect, test} from 'playwright/test';

/**
 * Tests the play-again end state.
 *
 * Uses sessionStorage to pre-complete steps 0–3 (fast test setup, not user action),
 * then drives the real mode 4 (long) to its training Continue — the actual
 * integration point being tested. This avoids loading OceansLab 5 times.
 */
test.describe('Play again', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('oceans-completed', JSON.stringify([0, 1, 2, 3]));
      sessionStorage.setItem('oceans-mode', '4');
    });
    await page.reload();
  });

  test('completing the last mode shows the play-again screen', async ({page}) => {
    const continueBtn = page.getByRole('button', {name: 'Continue'}).first();
    await continueBtn.waitFor({state: 'visible'});
    await continueBtn.click();

    await expect(page.getByTestId('play-again-screen')).toBeVisible();
    await expect(page.getByTestId('play-again-btn')).toBeVisible();
  });

  test('play-again resets progress and returns to step 0', async ({page}) => {
    const continueBtn = page.getByRole('button', {name: 'Continue'}).first();
    await continueBtn.waitFor({state: 'visible'});
    await continueBtn.click();

    await page.getByTestId('play-again-btn').click();

    await expect(page.getByTestId('play-again-screen')).not.toBeVisible();
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'current');
    await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', 'fishvtrash');
    for (let i = 1; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).toHaveAttribute('data-state', 'upcoming');
    }
  });
});
