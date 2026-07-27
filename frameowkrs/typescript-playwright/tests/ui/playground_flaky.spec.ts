import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test } from '../../fixtures/test.js';
import { PlaygroundPage } from '../../pages/playground_page.js';

test('reproduces a controlled flaky scenario with a fixed seed', async ({ page }) => {
  await allure.epic('Chapter 5');
  await allure.feature('Playground');
  await allure.story('Flaky test triage');
  await allure.parameter('seed', String(teachingData.flakySeed));

  const playground = new PlaygroundPage(page);
  await playground.openWithSeed(teachingData.flakySeed);
  await playground.runFastSuccess(teachingData.flakySeed);
});
