import {expect, test} from 'playwright/test';

/**
 * Tests the host app's progress bar — state, labels, navigation.
 * Does NOT interact with OceansLab internals; that suite lives in the monorepo.
 */
test.describe('Progress bar', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('renders 5 steps', async ({page}) => {
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

  test('step 0 is current, rest are upcoming on fresh load', async ({page}) => {
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

  test('clicking any step makes it current and updates data-mode', async ({page}) => {
    const modeMap: [number, string][] = [
      [1, 'creaturesvtrashdemo'],
      [2, 'creaturesvtrash'],
      [3, 'short'],
      [4, 'long'],
      [0, 'fishvtrash'],
    ];
    for (const [idx, mode] of modeMap) {
      await page.getByTestId(`step-${idx}`).click();
      await expect(page.getByTestId(`step-${idx}`)).toHaveAttribute('data-state', 'current');
      await expect(page.getByTestId('lab-area')).toHaveAttribute('data-mode', mode);
    }
  });

  test('completed steps persist after completing via onContinue integration', async ({page}) => {
    // Simulate onContinue firing from the lab by directly calling it via React fiber.
    // This tests the host app's response without driving OceansLab UI.
    await page.evaluate(() => {
      // Find the lab-area container and walk React fiber to call onContinue.
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
    // After one onContinue: step 0 should be completed, step 1 current.
    await expect(page.getByTestId('step-0')).toHaveAttribute('data-state', 'completed');
    await expect(page.getByTestId('step-1')).toHaveAttribute('data-state', 'current');
  });
});
