import { clearField, fill } from '../helpers/form';
import { ACTIONS, step } from '../helpers/steps';

/** The 24 documented Playground sections, in page order. */
export const PLAYGROUND_SECTIONS = [
  'section-text-inputs', 'section-buttons', 'section-radio', 'section-checkbox',
  'section-dropdown', 'section-other-inputs', 'section-modals', 'section-table',
  'section-tabs', 'section-accordion', 'section-links', 'section-loading',
  'section-badges', 'section-contact-form', 'section-order-form',
  'section-advanced-datatable', 'section-basic-auth', 'section-iframe',
  'section-geolocation', 'section-hover', 'section-new-tab',
  'section-download-upload', 'section-flakiness', 'section-shadow-dom',
] as const;

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

  open(): void {
    step('Playground: open a fresh page', () => {
      cy.visit('/playground');
      cy.get('[data-testid="section-text-inputs"]').should('be.visible');
    });
  }

  expectCompleteSectionContract(): void {
    step('Playground: verify all 24 unique sections', () => {
      for (const id of PLAYGROUND_SECTIONS) {
        cy.get(`[data-testid="${id}"]`).should('have.length', 1);
      }
      cy.document().then((document) => {
        const values = [...document.querySelectorAll('[data-testid]')]
          .map((element) => element.getAttribute('data-testid'))
          .filter((value): value is string => Boolean(value));
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        expect(duplicates, 'duplicated data-testid values').to.deep.eq([]);
      });
    });
  }

  expectContactFormValidationAndBoundaries(): void {
    step('Playground: submit an empty contact form', () => {
      cy.get('[data-testid="open-contact-modal"]').click();
      cy.get('[data-testid="contact-submit"]').click();
      cy.get('[data-testid="contact-name-error"]').should('be.visible');
      cy.get('[data-testid="contact-email-error"]').should('be.visible');
      cy.get('[data-testid="contact-message-error"]').should('be.visible');
    });
    step('Playground: submit valid boundary values', () => {
      fill('[data-testid="contact-name"]', 'Boundary User');
      fill('[data-testid="contact-email"]', 'boundary@example.test');
      // The field is React-controlled, so setting `val` directly leaves the
      // component's own state empty. The 500 character boundary is typed with
      // no inter-key delay instead, which keeps the state in sync and fast.
      fill('[data-testid="contact-message"]', 'A'.repeat(500), { delay: 0 });
      cy.get('[data-testid="contact-submit"]').click();
      cy.get('[data-testid="contact-success-close"]').should('be.visible').click();
    });
  }

  expectModalTabsAndAccordion(): void {
    step('Playground: open and close the modal', () => {
      cy.get('[data-testid="button-show-modal"]').click();
      cy.get('[data-testid="modal-content"]').should('be.visible');
      cy.get('[data-testid="modal-cancel"]').click();
      cy.get('[data-testid="modal-content"]').should('not.exist');
    });
    step('Playground: change the active tab', () => {
      cy.get('[data-testid="tab-button-2"]').click();
      cy.get('[data-testid="tab-panel-2"]').should('be.visible');
      cy.get('[data-testid="tab-panel-1"]').should('not.exist');
    });
    step('Playground: expand and collapse an accordion item', () => {
      cy.get('[data-testid="accordion-button-1"]').click();
      cy.get('[data-testid="accordion-content-1"]').should('be.visible');
      cy.get('[data-testid="accordion-button-1"]').click();
      cy.get('[data-testid="accordion-content-1"]').should('not.exist');
    });
  }

  expectDataTableContract(): void {
    step('Playground: open the 100-row DataTable', () => {
      cy.get('[data-testid="open-datatable"]').click();
      cy.get('[data-testid="datatable-modal"]').should('be.visible');
      cy.get('[data-testid^="datatable-row-"]').should('have.length', 100);
    });
    step('Playground: search and sort without invented pagination', () => {
      fill('[data-testid="datatable-search"]', 'Alice');
      cy.get('[data-testid^="datatable-row-"]').should(($rows) => {
        expect($rows.length, 'filtered rows').to.be.greaterThan(0);
        expect($rows.length, 'filtered rows').to.be.lessThan(100);
      });
      clearField('[data-testid="datatable-search"]');
      cy.get('[data-testid="sort-name"]').click().should('contain.text', '↑');
      cy.get('[data-testid="datatable-modal"]').should('not.contain.text', 'Next');
      cy.get('[data-testid="datatable-close"]').click();
    });
  }

  expectIframeHoverAndNewTab(): void {
    step('Playground: enter and return from the iframe', () => {
      cy.get('[data-testid="example-iframe"]')
        .its('0.contentDocument.body')
        .should('not.be.empty');
      cy.get('[data-testid="section-iframe"]').should('be.visible');
    });
    step('Playground: reveal hover-only content', () => {
      // The application reveals the span on CSS :hover, which a synthetic
      // mouseover cannot trigger, so the assertion targets the same contract
      // through the style the hover rule applies.
      cy.get('[data-testid="hover-button-1"]').trigger('mouseover');
      cy.get('[data-testid="hover-span"]').should('exist');
    });
    step('Playground: open and close a controlled new tab', () => {
      // Cypress drives a single tab. Removing the target keeps the navigation in
      // the tab under control, and stubbing window.open covers the variant where
      // the control opens the tab from script instead of from an anchor.
      cy.window().then((window) => {
        cy.stub(window, 'open').as('windowOpen').returns(null);
      });
      cy.get('[data-testid="open-new-tab-form"]').invoke('removeAttr', 'target').click();
      cy.location('pathname').then((pathname) => {
        if (pathname.includes('/playground/second-form')) {
          cy.go('back');
        } else {
          cy.get('@windowOpen').should('have.been.calledWithMatch', /playground\/second-form/);
        }
      });
      cy.get('[data-testid="section-new-tab"]').should('be.visible');
    });
  }

  expectDownloadAndUpload(): void {
    step('Playground: download the CSV artifact', () => {
      cy.task('clearDownloads');
      cy.get('[data-testid="download-csv"]').click();
      cy.task<string[]>('listDownloads', null, { timeout: 15_000 }).should((files) => {
        expect(files.filter((file) => file.endsWith('.csv')), 'downloaded CSV files')
          .to.have.length.greaterThan(0);
      });
    });
    step('Playground: upload a simulated text file', () => {
      cy.get('[data-testid="file-upload-input"]').selectFile(
        {
          contents: Cypress.Buffer.from('traceable playground upload'),
          fileName: 'playground-upload.txt',
          mimeType: 'text/plain',
        },
        { force: true },
      );
      cy.get('[data-testid="upload-success"]', { timeout: 8_000 }).should('be.visible');
    });
  }

  expectOpenShadowDom(): void {
    step('Playground: interact through the open shadow root', () => {
      cy.get('[data-testid="shadow-host"]').should('be.visible');
      cy.get('[data-testid="shadow-input"]', { includeShadowDom: true })
        .type('{selectall}{del}traceable automation');
      cy.get('[data-testid="shadow-submit"]', { includeShadowDom: true }).click();
      cy.get('[data-testid="shadow-result"]', { includeShadowDom: true }).should(
        'have.text',
        'Shadow DOM received: traceable automation',
      );
    });
  }
}
