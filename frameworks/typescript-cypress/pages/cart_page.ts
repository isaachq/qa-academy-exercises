import { ACTIONS, step } from '../helpers/steps';

export class CartPage {
  open(): void {
    step(ACTIONS.cartOpen, () => {
      cy.visit('/cart');
    });
  }

  expectItem(productName: string, quantity: number, unitPrice: number): void {
    step(ACTIONS.cartVerifyItem, () => {
      cy.get('[data-testid="cart-items"]')
        .should('contain.text', productName)
        .and('contain.text', quantity);
      cy.get('[data-testid="cart-subtotal"]').should(
        'contain.text',
        (quantity * unitPrice).toFixed(2),
      );
    });
  }

  proceedToCheckout(): void {
    step(ACTIONS.cartCheckout, () => {
      cy.get('[data-testid="cart-checkout"]').click();
    });
  }
}
