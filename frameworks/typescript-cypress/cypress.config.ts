import 'dotenv/config';
import { defineConfig } from 'cypress';
import { allureCypress } from 'allure-cypress/reporter';

const mobile = process.env.DEVICE_PROFILE === 'mobile';

export default defineConfig({
  video: true,
  retries: 0,
  viewportWidth: mobile ? 412 : 1440,
  viewportHeight: mobile ? 915 : 900,
  e2e: {
    baseUrl: process.env.BASE_URL ?? 'https://qaacademyabc.xyz',
    specPattern: 'tests/**/*.spec.ts',
    supportFile: 'fixtures/support.ts',
    setupNodeEvents(on, config) {
      allureCypress(on, config, { resultsDir: 'allure-results' });
      return config;
    },
  },
  env: {
    apiKey: process.env.API_KEY,
    uiEmail: process.env.UI_EMAIL,
    deviceProfile: process.env.DEVICE_PROFILE ?? 'desktop',
  },
});
