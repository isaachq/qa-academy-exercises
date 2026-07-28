// Import order matters: the guard must register its `fail` listener before the
// reporter registers its own, so it can sanitize the error first. Keep this
// import above 'allure-cypress'.
import '../helpers/report_error_guard';
import 'allure-cypress';
import {
  environment,
  hasAutomationBypass,
  vercelAutomationHeaders,
} from '../config/environment';
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

/**
 * The protected deployment answers a verification page unless the request
 * carries the maintainer bypass. `cy.visit` accepts headers, so every visit
 * inherits them without each page object knowing the deployment is protected.
 */
Cypress.Commands.overwrite(
  'visit',
  (
    originalFn,
    url: string | Partial<Cypress.VisitOptions>,
    options?: Partial<Cypress.VisitOptions>,
  ) => {
    const bypass = vercelAutomationHeaders();
    const merged =
      typeof url === 'string'
        ? { ...options, url, headers: { ...bypass, ...options?.headers } }
        : { ...url, headers: { ...bypass, ...url.headers } };
    return originalFn(merged as Partial<Cypress.VisitOptions> & { url: string });
  },
);

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

  // `x-vercel-set-bypass-cookie` makes the platform issue the bypass cookie the
  // application's own XHRs then reuse. Cypress clears cookies between tests, so
  // the cookie is requested once per test rather than once per run.
  if (hasAutomationBypass()) {
    cy.request({
      url: '/',
      headers: vercelAutomationHeaders(),
      failOnStatusCode: false,
      log: false,
    });
  }
});
