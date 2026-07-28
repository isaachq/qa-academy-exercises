import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { guardedApi } from '../../helpers/api_response';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService, authHeaders, type Product } from '../../services/product_service';

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('Cart API');
  allure.story(story);
};

describe('Chapter 5 extended API catalog: cart', () => {
  const products = new ProductService();
  let created: Product[] = [];

  beforeEach(() => {
    created = [];
    products.clearCart();
  });

  afterEach(() => {
    products.clearCart();
    for (const product of created) products.deleteProduct(product.id);
  });

  const controlledProduct = (
    tag: string,
    overrides: Partial<Product> = {},
  ): Cypress.Chainable<Product> =>
    products
      .createProduct({ name: uniqueProductName(tag), ...teachingData.product, ...overrides })
      .then((product) => {
        created.push(product);
        return cy.wrap(product, { log: false });
      });

  it('[API-CART-001] Adding the same product merges quantity without duplicate items', () => {
    labels('API-CART-001 - Add and merge item');

    step('Setup: create a controlled in-stock product', () => {
      controlledProduct('cart-merge').then((product) => {
        for (const attempt of [1, 2]) {
          step('When: client adds one unit to the cart', () => {
            guardedApi({
              method: 'POST',
              url: '/api/cart',
              headers: authHeaders(),
              body: { product_id: product.id, quantity: 1 },
            }).then((response) => {
              expect(response.status, `add attempt ${attempt} status`).to.eq(201);
            });
          });
        }
        step('Then: client reads the merged cart', () => {
          guardedApi<any>({ url: '/api/cart', headers: authHeaders() }).then((cart) => {
            const payload = cart.body.data;
            expect(payload.items, 'cart items').to.have.length(1);
            expect(payload.items[0], 'merged item').to.include({
              product_id: product.id,
              quantity: 2,
            });
            expect(payload.summary.item_count, 'item count').to.eq(2);
          });
        });
      });
    });
  });

  it('[API-CART-002] Updating quantity persists and quantity zero removes the item', () => {
    labels('API-CART-002 - Update and remove item');

    controlledProduct('cart-update').then((product) => {
      step('Given: one controlled cart item', () => {
        guardedApi<any>({
          method: 'POST',
          url: '/api/cart',
          headers: authHeaders(),
          body: { product_id: product.id, quantity: 1 },
        }).then((added) => {
          const itemId = added.body.data.id as number;

          step('When: client changes item quantity', () => {
            guardedApi<any>({
              method: 'PATCH',
              url: `/api/cart/${itemId}`,
              headers: authHeaders(),
              body: { quantity: 3 },
            }).then((updated) => {
              expect(updated.status, 'update status').to.eq(200);
              expect(updated.body.data.quantity, 'updated quantity').to.eq(3);
            });
          });
          step('When: client changes quantity to zero', () => {
            guardedApi({
              method: 'PATCH',
              url: `/api/cart/${itemId}`,
              headers: authHeaders(),
              body: { quantity: 0 },
            }).then((removed) => {
              expect(removed.status, 'removal status').to.eq(200);
            });
          });
          step('Then: the cart no longer contains the item', () => {
            guardedApi<any>({ url: '/api/cart', headers: authHeaders() }).then((cart) => {
              expect(cart.body.data.items, 'cart items').to.have.length(0);
            });
          });
        });
      });
    });
  });

  it('[API-CART-003] Bulk update reports mixed updates deletes statistics and summary', () => {
    labels('API-CART-003 - Bulk update');

    const itemIds: number[] = [];
    for (const suffix of ['update', 'delete']) {
      controlledProduct(`cart-bulk-${suffix}`).then((product) => {
        guardedApi<any>({
          method: 'POST',
          url: '/api/cart',
          headers: authHeaders(),
          body: { product_id: product.id, quantity: 1 },
        }).then((response) => {
          itemIds.push(response.body.data.id);
        });
      });
    }

    step('When: client bulk-updates one item and deletes another', () => {
      guardedApi<any>({
        method: 'PATCH',
        url: '/api/cart/bulk',
        headers: authHeaders(),
        body: {
          updates: [
            { cart_item_id: itemIds[0], quantity: 2 },
            { cart_item_id: itemIds[1], quantity: 0 },
          ],
        },
      }).then((response) => {
        step('Then: bulk response contains results statistics and refreshed summary', () => {
          expect(response.status, 'bulk status').to.eq(200);
          const payload = response.body.data ?? response.body;
          expect(payload.results, 'bulk results').to.have.length(2);
          expect(payload.statistics ?? payload.stats, 'bulk statistics').to.exist;
          expect(payload.cart_summary, 'refreshed summary').to.exist;
        });
      });
    });
  });

  it('[API-CART-004] Cart summary calculates subtotal tax shipping discount and readiness', () => {
    labels('API-CART-004 - Summary');

    controlledProduct('cart-summary').then((product) => {
      guardedApi({
        method: 'POST',
        url: '/api/cart',
        headers: authHeaders(),
        body: { product_id: product.id, quantity: 2 },
      });

      step('When: client requests a parameterized cart summary', () => {
        guardedApi<any>({
          url: '/api/cart/summary?tax_rate=0.1&shipping_cost=5&discount=2',
          headers: authHeaders(),
        }).then((response) => {
          step('Then: monetary fields reconcile and cart is checkout-ready', () => {
            expect(response.status, 'summary status').to.eq(200);
            const value = response.body.summary;
            expect(Number(value.subtotal), 'subtotal').to.be.closeTo(Number(product.price) * 2, 0.01);
            expect(Number(value.total), 'total').to.be.closeTo(
              Number(value.subtotal) -
                Number(value.discount) +
                Number(value.tax) +
                Number(value.shipping_cost),
              0.01,
            );
            expect(response.body.can_checkout, 'checkout readiness').to.eq(true);
          });
        });
      });
    });
  });

  it('[API-CART-005] Insufficient stock is rejected without corrupting the cart', () => {
    labels('API-CART-005 - Insufficient stock');

    controlledProduct('cart-stock', { stock: 1 }).then((product) => {
      step('When: client requests more units than stock', () => {
        guardedApi({
          method: 'POST',
          url: '/api/cart',
          headers: authHeaders(),
          body: { product_id: product.id, quantity: 2 },
        }).then((response) => {
          expect(response.status, 'add status').to.eq(400);
        });
      });
      step('Then: the cart remains empty', () => {
        guardedApi<any>({ url: '/api/cart', headers: authHeaders() }).then((cart) => {
          expect(cart.body.data.items, 'cart items').to.have.length(0);
        });
      });
    });
  });

  it('[API-CART-006] Clearing an already empty cart is idempotent', () => {
    labels('API-CART-006 - Clear cart');

    for (const attempt of [1, 2]) {
      step('When: client clears the cart', () => {
        guardedApi({ method: 'DELETE', url: '/api/cart', headers: authHeaders() }).then(
          (response) => {
            expect(response.status, `clear attempt ${attempt} status`).to.eq(200);
          },
        );
      });
    }
    step('Then: the cart is empty', () => {
      guardedApi<any>({ url: '/api/cart', headers: authHeaders() }).then((cart) => {
        expect(cart.body.data.items, 'cart items').to.have.length(0);
      });
    });
  });
});
