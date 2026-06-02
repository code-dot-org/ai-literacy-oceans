import {expect, test} from 'playwright/test';

/**
 * Tests the end-of-sequence play-again state.
 */
test.describe('Play again', () => {
  async function completeAllModes(page: import('playwright/test').Page) {
    await page.goto('/');
    // Fast-path: set all 5 modes complete and navigate to the done state
    // by triggering onContinue from the last mode.
    await page.evaluate(() => {
      sessionStorage.setItem('oceans-completed', JSON.stringify([0, 1, 2, 3]));
      sessionStorage.setItem('oceans-mode', '4');
    });
    await page.reload();
    // Fire onContinue from mode 4 (long) to trigger the done state.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="lab-area"]') as HTMLElement | null;
      if (!el) return;
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      if (!key) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fiber = (el as any)[key];
      while (fiber) {
        if (fiber.memoizedProps?.onContinue) {
          fiber.memoizedProps.onContinue();
          return;
        }
        fiber = fiber.child || fiber.return;
      }
    });
  }

  test('play-again screen appears after all modes complete', async ({page}) => {
    await completeAllModes(page);
    await expect(page.getByTestId('play-again-screen')).toBeVisible();
    await expect(page.getByTestId('play-again-btn')).toBeVisible();
  });

  test('play-again resets to step 0 with no completed steps', async ({page}) => {
    await completeAllModes(page);
    await page.getByTestId('play-again-btn').click();
    await expect(page.getByTestId('play-again-screen')).not.toBeVisible();
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'current');
    await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', 'fishvtrash');
    for (let i = 1; i < 5; i++) {
      await expect(page.getByTestId(`step-${i}`)).toHaveAttribute('data-state', 'upcoming');
    }
  });
});
