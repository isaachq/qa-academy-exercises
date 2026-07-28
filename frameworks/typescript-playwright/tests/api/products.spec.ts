import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import type { Product } from '../../services/product_service.js';
import { expectApiJson, guardedApi } from '../../helpers/api_response.js';

const auth = () => ({ Authorization: `Bearer ${environment.apiKey}` });
const labels = async (story: string) => {
  await allure.epic('Chapter 5');
  await allure.feature('Products API');
  await allure.story(story);
};

test('[API-PRODUCT-001] Product listing honors pagination metadata and limit', async ({ request }, testInfo) => {
  await labels('API-PRODUCT-001 - List and paginate products');
  const response = await step('When: client requests the first two products', () =>
    guardedApi(testInfo, () => request.get('/api/products?page=1&limit=2', { headers: auth() })));
  await step('Then: data and pagination describe the requested page', async () => {
    expect(response.status()).toBe(200);
    const payload = await expectApiJson<any>(response);
    expect(payload.data.length).toBeLessThanOrEqual(2);
    expect(payload.pagination).toEqual(expect.objectContaining({
      page: 1, limit: 2, total: expect.any(Number), total_pages: expect.any(Number),
    }));
    expect(payload.pagination.total).toBeGreaterThanOrEqual(payload.data.length);
  });
});

test('[API-PRODUCT-003] Product creation rejects required-field and numeric boundaries', async ({ request }, testInfo) => {
  await labels('API-PRODUCT-003 - Validation and limits');
  const invalidBodies = [
    { name: '', price: 10, stock: 1 },
    { name: 'Negative price', price: -0.01, stock: 1 },
    { name: 'Negative stock', price: 1, stock: -1 },
    { name: 'Fractional stock', price: 1, stock: 1.5 },
  ];
  for (const body of invalidBodies) {
    const response = await step('When: client submits one invalid product boundary', () =>
      guardedApi(testInfo, () => request.post('/api/products', { headers: auth(), data: body })));
    await step('Then: product validation rejects the request without creating data', async () => {
      expect(response.status()).toBe(400);
      expect((await expectApiJson<{ success: boolean }>(response)).success).toBe(false);
    });
  }
});

test('[API-PRODUCT-004] Template product permissions allow reads and prevent deletion', async ({ request }, testInfo) => {
  await labels('API-PRODUCT-004 - Permissions');
  const list = await step('Given: client finds a non-deletable template product', () =>
    guardedApi(testInfo, () =>
      request.get('/api/products?permission=N_DELETE&limit=1', { headers: auth() })));
  const product = (await expectApiJson<{ data: Product[] }>(list)).data[0];
  expect(product, 'The account must have a provisioned N_DELETE product').toBeTruthy();
  const read = await step('When: client reads the template product', () =>
    guardedApi(testInfo, () => request.get(`/api/products/${product.id}`, { headers: auth() })));
  const deletion = await step('When: client attempts to delete the template product', () =>
    guardedApi(testInfo, () => request.delete(`/api/products/${product.id}`, { headers: auth() })));
  await step('Then: read succeeds and deletion is forbidden', async () => {
    expect(read.status()).toBe(200);
    expect(deletion.status()).toBe(403);
    expect((await expectApiJson<{ success: boolean }>(deletion)).success).toBe(false);
  });
});

test('[API-PRODUCT-005] Categories and stock aggregates are consistent for an owned product', async ({ request, productService }, testInfo) => {
  await labels('API-PRODUCT-005 - Categories and stock');
  let product: Product | undefined;
  try {
    product = await step('Setup: create a controlled product', () =>
      productService.createProduct({
        name: uniqueProductName('product-stock'),
        ...teachingData.product,
      }));
    const categories = await step('When: client requests category aggregates', () =>
      guardedApi(testInfo, () => request.get('/api/products/categories', { headers: auth() })));
    const stock = await step('When: client requests product availability', () =>
      guardedApi(testInfo, () =>
        request.get(`/api/products/${product!.id}/stock`, { headers: auth() })));
    await step('Then: category and stock data match the controlled product', async () => {
      expect(categories.status()).toBe(200);
      const categoryPayload = await expectApiJson<any>(categories);
      expect(JSON.stringify(categoryPayload)).toContain(product!.category);
      expect(stock.status()).toBe(200);
      const values = await expectApiJson<any>(stock);
      expect(values.stock).toBe(product!.stock);
      expect(values.available).toBe(product!.stock > 0);
      expect(values.stock_status).toMatch(/in_stock|low_stock|out_of_stock/);
    });
  } finally {
    await step('Teardown: delete the controlled product', async () => {
      if (product) await productService.deleteProduct(product.id);
    });
  }
});
