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
    cy.get(`[data-testid="order-history-row-${orderId}"]`).should('be.visible');
  }

  assertMobileModalContract(): void {
    cy.get('[data-testid="order-history-modal"]').then(($modal) => {
      const rect = $modal[0].getBoundingClientRect();
      const backdrop = $modal[0].parentElement;
      expect(rect.left).to.be.at.least(0);
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'));
      expect(rect.top).to.be.at.least(0);
      expect(rect.height).to.be.at.most(Cypress.config('viewportHeight'));
      expect(getComputedStyle($modal[0]).overflowY).to.eq('auto');
      if (!backdrop) throw new Error('Order history backdrop was not found');
      expect(getComputedStyle(backdrop).position).to.eq('fixed');
      expect(backdrop.contains(document.elementFromPoint(1, 1))).to.eq(true);
    });
    cy.get('[data-testid="order-history-close"]').should('be.visible').click();
    cy.get('[data-testid="order-history-modal"]').should('not.exist');
  }
}
