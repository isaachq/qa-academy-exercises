import { ACTIONS, step } from '../helpers/steps';

export class PlaygroundPage {
  openWithSeed(seed: number): void {
    step(ACTIONS.playgroundOpen, () => {
      cy.visit('/playground', {
        onBeforeLoad(window) {
          window.localStorage.setItem('flaky_seed', String(seed));
        },
      });
    });
  }

  expectSeed(seed: number): void {
    step(ACTIONS.playgroundVerifySeed, () => {
      cy.get('[data-testid="flaky-seed-display"]').should('contain.text', seed);
    });
  }

  triggerFastSuccess(): void {
    step(ACTIONS.playgroundTrigger, () => {
      cy.get('[data-testid="trigger-success-fast"]').click();
    });
  }

  expectInvoiceModal(seed: number): void {
    step(ACTIONS.playgroundVerifyInvoice, () => {
      cy.get('[data-testid="flaky-invoice-modal"]', { timeout: 8000 }).should('be.visible');
      cy.get('[data-testid="flaky-invoice-status"]').should('be.visible');
      cy.get('[data-testid="flaky-seed-display"]').should('contain.text', seed);
    });
  }
}
