import 'allure-cypress';
import { environment } from '../config/environment';

beforeEach(() => {
  cy.on('window:before:load', (window) => {
    window.localStorage.setItem('api_token', environment.apiKey());
    window.localStorage.setItem('user_email', environment.uiEmail());
    window.localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
  });
});
