import * as allure from 'allure-js-commons';
import { step } from '../../helpers/steps';
import { PlaygroundPage } from '../../pages/playground_page';

const label = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('Playground');
  allure.story(story);
};

describe('Chapter 5 extended UI catalog: Playground', () => {
  const playground = new PlaygroundPage();

  it('[UI-PLAY-001] Playground exposes all 24 unique automation sections', () => {
    label('UI-PLAY-001 - Playground section smoke');
    step('Given: a fresh Playground page', () => playground.open());
    step('Then: every documented section exists exactly once', () =>
      playground.expectCompleteSectionContract());
  });

  it('[UI-PLAY-002] Playground contact form validates required and boundary values', () => {
    label('UI-PLAY-002 - Form validation and boundaries');
    allure.parameter('messageBoundary', '500');
    step('Given: a fresh Playground page', () => playground.open());
    step('When: user submits invalid and boundary form values', () =>
      playground.expectContactFormValidationAndBoundaries());
  });

  it('[UI-PLAY-003] Playground modal tabs and accordion change deterministic state', () => {
    label('UI-PLAY-003 - Modal tabs and accordion');
    step('Given: a fresh Playground page', () => playground.open());
    step('When: user operates the modal tabs and accordion', () =>
      playground.expectModalTabsAndAccordion());
  });

  it('[UI-PLAY-004] Playground DataTable has 100 searchable sortable rows and no pagination', () => {
    label('UI-PLAY-004 - DataTable');
    allure.parameter('baseRows', '100');
    step('Given: a fresh Playground page', () => playground.open());
    step('Then: DataTable search and sort preserve its contract', () =>
      playground.expectDataTableContract());
  });

  it('[UI-PLAY-005] Playground controls iframe hover and new-tab contexts', () => {
    label('UI-PLAY-005 - Browser contexts');
    step('Given: a fresh Playground page', () => playground.open());
    step('When: user changes and restores browser contexts', () =>
      playground.expectIframeHoverAndNewTab());
  });

  it('[UI-PLAY-006] Playground verifies downloaded and uploaded files', () => {
    label('UI-PLAY-006 - Download and upload');
    step('Given: a fresh Playground page', () => playground.open());
    step('When: user downloads and uploads controlled artifacts', () =>
      playground.expectDownloadAndUpload());
  });

  it('[UI-PLAY-008] Playground open Shadow DOM accepts and returns input', () => {
    label('UI-PLAY-008 - Open Shadow DOM');
    step('Given: a fresh Playground page', () => playground.open());
    step('Then: open Shadow DOM interaction returns the submitted value', () =>
      playground.expectOpenShadowDom());
  });
});
