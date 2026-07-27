export class PlaygroundPage {
  openWithSeed(seed: number): void {
    cy.visit('/playground', {
      onBeforeLoad(window) {
        window.localStorage.setItem('flaky_seed', String(seed));
      },
    });
    cy.get('[data-testid="flaky-seed-display"]').should('contain.text', seed);
  }

  runFastSuccess(): void {
    cy.get('[data-testid="trigger-success-fast"]').click();
    cy.get('[data-testid="flaky-invoice-modal"]', { timeout: 8000 }).should('be.visible');
    cy.get('[data-testid="flaky-invoice-status"]').should('be.visible');
  }
}
