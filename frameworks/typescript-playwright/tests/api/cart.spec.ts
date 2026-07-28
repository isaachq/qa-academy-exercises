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
  await allure.feature('Cart API');
  await allure.story(story);
};

test.beforeEach(async ({ productService }) => productService.clearCart());
test.afterEach(async ({ productService }) => productService.clearCart());

test('[API-CART-001] Adding the same product merges quantity without duplicate items', async ({ request, productService }, testInfo) => {
  await labels('API-CART-001 - Add and merge item');
  let product: Product | undefined;
  try {
    product = await step('Setup: create a controlled in-stock product', () =>
      productService.createProduct({ name: uniqueProductName('cart-merge'), ...teachingData.product }));
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await step('When: client adds one unit to the cart', () =>
        guardedApi(testInfo, () =>
          request.post('/api/cart', { headers: auth(), data: { product_id: product!.id, quantity: 1 } })));
      expect(response.status()).toBe(201);
    }
    const cart = await step('Then: client reads the merged cart', () =>
      guardedApi(testInfo, () => request.get('/api/cart', { headers: auth() })));
    const payload = (await expectApiJson<any>(cart)).data;
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toEqual(expect.objectContaining({ product_id: product.id, quantity: 2 }));
    expect(payload.summary.item_count).toBe(2);
  } finally {
    await step('Teardown: clear cart and delete product', async () => {
      await productService.clearCart();
      if (product) await productService.deleteProduct(product.id);
    });
  }
});

test('[API-CART-002] Updating quantity persists and quantity zero removes the item', async ({ request, productService }, testInfo) => {
  await labels('API-CART-002 - Update and remove item');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({ name: uniqueProductName('cart-update'), ...teachingData.product });
    const added = await step('Given: one controlled cart item', () =>
      guardedApi(testInfo, () =>
        request.post('/api/cart', { headers: auth(), data: { product_id: product!.id, quantity: 1 } })));
    const itemId = (await expectApiJson<any>(added)).data.id as number;
    const updated = await step('When: client changes item quantity', () =>
      guardedApi(testInfo, () =>
        request.patch(`/api/cart/${itemId}`, { headers: auth(), data: { quantity: 3 } })));
    expect(updated.status()).toBe(200);
    expect((await expectApiJson<any>(updated)).data.quantity).toBe(3);
    const removed = await step('When: client changes quantity to zero', () =>
      guardedApi(testInfo, () =>
        request.patch(`/api/cart/${itemId}`, { headers: auth(), data: { quantity: 0 } })));
    expect(removed.status()).toBe(200);
    const cart = await guardedApi(testInfo, () => request.get('/api/cart', { headers: auth() }));
    expect((await expectApiJson<any>(cart)).data.items).toHaveLength(0);
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[API-CART-003] Bulk update reports mixed updates deletes statistics and summary', async ({ request, productService }, testInfo) => {
  await labels('API-CART-003 - Bulk update');
  const products: Product[] = [];
  try {
    for (const suffix of ['update', 'delete']) {
      products.push(await productService.createProduct({
        name: uniqueProductName(`cart-bulk-${suffix}`), ...teachingData.product,
      }));
    }
    const itemIds: number[] = [];
    for (const product of products) {
      const response = await guardedApi(testInfo, () => request.post('/api/cart', {
        headers: auth(), data: { product_id: product.id, quantity: 1 },
      }));
      itemIds.push((await expectApiJson<any>(response)).data.id);
    }
    const response = await step('When: client bulk-updates one item and deletes another', () =>
      guardedApi(testInfo, () => request.patch('/api/cart/bulk', {
        headers: auth(),
        data: { updates: [
          { cart_item_id: itemIds[0], quantity: 2 },
          { cart_item_id: itemIds[1], quantity: 0 },
        ] },
      })));
    await step('Then: bulk response contains results statistics and refreshed summary', async () => {
      expect(response.status()).toBe(200);
      const body = await expectApiJson<any>(response);
      const payload = body.data ?? body;
      expect(payload.results).toHaveLength(2);
      expect(payload.statistics ?? payload.stats).toBeTruthy();
      expect(payload.cart_summary).toBeTruthy();
    });
  } finally {
    await productService.clearCart();
    for (const product of products) await productService.deleteProduct(product.id);
  }
});

test('[API-CART-004] Cart summary calculates subtotal tax shipping discount and readiness', async ({ request, productService }, testInfo) => {
  await labels('API-CART-004 - Summary');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({ name: uniqueProductName('cart-summary'), ...teachingData.product });
    await guardedApi(testInfo, () =>
      request.post('/api/cart', { headers: auth(), data: { product_id: product!.id, quantity: 2 } }));
    const response = await step('When: client requests a parameterized cart summary', () =>
      guardedApi(testInfo, () =>
        request.get('/api/cart/summary?tax_rate=0.1&shipping_cost=5&discount=2', { headers: auth() })));
    await step('Then: monetary fields reconcile and cart is checkout-ready', async () => {
      expect(response.status()).toBe(200);
      const payload = await expectApiJson<any>(response);
      const value = payload.summary;
      expect(Number(value.subtotal)).toBeCloseTo(Number(product!.price) * 2, 2);
      expect(Number(value.total)).toBeCloseTo(
        Number(value.subtotal) - Number(value.discount) + Number(value.tax) + Number(value.shipping_cost), 2);
      expect(payload.can_checkout).toBe(true);
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[API-CART-005] Insufficient stock is rejected without corrupting the cart', async ({ request, productService }, testInfo) => {
  await labels('API-CART-005 - Insufficient stock');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('cart-stock'), ...teachingData.product, stock: 1,
    });
    const response = await step('When: client requests more units than stock', () =>
      guardedApi(testInfo, () =>
        request.post('/api/cart', { headers: auth(), data: { product_id: product!.id, quantity: 2 } })));
    expect(response.status()).toBe(400);
    const cart = await guardedApi(testInfo, () => request.get('/api/cart', { headers: auth() }));
    expect((await expectApiJson<any>(cart)).data.items).toHaveLength(0);
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[API-CART-006] Clearing an already empty cart is idempotent', async ({ request }, testInfo) => {
  await labels('API-CART-006 - Clear cart');
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await step('When: client clears the cart', () =>
      guardedApi(testInfo, () => request.delete('/api/cart', { headers: auth() })));
    expect(response.status()).toBe(200);
  }
  const cart = await guardedApi(testInfo, () => request.get('/api/cart', { headers: auth() }));
  expect((await expectApiJson<any>(cart)).data.items).toHaveLength(0);
});
