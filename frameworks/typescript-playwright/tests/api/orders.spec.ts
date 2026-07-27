import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import type { ControlledOrder } from '../../services/order_service.js';

const auth = () => ({ Authorization: `Bearer ${environment.apiKey}` });
const labels = async (story: string) => {
  await allure.epic('Chapter 5');
  await allure.feature('Orders API');
  await allure.story(story);
};

test('[API-ORDER-001] Create and read order preserves items shipping payment and totals', async ({ orderService }) => {
  await labels('API-ORDER-001 - Create and query order');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await step('Setup: create product cart and paid order', () =>
      orderService.createControlledOrder('order-create'));
    const order = await step('When: client reads the created order', () =>
      orderService.get(controlled!.order.id));
    await step('Then: order exposes reconciled domain details', async () => {
      expect(order.id).toBe(controlled!.order.id);
      expect(order.status).toBe('completed');
      expect(order.payment_status).toBe('paid');
      expect(order.total).toBeCloseTo(Number(order.subtotal) + Number(order.tax) + Number(order.shipping), 2);
      expect(order.order_items).toHaveLength(1);
      expect(order.order_shipping).toBeTruthy();
    });
  } finally {
    await step('Teardown: delete order cart and product', () => orderService.cleanup(controlled));
  }
});

test('[API-ORDER-002] Order status accepts idempotency and rejects invalid transition', async ({ request, orderService }) => {
  await labels('API-ORDER-002 - Change status');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('order-status');
    const same = await step('When: client repeats the completed status', () =>
      request.patch(`/api/orders/${controlled!.order.id}/status`, {
        headers: auth(), data: { status: 'completed' },
      }));
    expect(same.status()).toBe(200);
    const invalid = await step('When: client attempts completed to pending', () =>
      request.patch(`/api/orders/${controlled!.order.id}/status`, {
        headers: auth(), data: { status: 'pending' },
      }));
    await step('Then: invalid transition is rejected and status persists', async () => {
      expect(invalid.status()).toBe(400);
      expect((await invalid.json()).current_status).toBe('completed');
      expect((await orderService.get(controlled!.order.id)).status).toBe('completed');
    });
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[API-ORDER-003] Payment status update persists on subsequent read', async ({ request, orderService }) => {
  await labels('API-ORDER-003 - Change payment');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('order-payment');
    const response = await step('When: client changes payment to pending', () =>
      request.patch(`/api/orders/${controlled!.order.id}`, {
        headers: auth(), data: { payment_status: 'pending' },
      }));
    expect(response.status()).toBe(200);
    expect((await response.json()).data.payment_status).toBe('pending');
    expect((await orderService.get(controlled.order.id)).payment_status).toBe('pending');
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[API-ORDER-004] Cancelling a completed order is safely rejected without changing stock', async ({ request, orderService, productService }) => {
  await labels('API-ORDER-004 - Cancel and restore stock');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('order-cancel');
    const afterPurchase = await productService.getProduct(controlled.product.id);
    expect(afterPurchase.stock).toBe(controlled.product.stock - 1);
    const first = await step('When: client attempts to cancel the completed paid order', () =>
      request.post(`/api/orders/${controlled!.order.id}/cancel`, { headers: auth() }));
    expect([400, 404]).toContain(first.status());
    expect((await productService.getProduct(controlled.product.id)).stock).toBe(afterPurchase.stock);
    const second = await step('When: client safely repeats the rejected cancellation', () =>
      request.post(`/api/orders/${controlled!.order.id}/cancel`, { headers: auth() }));
    expect([400, 404]).toContain(second.status());
    expect((await productService.getProduct(controlled.product.id)).stock).toBe(afterPurchase.stock);
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[API-ORDER-005] Deleting an order restores stock and removes the resource', async ({ request, orderService, productService }) => {
  await labels('API-ORDER-005 - Delete and cleanup');
  let controlled: ControlledOrder | undefined;
  let deleted = false;
  try {
    controlled = await orderService.createControlledOrder('order-delete');
    const response = await step('When: client deletes the order', () =>
      request.delete(`/api/orders/${controlled!.order.id}`, { headers: auth() }));
    expect(response.status()).toBe(200);
    deleted = true;
    expect((await productService.getProduct(controlled.product.id)).stock).toBe(controlled.product.stock);
    const missing = await request.get(`/api/orders/${controlled.order.id}`, { headers: auth() });
    expect(missing.status()).toBe(404);
  } finally {
    await orderService.cleanup(controlled, deleted);
  }
});

test('[API-ORDER-006] Order search returns filtered summary counts and total amount', async ({ request, orderService }) => {
  await labels('API-ORDER-006 - Search with summary');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('order-summary');
    const response = await step('When: client searches by controlled customer email', () =>
      request.get('/api/orders/search?search=framework.&page=1&limit=10', { headers: auth() }));
    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data.some((order: { id: number }) => order.id === controlled!.order.id)).toBe(true);
    expect(payload.summary.total_orders).toBeGreaterThanOrEqual(1);
    expect(Number(payload.summary.total_amount)).toBeGreaterThan(0);
    expect(Number(payload.summary.average_order_value)).toBeGreaterThan(0);
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[API-ORDER-007] Relational search is applied before pagination totals', async ({ request, orderService }) => {
  await labels('API-ORDER-007 - Relational filters before pagination');
  const controlled: ControlledOrder[] = [];
  try {
    controlled.push(await orderService.createControlledOrder('relation-alpha'));
    controlled.push(await orderService.createControlledOrder('relation-beta'));
    const productId = controlled[0].product.id;
    const response = await step('When: client filters a product before a one-row page', () =>
      request.get(`/api/orders/search?product_id=${productId}&page=1&limit=1`, { headers: auth() }));
    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.pagination.total).toBe(1);
    expect(payload.data[0].id).toBe(controlled[0].order.id);
  } finally {
    for (const item of controlled) await orderService.cleanup(item);
  }
});

test('[API-ORDER-008] Order resources do not disclose foreign or invalid IDs', async ({ request }) => {
  await labels('API-ORDER-008 - Isolation by user');
  const response = await step('When: client requests an ID outside its resource set', () =>
    request.get('/api/orders/2147483647', { headers: auth() }));
  await step('Then: API returns not found without resource details', async () => {
    expect(response.status()).toBe(404);
    const payload = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.data).toBeUndefined();
  });
});
