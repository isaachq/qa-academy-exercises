import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { PlaygroundPage } from '../../pages/playground_page';

describe('Playground flaky test triage', () => {
  it('reproduces a controlled scenario with a fixed seed', () => {
    allure.epic('Chapter 5');
    allure.feature('Playground');
    allure.story('Flaky test triage');
    allure.parameter('seed', String(teachingData.flakySeed));
    const playground = new PlaygroundPage();
    playground.openWithSeed(teachingData.flakySeed);
    playground.runFastSuccess();
  });
});
