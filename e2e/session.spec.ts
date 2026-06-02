import {expect, test} from 'playwright/test';

/**
 * Tests session-storage persistence. Uses sessionStorage as a state setup
 * mechanism — Playwright's endorsed pattern for seeding client-side state
 * before navigation, equivalent to setting cookies in server-side apps.
 */
test.describe('Session persistence', () => {
  test('fresh load has no completed steps', async ({page}) => {
    await page.goto('/');
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).not.toHaveAttribute(
        'data-state',
        'completed',
      );
    }
  });

  test('completed steps and active mode are restored after reload', async ({
    page,
  }) => {
    await page.goto('/');
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

  test('navigation after restore keeps prior completed steps', async ({page}) => {
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('oceans-completed', JSON.stringify([0]));
      sessionStorage.setItem('oceans-mode', '1');
    });
    await page.reload();

    // Navigate away and back — step 0 should still be completed.
    await page.getByTestId('step-3').click();
    await page.getByTestId('step-1').click();
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'completed');
  });
});
