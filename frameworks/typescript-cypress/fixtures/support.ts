import 'allure-cypress';
import { environment } from '../config/environment';

Cypress.on('uncaught:exception', (error) => {
  const isKnownHydrationMismatch =
    error.message.includes('Minified React error #418') ||
    error.message.includes('Hydration failed because the server rendered HTML');

  if (isKnownHydrationMismatch) {
    return false;
  }
});

beforeEach(() => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem('api_token', environment.apiKey());
    window.localStorage.setItem('user_email', environment.uiEmail());
    window.localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
  });
});
