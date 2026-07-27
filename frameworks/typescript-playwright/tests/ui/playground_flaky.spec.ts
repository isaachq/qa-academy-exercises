import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test } from '../../fixtures/test.js';
import { STEPS, TITLES, step } from '../../helpers/steps.js';
import { PlaygroundPage } from '../../pages/playground_page.js';

test(TITLES.playgroundFlaky, async ({ page }) => {
  await allure.epic('Chapter 5');
  await allure.feature('Playground');
  await allure.story('Flaky test triage');
  await allure.parameter('seed', String(teachingData.flakySeed));

  const playground = new PlaygroundPage(page);
  const seed = teachingData.flakySeed;

  await step(STEPS.openPlayground, () => playground.openWithSeed(seed));
  await step(STEPS.assertSeed, () => playground.expectSeed(seed));
  await step(STEPS.triggerFastSuccess, () => playground.triggerFastSuccess());
  await step(STEPS.assertInvoiceModal, () => playground.expectInvoiceModal(seed));
});
