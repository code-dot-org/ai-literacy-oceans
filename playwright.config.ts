import {defineConfig, devices} from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  // workers:1 keeps lab scene transitions stable; TFJS model load is timing-sensitive.
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  // 90 s per test — TFJS model (1.87 MB) + scene transitions can be slow in CI.
  timeout: 60_000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173/ai-literacy-oceans/',
    trace: 'on-first-retry',
    actionTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    // Use the production build for e2e — pre-bundled assets avoid Vite's
    // per-request transform overhead, which caused TFJS model load timeouts
    // when multiple browser instances ran in parallel against the dev server.
    command: process.env.CI
      ? 'pnpm build && pnpm preview'
      : 'pnpm dev',
    url: 'http://localhost:5173/ai-literacy-oceans/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
