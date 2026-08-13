import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { fill } from '../../helpers/form';
import { expectHidden } from '../../helpers/visibility';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { CheckoutPage } from '../../pages/checkout_page';
import { OrderService, type ControlledOrder } from '../../services/order_service';
import { ProductService, type Product } from '../../services/product_service';

const labels = (feature: string, story: string): void => {
  allure.epic('Chapter 5');
  allure.feature(feature);
  allure.story(story);
};

describe('Chapter 5 extended UI catalog: cart, checkout and orders', () => {
  const products = new ProductService();
  const orders = new OrderService(products);
  const checkout = new CheckoutPage();

  // Cypress aborts the command queue on the first failure, so the mutable data
  // each case creates is undone by the hook rather than at the end of the test.
  let product: Product | undefined;
  let controlled: ControlledOrder | undefined;
  let orderId: number | undefined;

  beforeEach(() => {
    product = undefined;
    controlled = undefined;
    orderId = undefined;
  });

  afterEach(() => {
    if (orderId) products.deleteOrder(orderId);
    products.clearCart();
    if (product) products.deleteProduct(product.id);
    orders.cleanup(controlled);
  });

  /** Leaves exactly one unit of a fresh product in the cart, added from the UI. */
  const addControlledProductToCart = (tag: string): Cypress.Chainable<Product> => {
    products.clearCart();
    return products
      .createProduct({ name: uniqueProductName(tag), ...teachingData.product, stock: 10 })
      .then((created) => {
        product = created;
        cy.intercept('POST', '**/api/cart').as('addToCart');
        cy.visit('/store');
        fill('[data-testid="store-search"]', created.name);
        // The store re-renders the catalog when the search response lands. Waiting
        // for the filtered card means the click hits the mounted button instead
        // of one the re-render is about to replace.
        cy.get('[data-testid^="product-add-to-cart-"]').should('have.length', 1);
        cy.get(`[data-testid="product-add-to-cart-${created.id}"]`).click();
        cy.wait('@addToCart').its('response.statusCode').should('eq', 201);
        return cy.wrap(created, { log: false });
      });
  };

  /**
   * Opens a page that reads the cart and waits for that read to land.
   *
   * Cart and checkout both mount before the cart response arrives: the list is empty and the
   * form is disabled until then, and the re-render that follows detaches whatever Cypress had
   * already queried. Waiting for the response first turns those races into a deterministic
   * "the data is here" point, the same guarantee Playwright's auto-waiting gives the other
   * three frameworks.
   */
  const visitWithCartLoaded = (path: string): void => {
    cy.intercept('GET', '**/api/cart*').as('cartLoad');
    cy.visit(path);
    cy.wait('@cartLoad');
  };

  /** Resolves the persistent cart item id the application rendered for a product. */
  const cartItemId = (productName: string): Cypress.Chainable<string> =>
    cy
      .get('[data-testid^="cart-item-"]')
      .filter((_index, element) => element.textContent?.includes(productName) === true)
      .should('have.length', 1)
      .invoke('attr', 'data-testid')
      .then((testId) => String(testId).replace('cart-item-', ''));

  it('[UI-CART-001] Adding a product updates the cart and badge', () => {
    labels('Cart UI', 'UI-CART-001 - Add product');

    step('Given: a controlled product exists and the cart is empty', () => {
      addControlledProductToCart('ui-cart-add');
    });
    step('Then: the badge and cart show the same unit', () => {
      cy.get('[data-testid="header-cart-count"]').should('have.text', '1');
      visitWithCartLoaded('/cart');
      cartItemId(product!.name).then((id) => {
        cy.get(`[data-testid="cart-quantity-${id}"]`).should('have.text', '1');
      });
    });
  });

  it('[UI-CART-002] Changing quantity recalculates the subtotal', () => {
    labels('Cart UI', 'UI-CART-002 - Change quantity');

    addControlledProductToCart('ui-cart-quantity').then((created) => {
      visitWithCartLoaded('/cart');
      cartItemId(created.name).then((id) => {
        step('When: user increases the persistent item quantity', () => {
          cy.get(`[data-testid="cart-increase-${id}"]`).click();
        });
        step('Then: quantity and subtotal are recalculated', () => {
          cy.get(`[data-testid="cart-quantity-${id}"]`).should('have.text', '2');
          cy.get('[data-testid="cart-subtotal"]').should(
            'contain.text',
            (created.price * 2).toFixed(2),
          );
        });
      });
    });
  });

  it('[UI-CART-003] Removing an item uses a native dialog and deletes the confirmed item', () => {
    labels('Cart UI', 'UI-CART-003 - Native delete dialog');

    addControlledProductToCart('ui-cart-remove').then((created) => {
      visitWithCartLoaded('/cart');
      cartItemId(created.name).then((id) => {
        step('Then: the dialog contains the expected contract and is accepted', () => {
          cy.on('window:confirm', (message) => {
            expect(message, 'native confirm message').to.contain('Remove this item from cart?');
            return true;
          });
          cy.get(`[data-testid="cart-remove-${id}"]`).click();
          cy.get(`[data-testid="cart-item-${id}"]`).should('not.exist');
        });
      });
    });
  });

  it('[UI-CART-004] Clearing the cart confirms and displays the empty state', () => {
    labels('Cart UI', 'UI-CART-004 - Clear cart');

    addControlledProductToCart('ui-cart-clear');
    visitWithCartLoaded('/cart');

    step('When: user confirms the native clear-cart dialog', () => {
      cy.on('window:confirm', (message) => {
        expect(message, 'native confirm message').to.contain('Clear entire cart?');
        return true;
      });
      cy.get('[data-testid="cart-clear"]').click();
    });
    step('Then: the empty state appears and the badge disappears', () => {
      cy.get('[data-testid="cart-empty-state"]').should('be.visible');
      cy.get('[data-testid="header-cart-count"]').should('not.exist');
    });
  });

  it('[UI-CHECKOUT-001] Checkout displays all required validations', () => {
    labels('Checkout UI', 'UI-CHECKOUT-001 - Required validation');

    addControlledProductToCart('ui-checkout-required');
    visitWithCartLoaded('/checkout');

    step('Then: empty fields expose errors and disable submission', () => {
      const fields = ['fullname', 'email', 'address', 'city', 'state', 'zip', 'card', 'expiry', 'cvv'];
      for (const field of fields) {
        cy.get(`[data-testid="checkout-${field}-error"]`).should('be.visible');
      }
      cy.get('[data-testid="checkout-submit"]').should('be.disabled');
    });
  });

  it('[UI-CHECKOUT-002] Checkout rejects boundary and invalid values', () => {
    labels('Checkout UI', 'UI-CHECKOUT-002 - Boundaries and negatives');

    addControlledProductToCart('ui-checkout-boundary');
    visitWithCartLoaded('/checkout');

    step('When: user enters invalid characters, formats and boundaries', () => {
      fill('[data-testid="checkout-fullname"]', 'Invalid@Name');
      fill('[data-testid="checkout-email"]', 'not-an-email');
      fill('[data-testid="checkout-zip"]', '-1');
      fill('[data-testid="checkout-card-number"]', '123');
      fill('[data-testid="checkout-expiry"]', '1399');
      fill('[data-testid="checkout-cvv"]', '1');
    });
    step('Then: each boundary produces a specific error', () => {
      cy.get('[data-testid="checkout-fullname-error"]').should('contain.text', 'only');
      cy.get('[data-testid="checkout-email-error"]').should('contain.text', 'invalid');
      // The field rejects the sign instead of reporting an error for it.
      cy.get('[data-testid="checkout-zip"]').should('have.value', '1');
      cy.get('[data-testid="checkout-zip-error"]').should('not.exist');
      cy.get('[data-testid="checkout-card-error"]').should('contain.text', '15-16');
      cy.get('[data-testid="checkout-expiry-error"]').should('contain.text', 'month');
      cy.get('[data-testid="checkout-cvv-error"]').should('contain.text', '3-4');
    });
  });

  it('[UI-CHECKOUT-003] Checkout creates an order and opens its details', () => {
    labels('Checkout UI', 'UI-CHECKOUT-003 - Create order');

    addControlledProductToCart('ui-checkout-order').then((created) => {
      visitWithCartLoaded('/checkout');
      step('When: testing details are completed and the order is submitted', () => {
        checkout.placeOrder().then((id) => {
          orderId = id;
        });
      });
      step('Then: detail displays the persisted ID, total and item', () => {
        cy.get('[data-testid="order-detail-id"]').should('contain.text', String(orderId));
        cy.get('[data-testid="order-detail-items"]').should('contain.text', created.name);
        cy.get('[data-testid="order-detail-total"]').should('be.visible');
      });
    });
  });

  it('[UI-CHECKOUT-004] Tax modal remains inside the responsive viewport', () => {
    labels('Checkout UI', 'UI-CHECKOUT-004 - Responsive modal');

    addControlledProductToCart('ui-checkout-modal');
    cy.viewport(390, 844);
    visitWithCartLoaded('/checkout');
    cy.get('[data-testid="checkout-more-about-shipping-taxes"]').click();

    step('Then: the modal fits inside the mobile viewport and closes', () => {
      cy.get('[data-testid="tax-shipping-dialog"]')
        .should('be.visible')
        .then(($modal) => {
          const box = $modal[0].getBoundingClientRect();
          expect(box.left, 'modal left edge').to.be.at.least(0);
          expect(box.right, 'modal right edge').to.be.at.most(390);
          expect(box.height, 'modal height').to.be.at.most(844);
        });
      cy.get('[data-testid="tax-shipping-close"]').click();
      expectHidden('[data-testid="tax-shipping-dialog"]', 'tax and shipping dialog');
    });
  });

  /**
   * Opens the order history and waits for its first page to land.
   *
   * The page mounts the filter form before the orders arrive and keeps the whole
   * fieldset disabled while the request is in flight. `cy.get` only retries until
   * the field exists, so typing right after `cy.visit` races the load and fails
   * with "cy.type() failed because it targeted a disabled element". Waiting for
   * the list response, and then for the form to accept input, removes the race.
   */
  const visitOrderHistory = (): void => {
    cy.intercept('GET', '**/api/orders?*').as('ordersPage');
    cy.visit('/orders');
    cy.wait('@ordersPage');
    cy.get('[data-testid="orders-search"]').should(($field) => {
      expect(
        $field.closest('fieldset[disabled]').length === 0 && !$field.is(':disabled'),
        'order history filters accept input',
      ).to.eq(true);
    });
  };

  it('[UI-ORDER-001] Opening details shows content and full-page navigation', () => {
    labels('Orders UI', 'UI-ORDER-001 - Open detail');

    orders.createControlledOrder('ui-order-detail').then((created) => {
      controlled = created;
      visitOrderHistory();
      fill('[data-testid="orders-search"]', String(created.order.id));
      cy.get(`[data-testid="order-view-${created.order.id}"]`).click();

      step('Then: the modal matches the order and opens the full page', () => {
        cy.get('[data-testid="order-modal"]')
          .should('be.visible')
          .and('contain.text', String(created.order.id));
        cy.get('[data-testid="order-modal-open-page"]').click();
        cy.location('pathname').should('eq', `/orders/${created.order.id}`);
        cy.get('[data-testid="order-detail-id"]').should('contain.text', String(created.order.id));
      });
    });
  });

  it('[UI-ORDER-002] History searches and filters a controlled order', () => {
    labels('Orders UI', 'UI-ORDER-002 - Search and filter');

    orders.createControlledOrder('ui-order-filter', 'paid').then((created) => {
      controlled = created;
      visitOrderHistory();

      step('When: user searches the ID and filters by status', () => {
        fill('[data-testid="orders-search"]', String(created.order.id));
        cy.get('[data-testid="orders-status-filter"]').select(created.order.payment_status);
      });
      step('Then: only the controlled order is displayed', () => {
        cy.get(`[data-testid="order-row-id-${created.order.id}"]`).should('be.visible');
        cy.get('[data-testid^="order-row-id-"]').should('have.length', 1);
      });
    });
  });

  it('[UI-ORDER-003] History paginates consistently', () => {
    labels('Orders UI', 'UI-ORDER-003 - Paginate history');

    // Pagination is a presentation contract. Eleven real paid orders would take
    // minutes to create and delete, so the transport is stubbed and the
    // assertions stay on what the page does with the pages it receives.
    const stubbedOrders = Array.from({ length: 11 }, (_unused, index) => ({
      id: 910_000 + index,
      total: 20 + index,
      status: 'completed',
      payment_status: 'paid',
      payment_brand: 'Visa',
      payment_last4: '4242',
      created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      order_items: [],
      order_shipping: null,
    }));

    cy.intercept('GET', '**/api/orders?*', (request) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? 1);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      const start = (page - 1) * limit;
      request.reply({
        statusCode: 200,
        body: {
          success: true,
          data: stubbedOrders.slice(start, start + limit),
          pagination: {
            page,
            limit,
            total: stubbedOrders.length,
            total_pages: Math.ceil(stubbedOrders.length / limit),
          },
        },
      });
    }).as('ordersPage');

    cy.visit('/orders');
    cy.get('[data-testid="orders-items-per-page"]').select('10');

    step('Then: the first page honors the limit', () => {
      cy.get('[data-testid^="order-row-id-"]').should('have.length', 10);
      cy.get('[data-testid="orders-page-indicator"]').should('contain.text', 'Page 1');
    });
    step('When: user advances and returns, the indicator tracks the page', () => {
      cy.get('[data-testid="orders-next"]').click();
      cy.get('[data-testid="orders-page-indicator"]').should('contain.text', 'Page 2');
      cy.get('[data-testid^="order-row-id-"]').should('have.length', 1);
      cy.get('[data-testid="orders-prev"]').click();
      cy.get('[data-testid="orders-page-indicator"]').should('contain.text', 'Page 1');
      cy.get('[data-testid^="order-row-id-"]').should('have.length', 10);
    });
  });
});
