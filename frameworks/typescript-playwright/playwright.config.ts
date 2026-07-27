import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment.js';

const selectedProfile = process.env.DEVICE_PROFILE ?? 'all';
const projects = [
  {
    name: 'desktop-chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'mobile-chromium',
    testMatch: /product_purchase_traceability\.spec\.ts/,
    use: { ...devices['Pixel 7'] },
  },
].filter((project) => selectedProfile === 'all' || project.name.startsWith(selectedProfile));

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
