import {type Locator, type Page} from 'playwright/test';

/**
 * Interactions with the embedded OceansLab component.
 *
 * Mirrors the POM structure from frontend/packages/labs/oceans/e2e/poms/.
 */
export class LabPage {
  constructor(readonly page: Page) {}

  get eraseButton(): Locator {
    return this.page.getByRole('button', {name: 'Erase'});
  }

  get trainingContinueButton(): Locator {
    return this.page.getByRole('button', {name: 'Continue'}).first();
  }

  get runButton(): Locator {
    return this.page.locator('#uitest-run-btn');
  }

  get predictContinueButton(): Locator {
    return this.page.locator('#uitest-continue-btn');
  }

  get pondSurface(): Locator {
    return this.page.getByRole('button', {name: 'Fish pond'});
  }

  get pondContinueButton(): Locator {
    return this.page
      .locator('#uitest-nav-btns')
      .getByRole('button', {name: 'Continue'});
  }

  get wordButtons(): Locator {
    return this.page.locator('.words-button');
  }

  async waitForTrainingScene(timeout = 20_000) {
    await this.eraseButton.waitFor({state: 'visible', timeout});
  }

  async waitForPredictScene(timeout = 20_000) {
    await this.runButton.waitFor({state: 'visible', timeout});
  }

  async waitForPondScene(timeout = 15_000) {
    await this.pondSurface.waitFor({state: 'visible', timeout});
  }

  async waitForWordsScene(timeout = 15_000) {
    await this.wordButtons.first().waitFor({state: 'visible', timeout});
  }

  /** Train minimally (click continue from training scene) and advance to predict. */
  async skipTraining() {
    await this.trainingContinueButton.click();
  }

  /** Run prediction and wait for continue button. */
  async runPrediction(timeout = 20_000) {
    await this.runButton.click();
    await this.predictContinueButton.waitFor({state: 'visible', timeout});
  }

  /** Advance through a full fish-vs-trash or creatures mode. */
  async completeTrashMode() {
    await this.waitForTrainingScene();
    await this.skipTraining();
    await this.waitForPredictScene();
    await this.runPrediction();
    await this.predictContinueButton.click();
    await this.waitForPondScene();
    await this.pondContinueButton.click();
  }

  /** Advance through a words mode (fishshort / fishlong). */
  async completeWordsMode() {
    await this.waitForWordsScene();
    // Pick the first word and continue through training → predict → pond.
    await this.wordButtons.first().click();
    await this.waitForTrainingScene();
    await this.skipTraining();
    await this.waitForPredictScene();
    await this.runPrediction();
    await this.predictContinueButton.click();
    await this.waitForPondScene();
    await this.pondContinueButton.click();
  }
}
