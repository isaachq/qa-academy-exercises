import { allure } from 'allure-playwright';
import { test } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { PlaygroundPage } from '../../pages/playground_page.js';

const label = async (story: string) => {
  await allure.epic('Chapter 5');
  await allure.feature('Playground');
  await allure.story(story);
};

test('[UI-PLAY-001] Playground exposes all 24 unique automation sections', async ({ page }) => {
  await label('UI-PLAY-001 - Playground section smoke');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('Then: every documented section exists exactly once', () =>
    playground.expectCompleteSectionContract());
});

test('[UI-PLAY-002] Playground contact form validates required and boundary values', async ({ page }) => {
  await label('UI-PLAY-002 - Form validation and boundaries');
  await allure.parameter('messageBoundary', '500');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('When: user submits invalid and boundary form values', () =>
    playground.expectContactFormValidationAndBoundaries());
});

test('[UI-PLAY-003] Playground modal tabs and accordion change deterministic state', async ({ page }) => {
  await label('UI-PLAY-003 - Modal tabs and accordion');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('When: user operates the modal tabs and accordion', () =>
    playground.expectModalTabsAndAccordion());
});

test('[UI-PLAY-004] Playground DataTable has 100 searchable sortable rows and no pagination', async ({ page }) => {
  await label('UI-PLAY-004 - DataTable');
  await allure.parameter('baseRows', '100');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('Then: DataTable search and sort preserve its contract', () =>
    playground.expectDataTableContract());
});

test('[UI-PLAY-005] Playground controls iframe hover and new-tab contexts', async ({ page }) => {
  await label('UI-PLAY-005 - Browser contexts');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('When: user changes and restores browser contexts', () =>
    playground.expectIframeHoverAndNewTab());
});

test('[UI-PLAY-006] Playground verifies downloaded and uploaded files', async ({ page }) => {
  await label('UI-PLAY-006 - Download and upload');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('When: user downloads and uploads controlled artifacts', () =>
    playground.expectDownloadAndUpload());
});

test('[UI-PLAY-008] Playground open Shadow DOM accepts and returns input', async ({ page }) => {
  await label('UI-PLAY-008 - Open Shadow DOM');
  const playground = new PlaygroundPage(page);
  await step('Given: a fresh Playground page', () => playground.open());
  await step('Then: open Shadow DOM interaction returns the submitted value', () =>
    playground.expectOpenShadowDom());
});
