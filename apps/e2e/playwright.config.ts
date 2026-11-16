import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4300);
const ci = !!process.env.CI;

export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  expect: { timeout: 15_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  retries: ci ? 1 : 0,
  workers: ci ? 2 : 3,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  // Screenshot baselines are generated on Linux in CI (see e2e-baselines.yml).
  ignoreSnapshots: !ci && !process.env.E2E_SNAPSHOTS,
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: `http://localhost:${port}`,
    locale: 'zh-CN',
    timezoneId: 'Europe/London',
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: 'node serve.ts',
    url: `http://localhost:${port}`,
    reuseExistingServer: !ci,
    env: { E2E_PORT: String(port) },
  },
});
