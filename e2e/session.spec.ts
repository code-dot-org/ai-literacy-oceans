import {expect, test} from 'playwright/test';

/**
 * Tests session-storage persistence of progress across page reloads.
 */
test.describe('Session persistence', () => {
  test('completed steps survive reload', async ({page}) => {
    await page.goto('/');

    // Mark steps 0 and 1 as completed via sessionStorage directly.
    await page.evaluate(() => {
      sessionStorage.setItem('oceans-completed', JSON.stringify([0, 1]));
      sessionStorage.setItem('oceans-mode', '2');
    });
    await page.reload();

    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'completed');
    await expect(page.getByTestId('step-1')).toHaveAttribute('data-state', 'completed');
    await expect(page.getByTestId('step-2')).toHaveAttribute('data-state', 'current');
    await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', 'creaturesvtrash');
  });

  test('fresh load has no completed steps', async ({page}) => {
    await page.goto('/');
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).not.toHaveAttribute('data-state', 'completed');
    }
  });
});
