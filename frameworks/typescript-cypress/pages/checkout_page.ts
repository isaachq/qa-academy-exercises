import { ACTIONS, step } from '../helpers/steps';

export class CheckoutPage {
  fillTestingDetails(): void {
    step(ACTIONS.checkoutFill, () => {
      cy.get('[data-testid="checkout-use-fake-name-email"]').check();
      cy.get('[data-testid="checkout-use-fake-address"]').check();
      cy.get('[data-testid="checkout-use-testing-card"]').check();
    });
  }

  submitOrder(): Cypress.Chainable<number> {
    return step(ACTIONS.checkoutSubmit, () => {
      cy.get('[data-testid="checkout-submit"]').click();
      return cy
        .url()
        .should('match', /\/orders\/\d+$/)
        .then((url) => {
          const orderId = Number(url.match(/\/orders\/(\d+)$/)?.[1]);
          if (!orderId) throw new Error('Order ID was not present in the order detail URL');
          return orderId;
        });
    });
  }

  placeOrder(): Cypress.Chainable<number> {
    this.fillTestingDetails();
    return this.submitOrder();
  }
}
