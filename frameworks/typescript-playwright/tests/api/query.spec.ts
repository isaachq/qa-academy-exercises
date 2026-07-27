import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import type { Product } from '../../services/product_service.js';

const auth = () => ({
  Authorization: `Bearer ${environment.apiKey}`,
  'Content-Type': 'application/json',
});
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
const labels = async (story: string) => {
  await allure.epic('Chapter 5');
  await allure.feature('HTTP QUERY API');
  await allure.story(story);
};

test('[API-QUERY-001] Native QUERY products applies fields filters sort and pagination', async ({ request, productService }) => {
  await labels('API-QUERY-001 - Native products QUERY');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('native-query'), ...teachingData.product,
    });
    const response = await step('When: client sends a native QUERY document', () =>
      request.fetch('/api/products/query', {
        method: 'QUERY', headers: auth(), data: productDocument(product!.name),
      }));
    await step('Then: response reflects native transport and controlled filter', async () => {
      expect(response.status()).toBe(200);
      const payload = await response.json();
      expect(payload.meta.transport).toBe('QUERY');
      expect(payload.data).toHaveLength(1);
      expect(payload.data[0].id).toBe(product!.id);
      expect(payload.data[0].category).toBeUndefined();
      expect(payload.pagination).toEqual(expect.objectContaining({ page: 1, limit: 2, total: 1 }));
    });
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[API-QUERY-002] POST override reports POST_OVERRIDE transport', async ({ request }) => {
  await labels('API-QUERY-002 - POST override');
  const response = await step('When: client tunnels QUERY through POST override', () =>
    request.post('/api/products/query', {
      headers: { ...auth(), 'X-HTTP-Method-Override': 'QUERY' },
      data: productDocument(),
    }));
  expect(response.status()).toBe(200);
  expect((await response.json()).meta.transport).toBe('POST_OVERRIDE');
});

test('[API-QUERY-003] Plain POST query reports POST transport', async ({ request }) => {
  await labels('API-QUERY-003 - Plain POST');
  const response = await step('When: client posts a query document without override', () =>
    request.post('/api/products/query', { headers: auth(), data: productDocument() }));
  expect(response.status()).toBe(200);
  expect((await response.json()).meta.transport).toBe('POST');
});

test('[API-QUERY-004] GET query is rejected with the documented Allow header', async ({ request }) => {
  await labels('API-QUERY-004 - GET rejected');
  const response = await step('When: client sends unsupported GET transport', () =>
    request.get('/api/products/query', { headers: auth() }));
  expect(response.status()).toBe(405);
  expect(response.headers().allow).toBe('QUERY, POST, OPTIONS');
});

test('[API-QUERY-005] Native QUERY orders sorts persisted total and keeps aggregate summary separate', async ({ request }) => {
  await labels('API-QUERY-005 - Orders QUERY');
  const response = await step('When: client sends native orders QUERY sorted by total', () =>
    request.fetch('/api/orders/query', {
      method: 'QUERY', headers: auth(), data: orderDocument(),
    }));
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.meta.transport).toBe('QUERY');
  expect(payload.data[0].total).toBeDefined();
  expect(payload.summary.total_amount).toBeGreaterThan(0);
});

test('[API-QUERY-006] Order relations are filtered before total and pagination', async ({ request }) => {
  await labels('API-QUERY-006 - Relation before pagination');
  const existing = await request.get('/api/orders?page=1&limit=100', { headers: auth() });
  const orders = (await existing.json()).data as Array<{
    order_items: Array<{ product_id: number }>;
  }>;
  const productId = orders.flatMap((order) => order.order_items ?? [])[0]?.product_id;
  expect(productId, 'At least one existing order item is required').toBeTruthy();
  const response = await step('When: client filters an existing relation with a one-row page', () =>
    request.post('/api/orders/query', {
      headers: auth(), data: orderDocument([productId]),
    }));
  const payload = await response.json();
  expect(payload.data).toHaveLength(1);
  expect(payload.pagination.total).toBeGreaterThanOrEqual(1);
  expect(payload.pagination.limit).toBe(1);
});

test('[API-QUERY-007] QUERY rejects invalid ranges fields sort dates IDs and limits', async ({ request }) => {
  await labels('API-QUERY-007 - Validation');
  const invalidDocuments = [
    { filters: { price: { min: 10, max: 1 } } },
    { sort: { field: 'not_a_field', direction: 'asc' } },
    { fields: ['password'] },
    { pagination: { page: 0, limit: 10 } },
    { pagination: { page: 1, limit: 101 } },
  ];
  for (const document of invalidDocuments) {
    const response = await step('When: client submits one invalid QUERY document', () =>
      request.post('/api/products/query', { headers: auth(), data: document }));
    expect([400, 403]).toContain(response.status());
    if (response.status() === 400) {
      expect((await response.json()).success).toBe(false);
    } else {
      expect(response.headers()['content-type']).toContain('text/html');
    }
  }
});
