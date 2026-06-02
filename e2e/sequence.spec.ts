import {expect, test} from 'playwright/test';

import {LabPage} from './poms/LabPage';
import {SequencerPage} from './poms/SequencerPage';

test.describe('Full mode sequence → play-again', () => {
  test('advances through all five modes and reaches play-again', async ({
    page,
  }) => {
    const seq = new SequencerPage(page);
    const lab = new LabPage(page);
    await seq.goto();

    // Mode 1: fishvtrash
    await lab.completeTrashMode();

    // Mode 2: creaturesvtrashdemo (predict-only, no training)
    await lab.waitForPredictScene();
    await lab.runPrediction();
    await lab.predictContinueButton.click();

    // Mode 3: creaturesvtrash
    await lab.completeTrashMode();

    // Mode 4: fishshort (words mode)
    await lab.completeWordsMode();

    // Mode 5: fishlong (words mode)
    await lab.completeWordsMode();

    // After the last mode, play-again screen appears.
    await expect(seq.playAgainScreen).toBeVisible({timeout: 10_000});
  });

  test('play-again button restarts from fishvtrash', async ({page}) => {
    const seq = new SequencerPage(page);
    const lab = new LabPage(page);
    await seq.goto();

    // Fast-forward to play-again by completing all modes.
    await lab.completeTrashMode();
    await lab.waitForPredictScene();
    await lab.runPrediction();
    await lab.predictContinueButton.click();
    await lab.completeTrashMode();
    await lab.completeWordsMode();
    await lab.completeWordsMode();

    await seq.playAgainButton.click();

    // Should be back at fishvtrash training scene.
    await lab.waitForTrainingScene();
    await expect(lab.eraseButton).toBeVisible();
  });
});
