import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { STEPS, TITLES, step } from '../../helpers/steps';
import { PlaygroundPage } from '../../pages/playground_page';

describe('Playground flaky test triage', () => {
  const playground = new PlaygroundPage();
  const seed = teachingData.flakySeed;

  it(TITLES.playgroundFlaky, () => {
    allure.epic('Chapter 5');
    allure.feature('Playground');
    allure.story('BOOK-TEST-UI-002 - Flaky test triage');
    allure.parameter('seed', String(seed));

    step(STEPS.openPlayground, () => {
      playground.openWithSeed(seed);
    });

    step(STEPS.assertSeed, () => {
      playground.expectSeed(seed);
    });

    step(STEPS.triggerFastSuccess, () => {
      playground.triggerFastSuccess();
    });

    step(STEPS.assertInvoiceModal, () => {
      playground.expectInvoiceModal(seed);
    });
  });
});
