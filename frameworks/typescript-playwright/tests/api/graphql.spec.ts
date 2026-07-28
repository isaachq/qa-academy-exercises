import { allure } from 'allure-playwright';
import type { APIRequestContext, TestInfo } from '@playwright/test';
import { environment } from '../../config/environment.js';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import {
  expectApiJson,
  guardedApi,
} from '../../helpers/api_response.js';

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
};

const headers = () => ({
  Authorization: `Bearer ${environment.apiKey}`,
  'Content-Type': 'application/json',
});

async function graphql<T>(
  request: APIRequestContext,
  testInfo: TestInfo,
  query: string,
  variables: Record<string, unknown> = {},
  operationName?: string,
) {
  const response = await guardedApi(testInfo, () =>
    request.post('/api/graphql', {
      headers: headers(),
      data: { query, variables, operationName },
    }));
  expect(response.status()).toBe(200);
  return expectApiJson<GraphQLResponse<T>>(response);
}

async function labels(story: string) {
  await allure.epic('Chapter 5');
  await allure.feature('GraphQL API');
  await allure.story(story);
}

test('[API-GQL-001] Authenticated query returns the current user', async ({ request }, testInfo) => {
  await labels('API-GQL-001 - Authenticated query');
  const payload = await step('When: client executes the named CurrentUser query', () =>
    graphql<{ me: { id: string; email: string } }>(
      request,
      testInfo,
      'query CurrentUser { me { id email } }',
      {},
      'CurrentUser',
    ));
  await step('Then: GraphQL returns the authenticated profile without errors', async () => {
    expect(payload.errors).toBeUndefined();
    expect(payload.data?.me.id).toBeTruthy();
    expect(payload.data?.me.email).toBe(environment.uiEmail);
  });
});

test('[API-GQL-002] GraphQL validation errors use HTTP 200 and errors array', async ({ request }, testInfo) => {
  await labels('API-GQL-002 - Error model');
  const response = await step('When: client requests a field absent from the schema', () =>
    guardedApi(testInfo, () => request.post('/api/graphql', {
      headers: headers(),
      data: { query: 'query InvalidField { me { field_that_does_not_exist } }' },
    })));
  const payload = await expectApiJson<GraphQLResponse<unknown>>(response);
  await step('Then: transport succeeds and the GraphQL error is explicit', async () => {
    expect(response.status()).toBe(200);
    expect(payload.data).toBeUndefined();
    expect(payload.errors?.[0].message).toContain('field_that_does_not_exist');
  });
});

test('[API-GQL-003] Products query honors variables and pagination metadata', async ({ request }, testInfo) => {
  await labels('API-GQL-003 - Paginated products');
  const payload = await step('When: client queries a two-row product page with variables', () =>
    graphql<{
      products: {
        products: Array<{ id: string; name: string; price: number; stock: number }>;
        pagination: { page: number; limit: number; total: number; total_pages: number };
      };
    }>(
      request,
      testInfo,
      `query ProductInventory($page: Int!, $limit: Int!) {
        products(page: $page, limit: $limit) {
          products { id name price stock }
          pagination { page limit total total_pages }
        }
      }`,
      { page: 1, limit: 2 },
      'ProductInventory',
    ));
  expect(payload.errors).toBeUndefined();
  expect(payload.data?.products.products.length).toBeLessThanOrEqual(2);
  expect(payload.data?.products.pagination).toEqual(
    expect.objectContaining({ page: 1, limit: 2 }),
  );
});

test('[API-GQL-004] Product mutation creates updates and deletes controlled data', async ({ request }, testInfo) => {
  await labels('API-GQL-004 - Product mutation with cleanup');
  let productId: string | undefined;
  try {
    const created = await step('Given: client creates a uniquely named GraphQL product', () =>
      graphql<{ createProduct: { id: string; name: string; permissions: string } }>(
        request,
        testInfo,
        `mutation CreateProduct($name: String!) {
          createProduct(name: $name, description: "GraphQL traceability", price: 19.95, stock: 7, category: "Office") {
            id name permissions
          }
        }`,
        { name: uniqueProductName('graphql') },
        'CreateProduct',
      ));
    expect(created.errors).toBeUndefined();
    productId = created.data!.createProduct.id;
    expect(created.data!.createProduct.permissions).toBe('ALL');

    const updated = await step('When: owner updates the controlled product', () =>
      graphql<{ updateProduct: { id: string; price: number; stock: number } }>(
        request,
        testInfo,
        `mutation UpdateProduct($id: ID!) {
          updateProduct(id: $id, price: 24.5, stock: 9) { id price stock }
        }`,
        { id: productId },
        'UpdateProduct',
      ));
    expect(updated.errors).toBeUndefined();
    expect(updated.data?.updateProduct).toEqual(
      expect.objectContaining({ id: productId, price: 24.5, stock: 9 }),
    );
  } finally {
    if (productId) {
      const deleted = await graphql<{ deleteProduct: boolean }>(
        request,
        testInfo,
        'mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }',
        { id: productId },
        'DeleteProduct',
      );
      expect(deleted.errors).toBeUndefined();
      expect(deleted.data?.deleteProduct).toBe(true);
    }
  }
});

test('[API-GQL-005] Cart mutations add update remove and clear items', async ({ request }, testInfo) => {
  await labels('API-GQL-005 - Cart');
  await graphql<{ clearCart: boolean }>(request, testInfo, 'mutation { clearCart }');
  const inventory = await graphql<{
    products: { products: Array<{ id: string; stock: number }> };
  }>(request, testInfo, 'query { products(page: 1, limit: 100) { products { id stock } } }');
  const product = inventory.data!.products.products.find(({ stock }) => stock >= 3);
  expect(product, 'A product with at least three units is required').toBeTruthy();

  try {
    const added = await step('Given: client adds an available product to the cart', () =>
      graphql<{ addToCart: { id: string; product_id: number; quantity: number } }>(
        request,
        testInfo,
        `mutation Add($productId: Int!) {
          addToCart(product_id: $productId, quantity: 1) { id product_id quantity }
        }`,
        { productId: Number(product!.id) },
        'Add',
      ));
    const cartItemId = added.data!.addToCart.id;
    expect(added.data!.addToCart.quantity).toBe(1);

    const updated = await step('When: client changes the persistent cart item quantity', () =>
      graphql<{ updateCartItem: { id: string; quantity: number } }>(
        request,
        testInfo,
        `mutation UpdateCart($id: ID!) {
          updateCartItem(id: $id, quantity: 3) { id quantity }
        }`,
        { id: cartItemId },
        'UpdateCart',
      ));
    expect(updated.data?.updateCartItem.quantity).toBe(3);

    const removed = await step('Then: client removes that exact cart item', () =>
      graphql<{ removeFromCart: boolean }>(
        request,
        testInfo,
        'mutation RemoveCart($id: ID!) { removeFromCart(id: $id) }',
        { id: cartItemId },
        'RemoveCart',
      ));
    expect(removed.data?.removeFromCart).toBe(true);
    const cart = await graphql<{ cart: { items: unknown[]; item_count: number } }>(
      request,
      testInfo,
      'query { cart { items { id } item_count } }',
    );
    expect(cart.data?.cart.item_count).toBe(0);
  } finally {
    await graphql<{ clearCart: boolean }>(request, testInfo, 'mutation { clearCart }');
  }
});

test('[API-GQL-006] Order mutation persists the cart and computed financial values', async ({ request, productService }, testInfo) => {
  await labels('API-GQL-006 - Order');
  await graphql<{ clearCart: boolean }>(request, testInfo, 'mutation { clearCart }');
  let orderId: string | undefined;
  let productId: number | undefined;
  try {
    const product = await productService.createProduct({
      name: uniqueProductName('graphql-order'),
      ...teachingData.product,
    });
    productId = product.id;
    await graphql(
      request,
      testInfo,
      'mutation Add($id: Int!) { addToCart(product_id: $id, quantity: 1) { id } }',
      { id: product.id },
      'Add',
    );
    const preview = await graphql<{
      cartSummary: { summary: { subtotal: number; tax: number; shipping_cost: number; total: number } };
    }>(
      request,
      testInfo,
      'query { cartSummary(tax_rate: 0.095, shipping_cost: 12) { summary { subtotal tax shipping_cost total } } }',
    );
    const summary = preview.data!.cartSummary.summary;
    const roundedTax = Number(summary.tax.toFixed(2));

    const created = await step('When: client creates an order from its current cart', () =>
      graphql<{ createOrder: { id: string; total: number; status: string; items: unknown[] } }>(
        request,
        testInfo,
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
        { financial: { tax: roundedTax, shipping: summary.shipping_cost, tax_rate: 0.095, state: 'CA', country: 'USA' } },
        'CreateOrder',
      ));
    expect(created.errors).toBeUndefined();
    orderId = created.data!.createOrder.id;
    expect(created.data!.createOrder.total).toBeCloseTo(
      summary.subtotal + roundedTax + summary.shipping_cost,
      2,
    );
    expect(created.data!.createOrder.items).toHaveLength(1);

    const queried = await graphql<{ order: { id: string; status: string } }>(
      request,
      testInfo,
      'query Order($id: ID!) { order(id: $id) { id status } }',
      { id: orderId },
      'Order',
    );
    expect(queried.data?.order.id).toBe(orderId);
  } finally {
    await graphql<{ clearCart: boolean }>(request, testInfo, 'mutation { clearCart }');
    if (orderId) {
      const cleanup = await guardedApi(testInfo, () =>
        request.delete(`/api/orders/${orderId}?force=true`, { headers: headers() }));
      expect([200, 404]).toContain(cleanup.status());
    }
    if (productId) await productService.deleteProduct(productId);
  }
});

test('[API-GQL-007] Order search returns filters summary and pagination', async ({ request }, testInfo) => {
  await labels('API-GQL-007 - Search orders');
  const payload = await step('When: client searches its orders with pagination', () =>
    graphql<{
      searchOrders: {
        success: boolean;
        data: Array<{ id: string; total: number }>;
        pagination: { page: number; limit: number; total: number };
        filters_applied: { min_total?: number };
        summary: { total_orders: number; total_amount: number };
      };
    }>(
      request,
      testInfo,
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
    ));
  const result = payload.data!.searchOrders;
  expect(payload.errors).toBeUndefined();
  expect(result.success).toBe(true);
  expect(result.pagination).toEqual(expect.objectContaining({ page: 1, limit: 2 }));
  expect(result.filters_applied.min_total).toBe(0);
  expect(result.summary.total_orders).toBe(result.pagination.total);
  expect(result.data.length).toBeLessThanOrEqual(2);
});
