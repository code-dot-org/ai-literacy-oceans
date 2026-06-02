import {type Locator, type Page} from 'playwright/test';

/** Sequence of app modes in curriculum order. */
export const SEQUENCE = [
  'fishvtrash',
  'creaturesvtrashdemo',
  'creaturesvtrash',
  'short',
  'long',
] as const;

export type AppMode = (typeof SEQUENCE)[number];

/**
 * Page object for the ai-literacy-oceans sequencer app.
 *
 * Wraps navigation and high-level assertions for the bare full-bleed wrapper.
 * Low-level lab interactions (training, predicting) are in LabPage.
 */
export class SequencerPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  /** The play-again screen shown after the final mode completes. */
  get playAgainScreen(): Locator {
    return this.page.getByTestId('play-again-screen');
  }

  /** The play-again button that restarts the sequence. */
  get playAgainButton(): Locator {
    return this.page.getByTestId('play-again-btn');
  }

  /**
   * Assert that no app-level chrome (header, footer, nav, branding) is present.
   * The lab renders bare with only its own in-canvas controls.
   */
  async assertNoBrowserChrome() {
    await this.page.waitForLoadState('networkidle');
    // No header or nav elements outside the lab container.
    const headers = this.page.locator('header, nav, footer');
    await headers.count().then(count => {
      if (count > 0) throw new Error(`Found ${count} chrome element(s)`);
    });
  }
}
