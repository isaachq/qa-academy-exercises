export type Inventory = { stock: number; reserved: number; available: number };

export class StorePage {
  openProduct(productId: number, productName: string): void {
    cy.visit('/store');
    cy.get('[data-testid="store-search"]').type(productName);
    cy.get(`[data-testid="product-add-to-cart-${productId}"]`).should('be.visible');
  }

  readInventory(productId: number): Cypress.Chainable<Inventory> {
    cy.get(`[data-testid="product-stock-info-${productId}"]`).click();
    return cy.get('[data-testid="stock-info-modal"]').should('be.visible').invoke('text').then((text) => {
      const read = (label: string): number => {
        const match = text.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
        if (!match) throw new Error(`Inventory value not found for ${label}`);
        return Number(match[1]);
      };
      const inventory = {
        stock: read('Total Stock'),
        reserved: read('Reserved in Your Cart'),
        available: read('Available to Add'),
      };
      return cy.get('[data-testid="stock-info-close"]').click().then(() => inventory);
    });
  }

  addToCart(productId: number, expectedReserved = 1): void {
    cy.intercept('POST', '/api/cart').as('addToCart');
    cy.get(`[data-testid="product-add-to-cart-${productId}"]`).click();
    cy.wait('@addToCart').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.get(`[data-testid="product-stock-info-${productId}"]`)
      .parent()
      .should('contain.text', `Reserved: ${expectedReserved}`);
  }

  openOrderHistory(productId: number, orderId: number): void {
    cy.get(`[data-testid="product-order-history-${productId}"]`).click();
    cy.get('[data-testid="order-history-modal"]').should('be.visible');
    cy.get(`[data-testid="order-history-row-${orderId}"]`).scrollIntoView().should('be.visible');
  }

  assertMobileModalContract(): void {
    cy.get('[data-testid="order-history-modal"]').should('be.visible');
    cy.get('[data-testid="order-history-modal"]')
      .invoke('css', 'overflow-y')
      .should('eq', 'auto');
    cy.get('[data-testid="order-history-modal"]')
      .parent()
      .invoke('css', 'position')
      .should('eq', 'fixed');
    cy.get('[data-testid="order-history-close"]').scrollIntoView().should('be.visible').click();
    cy.get('body').find('[data-testid="order-history-modal"]').its('length').should('eq', 0);
  }
}
