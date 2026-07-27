export class CheckoutPage {
  placeOrder(): Cypress.Chainable<number> {
    cy.get('[data-testid="checkout-use-fake-name-email"]').check();
    cy.get('[data-testid="checkout-use-fake-address"]').check();
    cy.get('[data-testid="checkout-use-testing-card"]').check();
    cy.get('[data-testid="checkout-submit"]').click();
    return cy.url().should('match', /\/orders\/\d+$/).then((url) => {
      const orderId = Number(url.match(/\/orders\/(\d+)$/)?.[1]);
      if (!orderId) throw new Error('Order ID was not present in the order detail URL');
      return orderId;
    });
  }
}
