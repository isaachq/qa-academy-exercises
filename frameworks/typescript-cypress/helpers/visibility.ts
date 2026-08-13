/**
 * Asserts an element is closed, whether the application hides it or removes it.
 *
 * The other three frameworks express this as Playwright's `toBeHidden()`, which
 * accepts both outcomes. Cypress's `not.exist` accepts only removal, and several
 * of this application's dialogs stay mounted while hidden, so the same contract
 * is expressed explicitly here.
 */
export const expectHidden = (selector: string, description = selector): void => {
  cy.get('body').should(($body) => {
    const found = $body.find(selector);
    expect(found.length === 0 || !found.is(':visible'), `${description} is closed`).to.eq(true);
  });
};
