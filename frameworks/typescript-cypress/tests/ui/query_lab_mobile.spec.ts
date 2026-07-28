import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { clearField, fill } from '../../helpers/form';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { OrderService, type ControlledOrder } from '../../services/order_service';
import { ProductService, type Product } from '../../services/product_service';

const labels = (feature: string, story: string): void => {
  allure.epic('Chapter 5');
  allure.feature(feature);
  allure.story(story);
};

const openLab = (): void => {
  cy.visit('/query-lab');
  cy.get('[data-testid="query-lab-page"]').should('be.visible');
};

const runLab = (): void => {
  cy.get('[data-testid="query-lab-run"]').click();
  cy.get('[data-testid="query-lab-loading"]').should('not.exist');
};

const MOBILE = { width: 390, height: 844 };

describe('Chapter 5 extended UI catalog: Query Lab and mobile web', () => {
  const products = new ProductService();
  const orders = new OrderService(products);

  let controlled: ControlledOrder | undefined;
  let product: Product | undefined;

  beforeEach(() => {
    controlled = undefined;
    product = undefined;
  });

  afterEach(() => {
    orders.cleanup(controlled);
    if (product) {
      products.clearCart();
      products.deleteProduct(product.id);
    }
  });

  it('[UI-QUERY-001] Query Lab queries products with a visible document', () => {
    labels('Query Lab UI', 'UI-QUERY-001 - Query products');
    openLab();

    step('When: user configures filters and runs a product QUERY', () => {
      fill('[data-testid="query-lab-search"]', 'a');
      cy.get('[data-testid="query-lab-sort-field"]').select('price');
      cy.get('[data-testid="query-lab-sort-direction"]').select('asc');
      runLab();
    });
    step('Then: preview, transport, table and metadata are consistent', () => {
      cy.get('[data-testid="query-lab-preview-code"]').should('contain.text', 'QUERY');
      cy.get('[data-testid="query-lab-status-badge"]').should('contain.text', '200');
      cy.get('[data-testid="query-lab-transport-badge"]').should('contain.text', 'QUERY');
      cy.get('[data-testid="query-lab-table"]').should('be.visible');
    });
  });

  it('[UI-QUERY-002] Query Lab queries orders and uses the total field', () => {
    labels('Query Lab UI', 'UI-QUERY-002 - Query orders');

    step('Given: a controlled order exists for the query result', () => {
      orders.createControlledOrder('ui-query-orders').then((created) => {
        controlled = created;
      });
    });
    step('When: user switches to orders and sorts by total', () => {
      openLab();
      cy.get('[data-testid="query-lab-resource-orders"]').click();
      cy.get('[data-testid="query-lab-sort-field"]').select('total');
      runLab();
    });
    step('Then: results and header use total rather than total_amount', () => {
      cy.get('[data-testid="query-lab-transport-badge"]').should('contain.text', 'QUERY');
      cy.get('[data-testid="query-lab-th-total"]').should('be.visible');
      cy.get('[data-testid="query-lab-results"]')
        .should('contain.text', String(controlled!.order.id))
        .and('not.contain.text', 'total_amount');
    });
  });

  it('[UI-QUERY-003] Query Lab switches to POST override transport', () => {
    labels('Query Lab UI', 'UI-QUERY-003 - Change transport');
    openLab();

    step('When: user selects POST with X-HTTP-Method-Override', () => {
      cy.get('[data-testid="query-lab-transport-override"]').click();
      cy.get('[data-testid="query-lab-preview-code"]').should(
        'contain.text',
        'X-HTTP-Method-Override: QUERY',
      );
      runLab();
    });
    step('Then: the response identifies POST_OVERRIDE', () => {
      cy.get('[data-testid="query-lab-transport-badge"]').should('contain.text', 'POST_OVERRIDE');
    });
  });

  it('[UI-QUERY-004] Query Lab exposes loading empty error and cooldown states', () => {
    labels('Query Lab UI', 'UI-QUERY-004 - Loading empty error cooldown');
    openLab();

    let delayed = false;
    // The first real query is slowed so the loading state is observable; every
    // later query keeps the platform's own timing. Cypress schedules each
    // assertion through its command queue, so the window has to be wider than
    // the 400 ms the Playwright project uses to stay reliable.
    cy.intercept({ url: '**/api/products/query' }, (request) => {
      if (delayed) return;
      delayed = true;
      request.continue((response) => {
        response.setDelay(1_200);
      });
    });

    step('When: a real query remains in flight', () => {
      cy.get('[data-testid="query-lab-run"]').click();
      cy.get('[data-testid="query-lab-loading"]').should('be.visible');
      cy.get('[data-testid="query-lab-loading"]').should('not.exist');
    });
    step('Then: the accessible cooldown starts', () => {
      cy.get('[data-testid="query-lab-cooldown-toast"]').should('be.visible');
      cy.get('[data-testid="query-lab-run"]').should('be.disabled');
      cy.get('[data-testid="query-lab-run"]', { timeout: 5_000 }).should('be.enabled');
    });
    step('When: a search has no matches, the empty state appears', () => {
      fill('[data-testid="query-lab-search"]', `no-result-${Date.now()}`);
      runLab();
      cy.get('[data-testid="query-lab-no-results"]').should('be.visible');
      cy.get('[data-testid="query-lab-run"]', { timeout: 5_000 }).should('be.enabled');
    });
    step('When: the range is invalid, the server error is visible', () => {
      clearField('[data-testid="query-lab-search"]');
      fill('[data-testid="query-lab-price-min"]', '100');
      fill('[data-testid="query-lab-price-max"]', '1');
      runLab();
      cy.get('[data-testid="query-lab-error"]').should('be.visible');
    });
  });

  it('[UI-MOBILE-001] Store adapts to a mobile viewport without overflow', () => {
    labels('Mobile UI', 'UI-MOBILE-001 - Responsive Store');
    cy.viewport(MOBILE.width, MOBILE.height);
    cy.visit('/store');

    step('Then: primary controls and cards fit inside the viewport', () => {
      cy.get('[data-testid="mobile-menu-open"]').should('be.visible');
      cy.get('[data-testid="store-search"]').should('be.visible');
      cy.get('[data-testid^="product-add-to-cart-"]').first().should('be.visible');
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.at.most', MOBILE.width);
    });
  });

  it('[UI-MOBILE-002] Cart and modal preserve the responsive contract', () => {
    labels('Mobile UI', 'UI-MOBILE-002 - Responsive cart and modal');

    products.clearCart();
    products
      .createProduct({ name: uniqueProductName('ui-mobile-cart'), ...teachingData.product })
      .then((created) => {
        product = created;
        cy.viewport(MOBILE.width, MOBILE.height);
        cy.intercept('POST', '**/api/cart').as('addToCart');
        cy.visit('/store');
        fill('[data-testid="store-search"]', created.name);
        // The store re-renders the catalog when the search response lands. Waiting
        // for the filtered card means the click hits the mounted button instead
        // of one the re-render is about to replace.
        cy.get('[data-testid^="product-add-to-cart-"]').should('have.length', 1);
        cy.get(`[data-testid="product-add-to-cart-${created.id}"]`).click();
        cy.wait('@addToCart').its('response.statusCode').should('eq', 201);

        step('Then: the inventory modal fits the mobile viewport', () => {
          cy.get(`[data-testid="product-stock-info-${created.id}"]`).click();
          cy.get('[data-testid="stock-info-modal"]')
            .should('be.visible')
            .then(($modal) => {
              const box = $modal[0].getBoundingClientRect();
              expect(box.right, 'modal right edge').to.be.at.most(MOBILE.width);
              expect(box.height, 'modal height').to.be.at.most(MOBILE.height);
            });
          cy.get('[data-testid="stock-info-close"]').click();
        });
        step('Then: the cart keeps the item without global overflow', () => {
          cy.visit('/cart');
          cy.get('[data-testid="cart-items"]').should('contain.text', created.name);
          cy.document()
            .its('documentElement.scrollWidth')
            .should('be.at.most', MOBILE.width);
        });
      });
  });

  it('[UI-MOBILE-003] Playground keeps its sections usable on mobile', () => {
    labels('Mobile UI', 'UI-MOBILE-003 - Responsive Playground');
    cy.viewport(MOBILE.width, MOBILE.height);
    cy.visit('/playground');

    step('Then: initial controls, table and Shadow DOM do not cause global overflow', () => {
      cy.get('[data-testid="section-text-inputs"]').should('be.visible');
      cy.get('[data-testid="section-advanced-datatable"]').should('be.visible');
      cy.get('[data-testid="section-shadow-dom"]').should('be.visible');
      cy.document()
        .its('documentElement.scrollWidth')
        .should('be.at.most', MOBILE.width);
    });
  });
});
