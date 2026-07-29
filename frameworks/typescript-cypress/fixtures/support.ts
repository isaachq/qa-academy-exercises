import '../helpers/report_error_guard';
import 'allure-cypress';
import { environment } from '../config/environment';
import { assertSelectionIsAllowed, decide, selectedIds } from '../helpers/execution_policy';
import { currentSession, resetSession } from './session';

Cypress.on('uncaught:exception', (error) => {
  const isKnownHydrationMismatch =
    error.message.includes('Minified React error #418') ||
    error.message.includes('Hydration failed because the server rendered HTML');

  if (isKnownHydrationMismatch) {
    return false;
  }
});

beforeEach(function seedBrowserSession() {
  resetSession();

  const ids = selectedIds();
  assertSelectionIsAllowed(ids);
  const decision = decide(this.currentTest?.title ?? '', ids);
  if (!decision.run) {
    if (decision.reason) throw new Error(decision.reason);
    this.skip();
  }

  cy.on('window:before:load', (window) => {
    const mode = currentSession();
    if (mode === 'anonymous') {
      window.localStorage.removeItem('api_token');
      window.localStorage.removeItem('user_email');
      window.localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
      return;
    }
    window.localStorage.setItem('api_token', environment.apiKey());
    window.localStorage.setItem('user_email', environment.uiEmail());
    if (mode === 'authenticated-without-consent') {
      window.localStorage.removeItem('qa-academy-terms-consent-v1');
      return;
    }
    window.localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
  });
});

