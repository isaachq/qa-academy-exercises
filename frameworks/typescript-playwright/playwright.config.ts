import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment.js';

const projects = [
  {
    name: 'api',
    testMatch: /api\/.*\.spec\.ts/,
    use: {},
  },
  {
    name: 'desktop-chromium',
    testMatch: /ui\/.*\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'mobile-chromium',
    testMatch: /product_purchase_traceability\.spec\.ts/,
    use: { ...devices['Pixel 7'] },
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [
    ['line'],
    ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
  ],
  use: {
    baseURL: environment.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects,
});
