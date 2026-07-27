export class CartPage {
  openAndVerify(productName: string, quantity: number, unitPrice: number): void {
    cy.visit('/cart');
    cy.get('[data-testid="cart-items"]').should('contain.text', productName).and('contain.text', quantity);
    cy.get('[data-testid="cart-subtotal"]').should('contain.text', (quantity * unitPrice).toFixed(2));
  }

  proceedToCheckout(): void {
    cy.get('[data-testid="cart-checkout"]').click();
  }
}
