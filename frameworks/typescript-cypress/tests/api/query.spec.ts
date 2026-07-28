import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { guardedApi } from '../../helpers/api_response';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { OrderService, type ControlledOrder } from '../../services/order_service';
import { ProductService, authHeaders, type Product } from '../../services/product_service';

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('HTTP QUERY API');
  allure.story(story);
};

const productDocument = (search = '') => ({
  filters: { search },
  sort: { field: 'price', direction: 'asc' },
  fields: ['id', 'name', 'price', 'stock'],
  pagination: { page: 1, limit: 2 },
});

const orderDocument = (productIds: number[] = []) => ({
  filters: { product_ids: productIds },
  sort: { field: 'total', direction: 'asc' },
  pagination: { page: 1, limit: 1 },
});

describe('Chapter 5 extended API catalog: HTTP QUERY', () => {
  const products = new ProductService();
  const orders = new OrderService(products);

  let product: Product | undefined;
  let controlled: ControlledOrder | undefined;

  beforeEach(() => {
    product = undefined;
    controlled = undefined;
  });

  afterEach(() => {
    if (product) products.deleteProduct(product.id);
    orders.cleanup(controlled);
  });

  it('[API-QUERY-001] Native QUERY products applies fields filters sort and pagination', () => {
    labels('API-QUERY-001 - Native products QUERY');

    products
      .createProduct({ name: uniqueProductName('native-query'), ...teachingData.product })
      .then((created) => {
        product = created;
        step('When: client sends a native QUERY document', () => {
          guardedApi<any>({
            method: 'QUERY',
            url: '/api/products/query',
            headers: authHeaders(),
            body: productDocument(created.name),
          }).then((response) => {
            step('Then: response reflects native transport and controlled filter', () => {
              expect(response.status, 'query status').to.eq(200);
              expect(response.body.meta.transport, 'transport').to.eq('QUERY');
              expect(response.body.data, 'returned rows').to.have.length(1);
              expect(response.body.data[0].id, 'returned product').to.eq(created.id);
              expect(response.body.data[0].category, 'unselected field').to.be.undefined;
              expect(response.body.pagination, 'pagination').to.include({
                page: 1,
                limit: 2,
                total: 1,
              });
            });
          });
        });
      });
  });

  it('[API-QUERY-002] POST override reports POST_OVERRIDE transport', () => {
    labels('API-QUERY-002 - POST override');

    step('When: client tunnels QUERY through POST override', () => {
      guardedApi<any>({
        method: 'POST',
        url: '/api/products/query',
        headers: { ...authHeaders(), 'X-HTTP-Method-Override': 'QUERY' },
        body: productDocument(),
      }).then((response) => {
        expect(response.status, 'query status').to.eq(200);
        expect(response.body.meta.transport, 'transport').to.eq('POST_OVERRIDE');
      });
    });
  });

  it('[API-QUERY-003] Plain POST query reports POST transport', () => {
    labels('API-QUERY-003 - Plain POST');

    step('When: client posts a query document without override', () => {
      guardedApi<any>({
        method: 'POST',
        url: '/api/products/query',
        headers: authHeaders(),
        body: productDocument(),
      }).then((response) => {
        expect(response.status, 'query status').to.eq(200);
        expect(response.body.meta.transport, 'transport').to.eq('POST');
      });
    });
  });

  it('[API-QUERY-004] GET query is rejected with the documented Allow header', () => {
    labels('API-QUERY-004 - GET rejected');

    step('When: client sends unsupported GET transport', () => {
      guardedApi<any>({ url: '/api/products/query', headers: authHeaders() }).then((response) => {
        expect(response.status, 'query status').to.eq(405);
        expect(response.headers.allow, 'Allow header').to.eq('QUERY, POST, OPTIONS');
        expect(response.body.success, 'success flag').to.eq(false);
      });
    });
  });

  it('[API-QUERY-005] Native QUERY orders sorts persisted total and reports pagination separately', () => {
    labels('API-QUERY-005 - Orders QUERY');

    step('Given: client creates the order that will be queried', () => {
      orders.createControlledOrder('native-order-query').then((created) => {
        controlled = created;

        step('When: client sends native orders QUERY sorted by total', () => {
          guardedApi<any>({
            method: 'QUERY',
            url: '/api/orders/query',
            headers: authHeaders(),
            body: orderDocument([created.product.id]),
          }).then((response) => {
            step('Then: transport, rows, totals and sort metadata are consistent', () => {
              expect(response.status, 'query status').to.eq(200);
              expect(response.body.meta.transport, 'transport').to.eq('QUERY');
              expect(response.body.data, 'returned rows').to.have.length(1);
              expect(response.body.data[0].id, 'returned order').to.eq(created.order.id);
              expect(Number(response.body.data[0].total), 'persisted total').to.be.closeTo(
                Number(created.order.total),
                0.01,
              );
              expect(response.body.pagination, 'pagination').to.include({
                page: 1,
                limit: 1,
                total: 1,
              });
              expect(response.body.meta.sorted_by, 'sort metadata').to.eq('total asc');
            });
          });
        });
      });
    });
  });

  it('[API-QUERY-006] Order relations are filtered before total and pagination', () => {
    labels('API-QUERY-006 - Relation before pagination');

    step('Given: client creates an isolated order and product relation', () => {
      orders.createControlledOrder('query-relation').then((created) => {
        controlled = created;

        step('When: client filters the controlled relation with a one-row page', () => {
          guardedApi<any>({
            method: 'POST',
            url: '/api/orders/query',
            headers: authHeaders(),
            body: orderDocument([created.product.id]),
          }).then((response) => {
            expect(response.status, 'query status').to.eq(200);
            expect(response.body.data, 'returned rows').to.have.length(1);
            expect(response.body.data[0].id, 'returned order').to.eq(created.order.id);
            expect(response.body.pagination.total, 'filtered total').to.eq(1);
            expect(response.body.pagination.limit, 'requested limit').to.eq(1);
          });
        });
      });
    });
  });

  it('[API-QUERY-007] QUERY rejects invalid ranges fields sort dates IDs and limits', () => {
    labels('API-QUERY-007 - Validation');

    const invalidDocuments = [
      { filters: { price: { min: 10, max: 1 } } },
      { sort: { field: 'not_a_field', direction: 'asc' } },
      { fields: ['password'] },
      { pagination: { page: 0, limit: 10 } },
      { pagination: { page: 1, limit: 101 } },
    ];
    for (const document of invalidDocuments) {
      step('When: client submits one invalid QUERY document', () => {
        guardedApi<any>({
          method: 'POST',
          url: '/api/products/query',
          headers: authHeaders(),
          body: document,
        }).then((response) => {
          expect(response.status, `status for ${JSON.stringify(document)}`).to.eq(400);
          expect(response.body.success, 'success flag').to.eq(false);
        });
      });
    }
  });
});
