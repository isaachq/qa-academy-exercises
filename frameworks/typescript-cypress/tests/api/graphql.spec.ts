import * as allure from 'allure-js-commons';
import { environment } from '../../config/environment';
import { teachingData } from '../../data/test_data';
import { guardedApi, type ApiResponse } from '../../helpers/api_response';
import { step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService, authHeaders } from '../../services/product_service';

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
};

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('GraphQL API');
  allure.story(story);
};

/**
 * GraphQL answers 200 for schema and validation errors too, so the transport
 * status is asserted here once and each test states its own document contract.
 */
const graphql = <T>(
  query: string,
  variables: Record<string, unknown> = {},
  operationName?: string,
): Cypress.Chainable<GraphQLResponse<T>> =>
  guardedApi<GraphQLResponse<T>>({
    method: 'POST',
    url: '/api/graphql',
    headers: authHeaders(),
    body: { query, variables, operationName },
  }).then((response: ApiResponse<GraphQLResponse<T>>) => {
    expect(response.status, 'GraphQL transport status').to.eq(200);
    return response.body;
  });

describe('Chapter 5 extended API catalog: GraphQL', () => {
  const products = new ProductService();

  it('[API-GQL-001] Authenticated query returns the current user', () => {
    labels('API-GQL-001 - Authenticated query');

    step('When: client executes the named CurrentUser query', () => {
      graphql<{ me: { id: string; email: string } }>(
        'query CurrentUser { me { id email } }',
        {},
        'CurrentUser',
      ).then((payload) => {
        step('Then: GraphQL returns the authenticated profile without errors', () => {
          expect(payload.errors, 'GraphQL errors').to.be.undefined;
          expect(payload.data?.me.id, 'user id').to.be.a('string').and.not.be.empty;
          expect(payload.data?.me.email, 'user email').to.eq(environment.uiEmail());
        });
      });
    });
  });

  it('[API-GQL-002] GraphQL validation errors use HTTP 200 and errors array', () => {
    labels('API-GQL-002 - Error model');

    step('When: client requests a field absent from the schema', () => {
      guardedApi<GraphQLResponse<unknown>>({
        method: 'POST',
        url: '/api/graphql',
        headers: authHeaders(),
        body: { query: 'query InvalidField { me { field_that_does_not_exist } }' },
      }).then((response) => {
        step('Then: transport succeeds and the GraphQL error is explicit', () => {
          expect(response.status, 'GraphQL transport status').to.eq(200);
          expect(response.body.data, 'data payload').to.be.undefined;
          expect(response.body.errors?.[0].message, 'error message').to.contain(
            'field_that_does_not_exist',
          );
        });
      });
    });
  });

  it('[API-GQL-003] Products query honors variables and pagination metadata', () => {
    labels('API-GQL-003 - Paginated products');

    step('When: client queries a two-row product page with variables', () => {
      graphql<{
        products: {
          products: Array<{ id: string; name: string; price: number; stock: number }>;
          pagination: { page: number; limit: number; total: number; total_pages: number };
        };
      }>(
        `query ProductInventory($page: Int!, $limit: Int!) {
          products(page: $page, limit: $limit) {
            products { id name price stock }
            pagination { page limit total total_pages }
          }
        }`,
        { page: 1, limit: 2 },
        'ProductInventory',
      ).then((payload) => {
        expect(payload.errors, 'GraphQL errors').to.be.undefined;
        expect(payload.data?.products.products, 'returned rows').to.have.length.of.at.most(2);
        expect(payload.data?.products.pagination, 'pagination').to.include({ page: 1, limit: 2 });
      });
    });
  });

  it('[API-GQL-004] Product mutation creates updates and deletes controlled data', () => {
    labels('API-GQL-004 - Product mutation with cleanup');

    let productId: string | undefined;
    step('Given: client creates a uniquely named GraphQL product', () => {
      graphql<{ createProduct: { id: string; name: string; permissions: string } }>(
        `mutation CreateProduct($name: String!) {
          createProduct(name: $name, description: "GraphQL traceability", price: 19.95, stock: 7, category: "Office") {
            id name permissions
          }
        }`,
        { name: uniqueProductName('graphql') },
        'CreateProduct',
      ).then((created) => {
        expect(created.errors, 'GraphQL errors').to.be.undefined;
        productId = created.data!.createProduct.id;
        expect(created.data!.createProduct.permissions, 'permissions').to.eq('ALL');
      });
    });
    step('When: owner updates the controlled product', () => {
      graphql<{ updateProduct: { id: string; price: number; stock: number } }>(
        `mutation UpdateProduct($id: ID!) {
          updateProduct(id: $id, price: 24.5, stock: 9) { id price stock }
        }`,
        { id: productId },
        'UpdateProduct',
      ).then((updated) => {
        expect(updated.errors, 'GraphQL errors').to.be.undefined;
        expect(updated.data?.updateProduct, 'updated product').to.include({
          id: productId,
          price: 24.5,
          stock: 9,
        });
      });
    });
    step('Teardown: delete the controlled product through the same schema', () => {
      graphql<{ deleteProduct: boolean }>(
        'mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }',
        { id: productId },
        'DeleteProduct',
      ).then((deleted) => {
        expect(deleted.errors, 'GraphQL errors').to.be.undefined;
        expect(deleted.data?.deleteProduct, 'deletion result').to.eq(true);
      });
    });
  });

  it('[API-GQL-005] Cart mutations add update remove and clear items', () => {
    labels('API-GQL-005 - Cart');

    graphql<{ clearCart: boolean }>('mutation { clearCart }');
    graphql<{ products: { products: Array<{ id: string; stock: number }> } }>(
      'query { products(page: 1, limit: 100) { products { id stock } } }',
    ).then((inventory) => {
      const product = inventory.data!.products.products.find(({ stock }) => stock >= 3);
      expect(product, 'a product with at least three units is required').to.exist;

      step('Given: client adds an available product to the cart', () => {
        graphql<{ addToCart: { id: string; product_id: number; quantity: number } }>(
          `mutation Add($productId: Int!) {
            addToCart(product_id: $productId, quantity: 1) { id product_id quantity }
          }`,
          { productId: Number(product!.id) },
          'Add',
        ).then((added) => {
          const cartItemId = added.data!.addToCart.id;
          expect(added.data!.addToCart.quantity, 'added quantity').to.eq(1);

          step('When: client changes the persistent cart item quantity', () => {
            graphql<{ updateCartItem: { id: string; quantity: number } }>(
              `mutation UpdateCart($id: ID!) {
                updateCartItem(id: $id, quantity: 3) { id quantity }
              }`,
              { id: cartItemId },
              'UpdateCart',
            ).then((updated) => {
              expect(updated.data?.updateCartItem.quantity, 'updated quantity').to.eq(3);
            });
          });
          step('Then: client removes that exact cart item', () => {
            graphql<{ removeFromCart: boolean }>(
              'mutation RemoveCart($id: ID!) { removeFromCart(id: $id) }',
              { id: cartItemId },
              'RemoveCart',
            ).then((removed) => {
              expect(removed.data?.removeFromCart, 'removal result').to.eq(true);
            });
            graphql<{ cart: { items: unknown[]; item_count: number } }>(
              'query { cart { items { id } item_count } }',
            ).then((cart) => {
              expect(cart.data?.cart.item_count, 'item count').to.eq(0);
            });
          });
        });
      });
    });

    // Teardown is queued last so it runs whether or not the assertions above
    // held, keeping the shared account's cart empty for the next scenario.
    graphql<{ clearCart: boolean }>('mutation { clearCart }');
  });

  it('[API-GQL-006] Order mutation persists the cart and computed financial values', () => {
    labels('API-GQL-006 - Order');

    let orderId: string | undefined;
    let productId: number | undefined;

    graphql<{ clearCart: boolean }>('mutation { clearCart }');
    products
      .createProduct({ name: uniqueProductName('graphql-order'), ...teachingData.product })
      .then((product) => {
        productId = product.id;
        graphql('mutation Add($id: Int!) { addToCart(product_id: $id, quantity: 1) { id } }',
          { id: product.id }, 'Add');

        graphql<{
          cartSummary: {
            summary: { subtotal: number; tax: number; shipping_cost: number; total: number };
          };
        }>(
          'query { cartSummary(tax_rate: 0.095, shipping_cost: 12) { summary { subtotal tax shipping_cost total } } }',
        ).then((preview) => {
          const summary = preview.data!.cartSummary.summary;
          const roundedTax = Number(summary.tax.toFixed(2));

          step('When: client creates an order from its current cart', () => {
            graphql<{ createOrder: { id: string; total: number; status: string; items: unknown[] } }>(
              `mutation CreateOrder($financial: FinancialInput!) {
                createOrder(
                  shipping: {
                    full_name: "GraphQL Automation"
                    email: "graphql@example.com"
                    address_line: "1 Test Street"
                    city: "Test City"
                    state: "CA"
                    zip_code: "90210"
                    country: "USA"
                    is_fake: true
                  }
                  payment: {
                    card_number: "4242424242424242"
                    expiry_date: "12/25"
                    cvv: "123"
                    brand: "Visa"
                    payment_status: "pending"
                  }
                  financial: $financial
                ) { id total status items { id quantity } }
              }`,
              {
                financial: {
                  tax: roundedTax,
                  shipping: summary.shipping_cost,
                  tax_rate: 0.095,
                  state: 'CA',
                  country: 'USA',
                },
              },
              'CreateOrder',
            ).then((created) => {
              expect(created.errors, 'GraphQL errors').to.be.undefined;
              orderId = created.data!.createOrder.id;
              expect(Number(created.data!.createOrder.total), 'reconciled total').to.be.closeTo(
                summary.subtotal + roundedTax + summary.shipping_cost,
                0.01,
              );
              expect(created.data!.createOrder.items, 'order items').to.have.length(1);
            });
          });
          step('Then: the created order is readable by id', () => {
            graphql<{ order: { id: string; status: string } }>(
              'query Order($id: ID!) { order(id: $id) { id status } }',
              { id: orderId },
              'Order',
            ).then((queried) => {
              expect(queried.data?.order.id, 'queried order id').to.eq(orderId);
            });
          });
        });
      });

    // Queued teardown: it runs regardless of the assertions above.
    graphql<{ clearCart: boolean }>('mutation { clearCart }').then(() => {
      if (orderId) {
        guardedApi({
          method: 'DELETE',
          url: `/api/orders/${orderId}?force=true`,
          headers: authHeaders(),
        }).then((cleanup) => {
          expect([200, 404], 'order cleanup status').to.include(cleanup.status);
        });
      }
      if (productId) products.deleteProduct(productId);
    });
  });

  it('[API-GQL-007] Order search returns filters summary and pagination', () => {
    labels('API-GQL-007 - Search orders');

    step('When: client searches its orders with pagination', () => {
      graphql<{
        searchOrders: {
          success: boolean;
          data: Array<{ id: string; total: number }>;
          pagination: { page: number; limit: number; total: number };
          filters_applied: { min_total?: number };
          summary: { total_orders: number; total_amount: number };
        };
      }>(
        `query SearchOrders($filters: OrderSearchFiltersInput, $page: Int!, $limit: Int!) {
          searchOrders(filters: $filters, page: $page, limit: $limit) {
            success
            data { id total }
            pagination { page limit total }
            filters_applied { min_total }
            summary { total_orders total_amount }
          }
        }`,
        { filters: { min_total: 0 }, page: 1, limit: 2 },
        'SearchOrders',
      ).then((payload) => {
        const result = payload.data!.searchOrders;
        expect(payload.errors, 'GraphQL errors').to.be.undefined;
        expect(result.success, 'success flag').to.eq(true);
        expect(result.pagination, 'pagination').to.include({ page: 1, limit: 2 });
        expect(result.filters_applied.min_total, 'applied filter').to.eq(0);
        expect(result.data, 'returned rows').to.have.length.of.at.most(2);
        // The API's `summary` block is computed over the returned page, not the
        // full filtered set, so it always matches the current page's row count
        // and their sum -- it is intentionally independent of `pagination.total`.
        expect(result.summary.total_orders, 'summary total').to.eq(result.data.length);
        expect(result.summary.total_amount, 'summary amount').to.be.closeTo(
          result.data.reduce((sum, order) => sum + order.total, 0),
          0.01,
        );
      });
    });
  });
});
