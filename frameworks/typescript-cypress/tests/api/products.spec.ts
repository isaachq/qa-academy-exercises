import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { guardedApi } from '../../helpers/api_response';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService, authHeaders, type Product } from '../../services/product_service';

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('Products API');
  allure.story(story);
};

describe('Chapter 5 extended API catalog: products', () => {
  const products = new ProductService();
  let product: Product | undefined;

  beforeEach(() => {
    product = undefined;
  });

  afterEach(() => {
    if (product) products.deleteProduct(product.id);
  });

  it('[API-PRODUCT-001] Product listing honors pagination metadata and limit', () => {
    labels('API-PRODUCT-001 - List and paginate products');

    step('When: client requests the first two products', () => {
      guardedApi<any>({ url: '/api/products?page=1&limit=2', headers: authHeaders() }).then(
        (response) => {
          step('Then: data and pagination describe the requested page', () => {
            expect(response.status, 'list status').to.eq(200);
            expect(response.body.data, 'returned rows').to.have.length.of.at.most(2);
            expect(response.body.pagination, 'pagination metadata').to.include({ page: 1, limit: 2 });
            expect(response.body.pagination.total, 'total').to.be.a('number');
            expect(response.body.pagination.total_pages, 'total pages').to.be.a('number');
            expect(response.body.pagination.total, 'total covers the page').to.be.at.least(
              response.body.data.length,
            );
          });
        },
      );
    });
  });

  it('[API-PRODUCT-003] Product creation rejects required-field and numeric boundaries', () => {
    labels('API-PRODUCT-003 - Validation and limits');

    const invalidBodies = [
      { name: '', price: 10, stock: 1 },
      { name: 'Negative price', price: -0.01, stock: 1 },
      { name: 'Negative stock', price: 1, stock: -1 },
      { name: 'Fractional stock', price: 1, stock: 1.5 },
    ];
    for (const body of invalidBodies) {
      step('When: client submits one invalid product boundary', () => {
        guardedApi<any>({
          method: 'POST',
          url: '/api/products',
          headers: authHeaders(),
          body,
        }).then((response) => {
          step('Then: product validation rejects the request without creating data', () => {
            expect(response.status, `status for ${JSON.stringify(body)}`).to.eq(400);
            expect(response.body.success, 'success flag').to.eq(false);
          });
        });
      });
    }
  });

  it('[API-PRODUCT-004] Template product permissions allow reads and prevent deletion', () => {
    labels('API-PRODUCT-004 - Permissions');

    step('Given: client finds a non-deletable template product', () => {
      guardedApi<{ data: Product[] }>({
        url: '/api/products?permission=N_DELETE&limit=1',
        headers: authHeaders(),
      }).then((list) => {
        const template = list.body.data[0];
        expect(template, 'the account must have a provisioned N_DELETE product').to.exist;

        step('When: client reads the template product', () => {
          guardedApi({ url: `/api/products/${template.id}`, headers: authHeaders() }).then(
            (read) => {
              expect(read.status, 'read status').to.eq(200);
            },
          );
        });
        step('When: client attempts to delete the template product', () => {
          guardedApi<any>({
            method: 'DELETE',
            url: `/api/products/${template.id}`,
            headers: authHeaders(),
          }).then((deletion) => {
            step('Then: deletion is forbidden and reports the failure', () => {
              expect(deletion.status, 'delete status').to.eq(403);
              expect(deletion.body.success, 'success flag').to.eq(false);
            });
          });
        });
      });
    });
  });

  it('[API-PRODUCT-005] Categories and stock aggregates are consistent for an owned product', () => {
    labels('API-PRODUCT-005 - Categories and stock');

    step('Setup: create a controlled product', () => {
      products
        .createProduct({ name: uniqueProductName('product-stock'), ...teachingData.product })
        .then((created) => {
          product = created;
        });
    });
    step('When: client requests category aggregates and product availability', () => {
      guardedApi<any>({ url: '/api/products/categories', headers: authHeaders() }).then(
        (categories) => {
          guardedApi<any>({
            url: `/api/products/${product!.id}/stock`,
            headers: authHeaders(),
          }).then((stock) => {
            step('Then: category and stock data match the controlled product', () => {
              expect(categories.status, 'categories status').to.eq(200);
              expect(JSON.stringify(categories.body), 'categories payload').to.contain(
                product!.category,
              );
              expect(stock.status, 'stock status').to.eq(200);
              expect(stock.body.stock, 'reported stock').to.eq(product!.stock);
              expect(stock.body.available, 'availability flag').to.eq(product!.stock > 0);
              expect(stock.body.stock_status, 'stock status value').to.match(
                /in_stock|low_stock|out_of_stock/,
              );
            });
          });
        },
      );
    });
  });
});
