import { expect, type APIRequestContext, type TestInfo } from '@playwright/test';
import { environment } from '../config/environment.js';
import { teachingData } from '../data/test_data.js';
import { uniqueProductName } from '../helpers/unique_name.js';
import { ProductService, type Product } from './product_service.js';
import { expectApiJson, guardedApi } from '../helpers/api_response.js';

export type Order = {
  id: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  payment_status: string;
  order_items?: Array<Record<string, unknown>>;
  order_shipping?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export type ControlledOrder = { order: Order; product: Product };

export class OrderService {
  constructor(
    private readonly request: APIRequestContext,
    private readonly products: ProductService,
    private readonly testInfo: TestInfo,
  ) {}

  private headers() {
    return { Authorization: `Bearer ${environment.apiKey}` };
  }

  async createControlledOrder(tag: string, paymentStatus = 'paid'): Promise<ControlledOrder> {
    await this.products.clearCart();
    const product = await this.products.createProduct({
      name: uniqueProductName(tag),
      ...teachingData.product,
    });
    const add = await guardedApi(this.testInfo, () => this.request.post('/api/cart', {
      headers: this.headers(),
      data: { product_id: product.id, quantity: 1 },
    }));
    expect(add.status()).toBe(201);

    const shipping = {
      full_name: 'Framework Test User',
      email: `framework.${Date.now()}@example.test`,
      address_line: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA',
      is_fake: true,
    };
    const payment = {
      card_number: '4242424242424242',
      expiry_date: '12/25',
      cvv: '123',
      brand: 'Visa',
      payment_status: paymentStatus,
    };
    let financial = { tax: 0, shipping: 0, state: 'NY', country: 'USA' };
    let response = await guardedApi(this.testInfo, () => this.request.post('/api/orders', {
      headers: this.headers(),
      data: { shipping, payment, financial },
    }));
    if (response.status() === 400) {
      const mismatch = await expectApiJson<any>(response);
      expect(mismatch.error).toBe('SYNC_ERROR');
      financial = {
        tax: mismatch.correct_values.tax,
        shipping: mismatch.correct_values.shipping_cost,
        state: 'NY',
        country: 'USA',
      };
      response = await guardedApi(this.testInfo, () => this.request.post('/api/orders', {
        headers: this.headers(),
        data: { shipping, payment, financial },
      }));
    }
    expect(response.status(), await response.text()).toBe(201);
    const created = (await expectApiJson<any>(response)).data as Order & { order_id: number };
    const order = { ...created, id: created.order_id };
    return { order, product };
  }

  async get(id: number): Promise<Order> {
    const response = await guardedApi(this.testInfo, () =>
      this.request.get(`/api/orders/${id}`, { headers: this.headers() }));
    expect(response.status()).toBe(200);
    return (await expectApiJson<any>(response)).data as Order;
  }

  async cleanup(controlled?: ControlledOrder, orderAlreadyDeleted = false): Promise<void> {
    if (!controlled) return;
    if (!orderAlreadyDeleted) await this.products.deleteOrder(controlled.order.id);
    await this.products.clearCart();
    await this.products.deleteProduct(controlled.product.id);
  }
}
