import {expect, test} from 'playwright/test';

import {LabPage} from './poms/LabPage';
import {SequencerPage} from './poms/SequencerPage';

test.describe('Bare render + console health', () => {
  test('renders with no app-level chrome', async ({page}) => {
    const seq = new SequencerPage(page);
    await seq.goto();
    await new LabPage(page).waitForTrainingScene();
    await seq.assertNoBrowserChrome();
  });

  test('no console errors on load', async ({page}) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    const seq = new SequencerPage(page);
    await seq.goto();
    await new LabPage(page).waitForTrainingScene();

    // Allow known harmless TFJS asset warnings but fail on real errors.
    const realErrors = errors.filter(
      e =>
        !e.includes('ResizeObserver loop') &&
        !e.includes('non-passive event listener'),
    );
    expect(realErrors).toEqual([]);
  });

  test('TFJS model loads (run button becomes available after training)', async ({
    page,
  }) => {
    const lab = new LabPage(page);
    const seq = new SequencerPage(page);
    await seq.goto();
    await lab.waitForTrainingScene();
    await lab.skipTraining();
    // Run button visible means model loaded and predict scene initialized.
    await expect(lab.runButton).toBeVisible({timeout: 20_000});
  });
});
