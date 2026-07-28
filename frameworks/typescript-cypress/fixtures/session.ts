/**
 * Browser session seeded before every page load.
 *
 * Most tests need an authenticated shell, so `authenticated` is the default and
 * is restored before each test. The authentication and Terms Gate scenarios opt
 * out explicitly, before their first `cy.visit`.
 *
 * The mode lives in `Cypress.env` rather than in a module variable: Cypress
 * bundles the support file and each spec file separately, so a module-level
 * variable would give the support file and the spec two independent copies and
 * the opt-out would never reach the page-load listener.
 */
export type SessionMode = 'authenticated' | 'anonymous' | 'authenticated-without-consent';

const KEY = 'sessionMode';

export const useSession = (next: SessionMode): void => {
  Cypress.env(KEY, next);
};

export const currentSession = (): SessionMode =>
  (Cypress.env(KEY) as SessionMode | undefined) ?? 'authenticated';

export const resetSession = (): void => {
  Cypress.env(KEY, 'authenticated');
};
