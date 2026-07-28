/**
 * Replaces the value of a controlled field in a single Cypress command.
 *
 * `cy.get(field).clear().type(value)` fails on the application's controlled
 * inputs: `clear` triggers a re-render, the subject detaches, and Cypress
 * refuses to requery after `type`. Selecting and deleting inside the same
 * `type` call keeps the whole edit on one subject.
 *
 * Fields the application disables while a request is in flight are waited for
 * separately, because `cy.get` retries until the element exists, not until it
 * accepts input.
 */
/**
 * A field is also unusable when an ancestor `<fieldset disabled>` blocks it,
 * which is how the application freezes a whole form while a request is in
 * flight. jQuery's `:disabled` only looks at the element itself, so the
 * ancestor is checked explicitly.
 */
const waitUntilEditable = ($field: JQuery<HTMLElement>): void => {
  const blocked = $field.is(':disabled') || $field.closest('fieldset[disabled]').length > 0;
  expect(blocked, `${$field.attr('data-testid') ?? 'field'} accepts input`).to.eq(false);
};

export const fill = (
  selector: string,
  value: string,
  options?: Partial<Cypress.TypeOptions>,
): void => {
  cy.get(selector).should(waitUntilEditable);
  cy.get(selector).type(`{selectall}{del}${value}`, options);
};

/** Empties a controlled field without leaving the subject detached. */
export const clearField = (selector: string): void => {
  cy.get(selector).should(waitUntilEditable);
  cy.get(selector).type('{selectall}{del}');
};
