import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { environment, vercelAutomationHeaders } from './config/environment.js';

const bookTestPattern = /BOOK-TEST/;
const automationHeaders = vercelAutomationHeaders();

const projects = [
  {
    name: 'api',
    testMatch: /api\/.*\.spec\.ts/,
    grepInvert: bookTestPattern,
  },
  {
    name: 'desktop-chromium',
    testMatch: /ui\/.*\.spec\.ts/,
    grepInvert: bookTestPattern,
    use: {
      ...devices['Desktop Chrome'],
    },
  },
  {
    name: 'book-api',
    testMatch: /api\/.*\.spec\.ts/,
    grep: bookTestPattern,
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
    extraHTTPHeaders: automationHeaders,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects,
});
