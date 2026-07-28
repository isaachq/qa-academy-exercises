import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { environment, vercelAutomationHeaders } from './config/environment.js';

const bookTestPattern = /BOOK-TEST/;
// Maintainer-only credentials are loaded from the local environment. Extended
// public tests receive the bypass during internal validation; Book projects
// intentionally never inherit these headers.
const automationHeaders = vercelAutomationHeaders();

const projects = [
  {
    name: 'api',
    testMatch: /api\/.*\.spec\.ts/,
    grepInvert: bookTestPattern,
    use: { extraHTTPHeaders: automationHeaders },
  },
  {
    name: 'desktop-chromium',
    testMatch: /ui\/.*\.spec\.ts/,
    grepInvert: bookTestPattern,
    use: {
      ...devices['Desktop Chrome'],
      extraHTTPHeaders: automationHeaders,
    },
  },
  {
    name: 'book-api',
    testMatch: /api\/.*\.spec\.ts/,
    grep: bookTestPattern,
    use: {},
  },
  {
    name: 'book-desktop-chromium',
    testMatch: /ui\/.*\.spec\.ts/,
    grep: bookTestPattern,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'mobile-chromium',
    testMatch: /product_purchase_traceability\.spec\.ts/,
    grep: bookTestPattern,
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
