import {expect, test} from 'playwright/test';

import {LabPage} from './poms/LabPage';
import {SequencerPage} from './poms/SequencerPage';

test.describe('Locale auto-detection', () => {
  test('renders in French when browser language is fr', async ({browser}) => {
    const ctx = await browser.newContext({locale: 'fr-FR'});
    const page = await ctx.newPage();
    const seq = new SequencerPage(page);
    const lab = new LabPage(page);
    await seq.goto();
    await lab.waitForTrainingScene();
    // French translation for "Continue" button should be "Continuer".
    await expect(lab.trainingContinueButton).toHaveText(/Continuer/i);
    await ctx.close();
  });

  test('falls back to English for a non-EU browser language (ja)', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({locale: 'ja-JP'});
    const page = await ctx.newPage();
    const lab = new LabPage(page);
    const seq = new SequencerPage(page);
    await seq.goto();
    await lab.waitForTrainingScene();
    // English "Continue" button present.
    await expect(lab.trainingContinueButton).toHaveText(/Continue/i);
    await ctx.close();
  });

  test('maps pt-BR to English fallback (not EU Portuguese)', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({locale: 'pt-BR'});
    const page = await ctx.newPage();
    const lab = new LabPage(page);
    const seq = new SequencerPage(page);
    await seq.goto();
    await lab.waitForTrainingScene();
    await expect(lab.trainingContinueButton).toHaveText(/Continue/i);
    await ctx.close();
  });
});
