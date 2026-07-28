import * as allure from 'allure-js-commons';
import { guardedApi } from '../../helpers/api_response';
import { step } from '../../helpers/steps';
import { OrderService, type ControlledOrder } from '../../services/order_service';
import { ProductService, authHeaders } from '../../services/product_service';

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('Orders API');
  allure.story(story);
};

describe('Chapter 5 extended API catalog: orders', () => {
  const products = new ProductService();
  const orders = new OrderService(products);

  // Cypress aborts the command queue on the first failure, so every controlled
  // order is registered here and removed by the hook.
  let controlled: ControlledOrder[] = [];
  let orderAlreadyDeleted = false;

  beforeEach(() => {
    controlled = [];
    orderAlreadyDeleted = false;
  });

  afterEach(() => {
    for (const item of controlled) orders.cleanup(item, orderAlreadyDeleted);
  });

  const createControlledOrder = (tag: string, paymentStatus = 'paid') =>
    orders.createControlledOrder(tag, paymentStatus).then((created) => {
      controlled.push(created);
      return cy.wrap(created, { log: false });
    });

  it('[API-ORDER-001] Create and read order preserves items shipping payment and totals', () => {
    labels('API-ORDER-001 - Create and query order');

    step('Setup: create product cart and paid order', () => {
      createControlledOrder('order-create').then((created) => {
        step('When: client reads the created order', () => {
          orders.get(created.order.id).then((order) => {
            step('Then: order exposes reconciled domain details', () => {
              expect(order.id, 'order id').to.eq(created.order.id);
              expect(order.status, 'order status').to.eq('completed');
              expect(order.payment_status, 'payment status').to.eq('paid');
              expect(Number(order.total), 'reconciled total').to.be.closeTo(
                Number(order.subtotal) + Number(order.tax) + Number(order.shipping),
                0.01,
              );
              expect(order.order_items, 'order items').to.have.length(1);
              expect(order.order_shipping, 'order shipping').to.exist;
            });
          });
        });
      });
    });
  });

  it('[API-ORDER-002] Order status accepts idempotency and rejects invalid transition', () => {
    labels('API-ORDER-002 - Change status');

    createControlledOrder('order-status').then((created) => {
      step('When: client repeats the completed status', () => {
        guardedApi({
          method: 'PATCH',
          url: `/api/orders/${created.order.id}/status`,
          headers: authHeaders(),
          body: { status: 'completed' },
        }).then((same) => {
          expect(same.status, 'repeated status response').to.eq(200);
        });
      });
      step('When: client attempts completed to pending', () => {
        guardedApi<any>({
          method: 'PATCH',
          url: `/api/orders/${created.order.id}/status`,
          headers: authHeaders(),
          body: { status: 'pending' },
        }).then((invalid) => {
          step('Then: invalid transition is rejected and status persists', () => {
            expect(invalid.status, 'invalid transition status').to.eq(400);
            expect(invalid.body.current_status, 'reported current status').to.eq('completed');
            orders.get(created.order.id).then((order) => {
              expect(order.status, 'persisted status').to.eq('completed');
            });
          });
        });
      });
    });
  });

  it('[API-ORDER-003] Payment status update persists on subsequent read', () => {
    labels('API-ORDER-003 - Change payment');

    createControlledOrder('order-payment').then((created) => {
      step('When: client changes payment to pending', () => {
        guardedApi<any>({
          method: 'PATCH',
          url: `/api/orders/${created.order.id}`,
          headers: authHeaders(),
          body: { payment_status: 'pending' },
        }).then((response) => {
          expect(response.status, 'update status').to.eq(200);
          expect(response.body.data.payment_status, 'updated payment status').to.eq('pending');
        });
      });
      step('Then: a subsequent read returns the persisted payment status', () => {
        orders.get(created.order.id).then((order) => {
          expect(order.payment_status, 'persisted payment status').to.eq('pending');
        });
      });
    });
  });

  it('[API-ORDER-004] Cancelling a completed order is safely rejected without changing stock', () => {
    labels('API-ORDER-004 - Cancel and restore stock');

    createControlledOrder('order-cancel').then((created) => {
      products.getProduct(created.product.id).then((afterPurchase) => {
        expect(afterPurchase.stock, 'stock after purchase').to.eq(created.product.stock - 1);

        for (const attempt of ['first', 'repeated']) {
          step(`When: client attempts the ${attempt} cancellation of a completed paid order`, () => {
            guardedApi({
              method: 'POST',
              url: `/api/orders/${created.order.id}/cancel`,
              headers: authHeaders(),
            }).then((response) => {
              expect(response.status, `${attempt} cancellation status`).to.eq(400);
            });
            products.getProduct(created.product.id).then((current) => {
              expect(current.stock, `stock after ${attempt} cancellation`).to.eq(
                afterPurchase.stock,
              );
            });
          });
        }
      });
    });
  });

  it('[API-ORDER-005] Deleting an order restores stock and removes the resource', () => {
    labels('API-ORDER-005 - Delete and cleanup');

    createControlledOrder('order-delete').then((created) => {
      step('When: client deletes the order', () => {
        guardedApi({
          method: 'DELETE',
          url: `/api/orders/${created.order.id}`,
          headers: authHeaders(),
        }).then((response) => {
          expect(response.status, 'delete status').to.eq(200);
          orderAlreadyDeleted = true;
        });
      });
      step('Then: stock is restored and the order is no longer readable', () => {
        products.getProduct(created.product.id).then((product) => {
          expect(product.stock, 'restored stock').to.eq(created.product.stock);
        });
        guardedApi({ url: `/api/orders/${created.order.id}`, headers: authHeaders() }).then(
          (missing) => {
            expect(missing.status, 'read after delete').to.eq(404);
          },
        );
      });
    });
  });

  it('[API-ORDER-006] Order search returns filtered summary counts and total amount', () => {
    labels('API-ORDER-006 - Search with summary');

    createControlledOrder('order-summary').then((created) => {
      step('When: client searches by controlled customer email', () => {
        guardedApi<any>({
          url: '/api/orders/search?search=framework.&page=1&limit=10',
          headers: authHeaders(),
        }).then((response) => {
          step('Then: the controlled order and its aggregates are returned', () => {
            expect(response.status, 'search status').to.eq(200);
            expect(
              response.body.data.some((order: { id: number }) => order.id === created.order.id),
              'controlled order is present',
            ).to.eq(true);
            expect(response.body.summary.total_orders, 'total orders').to.be.at.least(1);
            expect(Number(response.body.summary.total_amount), 'total amount').to.be.greaterThan(0);
            expect(
              Number(response.body.summary.average_order_value),
              'average order value',
            ).to.be.greaterThan(0);
          });
        });
      });
    });
  });

  it('[API-ORDER-007] Relational search is applied before pagination totals', () => {
    labels('API-ORDER-007 - Relational filters before pagination');

    createControlledOrder('relation-alpha').then((alpha) => {
      createControlledOrder('relation-beta');

      step('When: client filters a product before a one-row page', () => {
        guardedApi<any>({
          url: `/api/orders/search?product_id=${alpha.product.id}&page=1&limit=1`,
          headers: authHeaders(),
        }).then((response) => {
          step('Then: the relation narrows the total, not only the page', () => {
            expect(response.status, 'search status').to.eq(200);
            expect(response.body.data, 'returned rows').to.have.length(1);
            expect(response.body.pagination.total, 'filtered total').to.eq(1);
            expect(response.body.data[0].id, 'returned order').to.eq(alpha.order.id);
          });
        });
      });
    });
  });

  it('[API-ORDER-008] Order resources do not disclose foreign or invalid IDs', () => {
    labels('API-ORDER-008 - Isolation by user');

    step('When: client requests an ID outside its resource set', () => {
      guardedApi<any>({ url: '/api/orders/2147483647', headers: authHeaders() }).then(
        (response) => {
          step('Then: API returns not found without resource details', () => {
            expect(response.status, 'read status').to.eq(404);
            expect(response.body.success, 'success flag').to.eq(false);
            expect(response.body.data, 'leaked payload').to.be.undefined;
          });
        },
      );
    });
  });
});
