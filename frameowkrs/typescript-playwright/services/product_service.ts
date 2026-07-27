import { expect, type APIRequestContext, type TestInfo } from '@playwright/test';
import { allure } from 'allure-playwright';
import { environment } from '../config/environment.js';

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export type Product = ProductInput & { id: number; permissions: string };

export class ProductService {
  constructor(
    private readonly request: APIRequestContext,
    private readonly testInfo?: TestInfo,
  ) {}

  private headers() {
    return { Authorization: `Bearer ${environment.apiKey}` };
  }

  async clearCart(): Promise<void> {
    await this.request.delete('/api/cart', { headers: this.headers() });
  }

  async createProduct(input: ProductInput): Promise<Product> {
    const response = await this.request.post('/api/products', {
      headers: this.headers(),
      data: input,
    });
    await this.attachExchange('Create product', input, response.status());
    expect(response.status()).toBe(201);
    const payload = await response.json();
    return payload.data as Product;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.request.get(`/api/products/${id}`, { headers: this.headers() });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    return payload.data as Product;
  }

  async updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
    const response = await this.request.patch(`/api/products/${id}`, {
      headers: this.headers(),
      data: input,
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    return payload.data as Product;
  }

  async deleteOrder(id: number): Promise<void> {
    const response = await this.request.delete(`/api/orders/${id}`, { headers: this.headers() });
    expect([200, 404]).toContain(response.status());
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.request.delete(`/api/products/${id}?force=true`, {
      headers: this.headers(),
    });
    expect([200, 404]).toContain(response.status());
  }

  private async attachExchange(name: string, requestBody: unknown, status: number): Promise<void> {
    const body = JSON.stringify({ request: requestBody, response: { status } }, null, 2);
    await allure.attachment(name, body, 'application/json');
    await this.testInfo?.attach(name, { body, contentType: 'application/json' });
  }
}
