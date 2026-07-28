import 'dotenv/config';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { defineConfig } from 'cypress';
import { allureCypress } from 'allure-cypress/reporter';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import {
  nodeApiRequest,
  type NodeApiRequest,
} from './helpers/node_api_request';

const require = createRequire(import.meta.url);

const mobile = process.env.DEVICE_PROFILE === 'mobile';
const allureResultsDir = process.env.ALLURE_RESULTS_DIR ?? 'allure-results';
const downloadsFolder = resolve('cypress/downloads');

/**
 * Cypress ships a batteries-included preprocessor that resolves its Babel presets from the
 * Cypress binary cache instead of this project, which makes TypeScript specs fail to bundle
 * with "Cannot find module '@babel/preset-typescript'". Registering an explicit preprocessor
 * that resolves the presets from this project's own node_modules keeps spec bundling
 * deterministic on any machine and in CI.
 */
const typescriptPreprocessor = webpackPreprocessor({
  webpackOptions: {
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: { extensions: ['.ts', '.js', '.mjs', '.json'] },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              configFile: false,
              babelrc: false,
              presets: [[require.resolve('@babel/preset-typescript'), { onlyRemoveTypeImports: true }]],
            },
          },
        },
      ],
    },
  },
});

export default defineConfig({
  video: true,
  retries: 0,
  viewportWidth: mobile ? 412 : 1440,
  viewportHeight: mobile ? 915 : 900,
  downloadsFolder,
  e2e: {
    baseUrl: process.env.BASE_URL ?? 'https://qaacademyabc.xyz',
    specPattern: 'tests/**/*.spec.ts',
    supportFile: 'fixtures/support.ts',
    setupNodeEvents(on, config) {
      on('file:preprocessor', typescriptPreprocessor);
      on('task', {
        apiRequest(request: NodeApiRequest) {
          return nodeApiRequest(
            config.baseUrl ?? 'https://qaacademyabc.xyz',
            request,
            process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          );
        },
        /**
         * Cypress downloads land on disk instead of exposing a download event,
         * so the Playground download case reads the folder to learn the name
         * the application chose.
         */
        listDownloads() {
          return existsSync(downloadsFolder) ? readdirSync(downloadsFolder) : [];
        },
        clearDownloads() {
          rmSync(downloadsFolder, { recursive: true, force: true });
          return null;
        },
      });
      allureCypress(on, config, { resultsDir: allureResultsDir });
      return config;
    },
  },
  env: {
    apiKey: process.env.API_KEY,
    uiEmail: process.env.UI_EMAIL,
    uiPassword: process.env.UI_PASSWORD,
    deviceProfile: process.env.DEVICE_PROFILE ?? 'desktop',
    // Maintainer-only. Empty for public learners, which keeps every request and
    // page load on the same protected path a learner experiences.
    vercelBypassSecret: process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? '',
    // Traceability IDs selected with `--env ids=API-CART-001,API-CART-002`.
    ids: process.env.TEST_IDS ?? '',
  },
});
