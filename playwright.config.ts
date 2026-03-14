import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['html', { outputFolder: '../artifacts/playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },
  outputDir: '../artifacts/test-results',
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14 Pro'] },
    },
  ],
});
