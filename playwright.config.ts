import {defineConfig, devices} from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173/ai-literacy-oceans/',
    trace: 'on-first-retry',
    // Give the TFJS model time to load before assertions.
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173/ai-literacy-oceans/',
    reuseExistingServer: !process.env.CI,
  },
});
