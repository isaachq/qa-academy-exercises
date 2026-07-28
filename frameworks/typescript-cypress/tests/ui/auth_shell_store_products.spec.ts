import * as allure from 'allure-js-commons';
import { environment } from '../../config/environment';
import { teachingData } from '../../data/test_data';
import { useSession } from '../../fixtures/session';
import { fill } from '../../helpers/form';
import { expectHidden } from '../../helpers/visibility';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService, type Product } from '../../services/product_service';

const labels = (feature: string, story: string): void => {
  allure.epic('Chapter 5');
  allure.feature(feature);
  allure.story(story);
};

describe('Chapter 5 extended UI catalog: authentication, shell, store and products', () => {
  const products = new ProductService();

  // Cypress aborts the command queue on the first failure, so mutable data is
  // tracked here and undone by the hook instead of at the end of the test.
  let product: Product | undefined;
  let deletedInTest = false;

  beforeEach(() => {
    product = undefined;
    deletedInTest = false;
  });

  afterEach(() => {
    if (product && !deletedInTest) products.deleteProduct(product.id);
  });

  it('[UI-AUTH-001] Valid login preserves an authenticated session', () => {
    labels('Authentication UI', 'UI-AUTH-001 - Valid login');
    useSession('anonymous');

    step('Given: login opens without a previous session', () => {
      cy.visit('/login');
    });
    step('When: user validates the email and submits the valid password', () => {
      fill('[data-testid="login-email"]', environment.uiEmail());
      cy.get('[data-testid="login-continue"]').click();
      cy.get('[data-testid="login-password"]').should('be.visible');
      // `log: false` keeps the password out of the command log and the report.
      fill('[data-testid="login-password"]', environment.uiPassword(), { log: false });
      cy.get('[data-testid="login-submit"]').click();
    });
    step('Then: the application opens an authenticated route and stores the token', () => {
      cy.location('pathname').should('not.match', /\/login$/);
      cy.window().its('localStorage').invoke('getItem', 'api_token').should('be.a', 'string');
    });
  });

  it('[UI-AUTH-002] Invalid login displays a traceable error', () => {
    labels('Authentication UI', 'UI-AUTH-002 - Invalid login');
    useSession('anonymous');
    cy.visit('/login');

    step('When: user attempts to continue with a nonexistent account', () => {
      fill('[data-testid="login-email"]', `missing-${Date.now()}@example.invalid`);
      cy.get('[data-testid="login-continue"]').click();
    });
    step('Then: no session is created and an error is displayed', () => {
      cy.get('[data-testid="login-error"]').should('be.visible');
      cy.window().its('localStorage').invoke('getItem', 'api_token').should('be.null');
      cy.location('pathname').should('match', /\/login$/);
    });
  });

  it('[UI-SHELL-001] Accepting the Terms Gate persists consent', () => {
    labels('Application shell UI', 'UI-SHELL-001 - Accept Terms Gate');
    useSession('authenticated-without-consent');
    cy.visit('/store');
    cy.get('[data-testid="terms-gate-dialog"]').should('be.visible');

    step('When: user accepts the terms', () => {
      cy.get('[data-testid="terms-gate-accept"]').click();
    });
    step('Then: the dialog closes and consent remains persisted', () => {
      expectHidden('[data-testid="terms-gate-dialog"]', 'terms gate dialog');
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'qa-academy-terms-consent-v1')
        .should('eq', 'accepted');
    });
  });

  it('[UI-SHELL-002] Responsive navigation exposes the sidebar and drawer', () => {
    labels('Application shell UI', 'UI-SHELL-002 - Responsive navigation');
    cy.visit('/store');

    step('Then: desktop shows the sidebar and active route', () => {
      cy.get('[data-testid="primary-sidebar"]').should('be.visible');
      cy.get('[data-testid="desktop-nav"] a[href="/store"]').should(
        'have.attr',
        'aria-current',
        'page',
      );
    });
    step('When: viewport changes to mobile width', () => {
      cy.viewport(390, 844);
      cy.get('[data-testid="mobile-menu-open"]').should('be.visible').click();
    });
    step('Then: the mobile drawer can be opened and closed', () => {
      cy.get('[data-testid="mobile-nav"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-close"]').click();
      expectHidden('[data-testid="mobile-nav"]', 'mobile drawer');
    });
  });

  it('[UI-STORE-001] Store loads its catalog and controls', () => {
    labels('Store UI', 'UI-STORE-001 - Load Store');

    step('When: user opens the Store', () => {
      cy.visit('/store');
    });
    step('Then: catalog, search and filters are usable', () => {
      cy.get('[data-testid="store-search"]').should('be.visible');
      cy.get('[data-testid="store-category-filter"]').should('be.visible');
      cy.get('[data-testid="store-type-filter"]').should('be.visible');
      cy.get('[data-testid^="product-add-to-cart-"]').first().should('be.visible');
    });
  });

  it('[UI-STORE-002] Store searches and filters products', () => {
    labels('Store UI', 'UI-STORE-002 - Search and filter');

    products
      .createProduct({
        name: uniqueProductName('ui-store-filter'),
        ...teachingData.product,
        category: 'Office',
      })
      .then((created) => {
        product = created;
        cy.visit('/store');

        step('When: user searches by name and filters the category', () => {
          fill('[data-testid="store-search"]', created.name);
          cy.get('[data-testid="store-category-filter"]').contains('button', 'Office').click();
        });
        step('Then: only the controlled product remains visible', () => {
          cy.get(`[data-testid="product-add-to-cart-${created.id}"]`).should('be.visible');
          cy.get('[data-testid^="product-add-to-cart-"]').should('have.length', 1);
        });
      });
  });

  it('[UI-STORE-003] Store paginates using the selected page size', () => {
    labels('Store UI', 'UI-STORE-003 - Pagination');
    cy.visit('/store');
    cy.get('[data-testid^="product-add-to-cart-"]').first().should('be.visible');

    step('When: user selects the smallest page size', () => {
      // Aliased after the catalog is on screen and matched on the limit, so the
      // wait resolves the request the selection triggers, not the initial load.
      cy.intercept('GET', '**/api/products?*limit=5*').as('smallPage');
      cy.get('[data-testid="store-items-per-page"]').select('5');
      cy.wait('@smallPage').then(({ request, response }) => {
        expect(new URL(request.url).searchParams.get('limit'), 'requested limit').to.eq('5');
        expect(response?.statusCode, 'page response status').to.eq(200);
        expect(response?.body.data, 'returned rows').to.have.length.of.at.most(5);
      });
    });
    step('Then: the catalog is limited and navigation changes page', () => {
      cy.get('[data-testid^="product-add-to-cart-"]').should('have.length', 5);
      cy.get('[data-testid="store-page-indicator"]').should('contain.text', 'Page 1');
      cy.get('[data-testid="store-next"]').click();
      cy.get('[data-testid="store-page-indicator"]').should('contain.text', 'Page 2');
    });
  });

  it('[UI-PRODUCT-001] A newly created owned product is visible in administration', () => {
    labels('Products UI', 'UI-PRODUCT-001 - Create owned product');

    step('Given: API creates controlled data because the UI has no create control', () => {
      products
        .createProduct({ name: uniqueProductName('ui-create'), ...teachingData.product })
        .then((created) => {
          product = created;
        });
    });
    step('Then: administration displays the product and its persistent ID', () => {
      cy.visit('/products');
      // The page renders its shell before the first product page arrives, so the
      // table is awaited before the client-side search filters it.
      cy.get('[data-testid="products-table"]').should('exist');
      fill('[data-testid="products-search"]', product!.name);
      cy.get(`[data-testid="product-row-${product!.id}"]`).should('contain.text', product!.name);
    });
  });

  it('[UI-PRODUCT-002] An edited owned product is updated in administration', () => {
    labels('Products UI', 'UI-PRODUCT-002 - Edit owned product');

    products
      .createProduct({ name: uniqueProductName('ui-edit'), ...teachingData.product })
      .then((created) => {
        product = created;
        const editedName = `${created.name}-edited`;

        step('When: API updates controlled data because the UI has no edit control', () => {
          products.updateProduct(created.id, { name: editedName }).then((updated) => {
            expect(updated.name, 'updated product name').to.eq(editedName);
          });
        });
        step('Then: administration displays the edited name on the same row', () => {
          cy.visit('/products');
          // The page renders its shell before the first product page arrives, so the
          // table is awaited before the client-side search filters it.
          cy.get('[data-testid="products-table"]').should('exist');
          fill('[data-testid="products-search"]', editedName);
          cy.get(`[data-testid="product-row-${created.id}"]`).should('contain.text', editedName);
        });
      });
  });

  it('[UI-PRODUCT-003] An owned product is deleted from the UI', () => {
    labels('Products UI', 'UI-PRODUCT-003 - Delete owned product');

    products
      .createProduct({ name: uniqueProductName('ui-delete'), ...teachingData.product })
      .then((created) => {
        product = created;
        cy.visit('/products');
        // The page renders its shell before the first product page arrives, so the
        // table is awaited before the client-side search filters it.
        cy.get('[data-testid="products-table"]').should('exist');
        fill('[data-testid="products-search"]', created.name);

        step('When: user deletes the persistent row from administration', () => {
          cy.get(`[data-testid="product-delete-${created.id}"]`).click();
        });
        step('Then: confirmation appears and the row disappears', () => {
          cy.get('[data-testid="products-success-toast"]').should('be.visible');
          cy.get(`[data-testid="product-row-${created.id}"]`).should('not.exist');
          // The UI already removed it, so the hook must not delete it again.
          deletedInTest = true;
        });
      });
  });

  it('[UI-PRODUCT-004] A non-deletable product keeps its row protected', () => {
    labels('Products UI', 'UI-PRODUCT-004 - Protected product');
    cy.visit('/products');
    // The page renders its shell before the first product page arrives, so the
    // table is awaited before the client-side search filters it.
    cy.get('[data-testid="products-table"]').should('exist');
    cy.get('[data-testid="products-type-filter"]').contains('button', 'Template').click();

    step('When: user attempts to delete a protected template product', () => {
      cy.get('[data-testid^="product-row-"]')
        .first()
        .should('be.visible')
        .invoke('attr', 'data-testid')
        .then((testId) => {
          const id = String(testId).replace('product-row-', '');
          cy.get(`[data-testid="product-delete-${id}"]`).click();
          cy.get('[data-testid="products-error-toast"]').should('be.visible');
          cy.get(`[data-testid="product-row-${id}"]`).should('be.visible');
        });
    });
  });
});
