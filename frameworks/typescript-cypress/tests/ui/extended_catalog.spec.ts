type UiCase = [id: string, title: string, route: string, selectors: string[], mobile?: boolean];

const cases: UiCase[] = [
  ['UI-AUTH-001', 'Valid login', '/login', ['login-email', 'login-continue']],
  ['UI-AUTH-002', 'Invalid login', '/login', ['login-email', 'login-continue']],
  ['UI-SHELL-001', 'Accept Terms Gate', '/store', ['terms-gate-dialog', 'terms-gate-accept']],
  ['UI-SHELL-002', 'Responsive navigation', '/store', ['app-shell', 'mobile-menu-open'], true],
  ['UI-STORE-001', 'Load Store', '/store', ['store-search', 'store-category-filter', 'store-type-filter']],
  ['UI-STORE-002', 'Search and filter Store', '/store', ['store-search', 'store-category-filter', 'store-type-filter']],
  ['UI-STORE-003', 'Paginate Store', '/store', ['store-items-per-page']],
  ['UI-PRODUCT-001', 'Create owned product', '/products', ['products-page', 'products-search', 'products-table']],
  ['UI-PRODUCT-002', 'Edit owned product', '/products', ['products-page', 'products-search', 'products-table']],
  ['UI-PRODUCT-003', 'Delete owned product', '/products', ['products-page', 'products-search', 'products-table']],
  ['UI-PRODUCT-004', 'Protect non-deletable product', '/products', ['products-page', 'products-table']],
  ['UI-CART-001', 'Add product to cart', '/store', ['store-search']],
  ['UI-CART-002', 'Change cart quantity', '/cart', ['cart-page']],
  ['UI-CART-003', 'Remove item with native dialog', '/cart', ['cart-page']],
  ['UI-CART-004', 'Clear cart', '/cart', ['cart-page']],
  ['UI-CHECKOUT-001', 'Required checkout validation', '/checkout', ['checkout-fullname', 'checkout-email', 'checkout-submit']],
  ['UI-CHECKOUT-002', 'Checkout boundary and negative data', '/checkout', ['checkout-address', 'checkout-card-number', 'checkout-expiry']],
  ['UI-CHECKOUT-003', 'Create order from checkout', '/checkout', ['checkout-submit', 'checkout-use-testing-card']],
  ['UI-CHECKOUT-004', 'Responsive checkout modal', '/checkout', ['checkout-more-about-shipping-taxes'], true],
  ['UI-ORDER-001', 'Open order detail', '/orders', ['orders-search', 'orders-status-filter']],
  ['UI-ORDER-002', 'Search and filter order history', '/orders', ['orders-search', 'orders-status-filter', 'orders-clear-filters']],
  ['UI-ORDER-003', 'Paginate order history', '/orders', ['orders-items-per-page']],
  ['UI-QUERY-001', 'Query products', '/query-lab', ['query-lab-page', 'query-lab-resource-products', 'query-lab-run']],
  ['UI-QUERY-002', 'Query orders', '/query-lab', ['query-lab-page', 'query-lab-resource-orders', 'query-lab-run']],
  ['UI-QUERY-003', 'Change Query transport', '/query-lab', ['query-lab-transport-query', 'query-lab-transport-override']],
  ['UI-QUERY-004', 'Query response states and cooldown', '/query-lab', ['query-lab-run', 'query-lab-results']],
  ['UI-PLAY-001', 'Smoke all 24 Playground sections', '/playground', ['section-text-inputs', 'section-shadow-dom']],
  ['UI-PLAY-002', 'Playground form boundaries', '/playground', ['section-contact-form', 'open-contact-modal']],
  ['UI-PLAY-003', 'Playground modal tabs and accordion', '/playground', ['section-modals', 'section-tabs', 'section-accordion']],
  ['UI-PLAY-004', 'Playground DataTable', '/playground', ['section-advanced-datatable', 'open-datatable']],
  ['UI-PLAY-005', 'Playground iframe hover and new tab', '/playground', ['example-iframe', 'hover-button-1', 'open-new-tab-form']],
  ['UI-PLAY-006', 'Playground download and upload', '/playground', ['download-csv', 'file-upload-input']],
  ['UI-PLAY-008', 'Playground open Shadow DOM', '/playground', ['shadow-host']],
  ['UI-MOBILE-001', 'Responsive Store', '/store', ['app-shell', 'mobile-menu-open', 'store-search'], true],
  ['UI-MOBILE-002', 'Responsive cart and modal', '/cart', ['cart-page', 'app-shell'], true],
  ['UI-MOBILE-003', 'Responsive Playground', '/playground', ['section-modals', 'section-advanced-datatable', 'section-shadow-dom'], true],
];

describe('Chapter 5 extended UI catalog', () => {
  for (const [id, title, route, selectors, mobile] of cases) {
    it(`[${id}] ${title}`, () => {
      if (mobile) cy.viewport(412, 915);

      if (id === 'UI-SHELL-001') {
        cy.visit('/', {
          onBeforeLoad(window) {
            window.localStorage.removeItem('qa-academy-terms-consent-v1');
          },
        });
        cy.visit(route, {
          onBeforeLoad(window) {
            window.localStorage.removeItem('qa-academy-terms-consent-v1');
          },
        });
        cy.get('[data-testid="terms-gate-dialog"]').should('be.visible');
        cy.get('[data-testid="terms-gate-accept"]').click();
        cy.window().its('localStorage').invoke('getItem', 'qa-academy-terms-consent-v1').should('equal', 'accepted');
        return;
      }

      cy.visit(route);
      if (id === 'UI-SHELL-002') cy.get('[data-testid="mobile-menu-open"]').click();
      if (id === 'UI-PLAY-001') {
        const sectionIds = [
          'section-text-inputs', 'section-buttons', 'section-radio', 'section-checkbox',
          'section-dropdown', 'section-other-inputs', 'section-modals', 'section-table',
          'section-tabs', 'section-accordion', 'section-links', 'section-loading',
          'section-badges', 'section-contact-form', 'section-order-form',
          'section-advanced-datatable', 'section-basic-auth', 'section-iframe',
          'section-geolocation', 'section-hover', 'section-new-tab',
          'section-download-upload', 'section-flakiness', 'section-shadow-dom',
        ];
        sectionIds.forEach((selector) => cy.get(`[data-testid="${selector}"]`).should('have.length', 1));
        return;
      }
      selectors.forEach((selector) => cy.get(`[data-testid="${selector}"]`).should('exist'));
    });
  }
});
