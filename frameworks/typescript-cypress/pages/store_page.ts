import { ACTIONS, step } from '../helpers/steps';

export type Inventory = { stock: number; reserved: number; available: number };

export class StorePage {
  open(): void {
    step(ACTIONS.storeOpen, () => {
      cy.visit('/store');
    });
  }

  searchProduct(productId: number, productName: string): void {
    step(ACTIONS.storeSearch, () => {
      cy.get('[data-testid="store-search"]').clear().type(productName);
      cy.get(`[data-testid="product-add-to-cart-${productId}"]`).should('be.visible');
    });
  }

  openProduct(productId: number, productName: string): void {
    this.open();
    this.searchProduct(productId, productName);
  }

  readInventory(productId: number): Cypress.Chainable<Inventory> {
    return step(ACTIONS.storeReadInventory, () => {
      cy.get(`[data-testid="product-stock-info-${productId}"]`).click();
      return cy
        .get('[data-testid="stock-info-modal"]')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
          const read = (label: string): number => {
            const match = text.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
            if (!match) throw new Error(`Inventory value not found for ${label}`);
            return Number(match[1]);
          };
          const inventory: Inventory = {
            stock: read('Total Stock'),
            reserved: read('Reserved in Your Cart'),
            available: read('Available to Add'),
          };
          return cy.get('[data-testid="stock-info-close"]').click().then(() => inventory);
        });
    });
  }

  addToCart(productId: number): void {
    step(ACTIONS.storeAddToCart, () => {
      cy.intercept('POST', '/api/cart').as('addToCart');
      cy.get(`[data-testid="product-add-to-cart-${productId}"]`).click();
      cy.wait('@addToCart').its('response.statusCode').should('be.oneOf', [200, 201]);
    });
  }

  expectReserved(productId: number, expectedReserved: number): void {
    step(ACTIONS.storeVerifyReserved, () => {
      cy.get(`[data-testid="product-stock-info-${productId}"]`)
        .parent()
        .should('contain.text', `Reserved: ${expectedReserved}`);
    });
  }

  openOrderHistory(productId: number): void {
    step(ACTIONS.storeOpenOrderHistory, () => {
      cy.get(`[data-testid="product-order-history-${productId}"]`).click();
      cy.get('[data-testid="order-history-modal"]').should('be.visible');
    });
  }

  expectOrderRow(orderId: number, quantity: number, status: string): void {
    step(ACTIONS.storeVerifyOrderRow, () => {
      cy.get(`[data-testid="order-history-row-${orderId}"]`)
        .scrollIntoView()
        .should('be.visible')
        .invoke('text')
        .should('include', String(quantity))
        .and('include', status);
    });
  }

  expectMobileModalContract(): void {
    step(ACTIONS.storeVerifyMobileModal, () => {
      cy.get('[data-testid="order-history-modal"]').then(($modal) => {
        const modal = $modal[0];
        const box = modal.getBoundingClientRect();
        expect(box.left, 'modal left edge').to.be.at.least(0);
        expect(box.top, 'modal top edge').to.be.at.least(0);
        expect(box.right, 'modal right edge').to.be.at.most(Cypress.config('viewportWidth'));
        expect(box.height, 'modal height').to.be.at.most(Cypress.config('viewportHeight'));

        const backdrop = modal.parentElement;
        expect(backdrop, 'modal backdrop').to.not.be.null;
        expect(getComputedStyle(backdrop!).position, 'backdrop position').to.eq('fixed');
        expect(getComputedStyle(modal).overflowY, 'modal overflow-y').to.eq('auto');
        const hitTarget = modal.ownerDocument.elementFromPoint(1, 1);
        expect(
          hitTarget !== null && backdrop!.contains(hitTarget),
          'backdrop owns the top-left hit target',
        ).to.eq(true);
      });
      cy.get('[data-testid="order-history-close"]').should('be.visible').click();
      cy.get('[data-testid="order-history-modal"]').should('not.exist');
    });
  }
}
