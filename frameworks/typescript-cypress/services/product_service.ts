import * as allure from 'allure-js-commons';
import { environment } from '../config/environment';
import { guardedApi, type ApiResponse } from '../helpers/api_response';
import { ACTIONS, step } from '../helpers/steps';

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export type Product = ProductInput & { id: number; permissions: string };

export const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${environment.apiKey()}`,
  'Content-Type': 'application/json',
});

export class ProductService {
  clearCart(): Cypress.Chainable<void> {
    return step(ACTIONS.apiClearCart, () => {
      guardedApi({ method: 'DELETE', url: '/api/cart', headers: authHeaders() }).then(
        (response) => {
          expect(response.status, 'clear cart status').to.eq(200);
        },
      );
    });
  }

  createProduct(input: ProductInput): Cypress.Chainable<Product> {
    return step(ACTIONS.apiCreateProduct, () =>
      guardedApi<{ data: Product }>({
        method: 'POST',
        url: '/api/products',
        headers: authHeaders(),
        body: input,
      }).then((response) => {
        this.attachExchange('Create product', input, response);
        expect(response.status, 'create product status').to.eq(201);
        return response.body.data;
      }),
    );
  }

  getProduct(id: number): Cypress.Chainable<Product> {
    return step(ACTIONS.apiGetProduct, () =>
      guardedApi<{ data: Product }>({
        url: `/api/products/${id}`,
        headers: authHeaders(),
      }).then((response) => {
        expect(response.status, 'read product status').to.eq(200);
        return response.body.data;
      }),
    );
  }

  updateProduct(id: number, input: Partial<ProductInput>): Cypress.Chainable<Product> {
    return step(ACTIONS.apiUpdateProduct, () =>
      guardedApi<{ data: Product }>({
        method: 'PATCH',
        url: `/api/products/${id}`,
        headers: authHeaders(),
        body: input,
      }).then((response) => {
        expect(response.status, 'update product status').to.eq(200);
        return response.body.data;
      }),
    );
  }

  deleteOrder(id: number): Cypress.Chainable<void> {
    return step(ACTIONS.apiDeleteOrder, () => {
      guardedApi({
        method: 'DELETE',
        url: `/api/orders/${id}`,
        headers: authHeaders(),
      }).then((response) => {
        expect([200, 404], 'delete order status').to.include(response.status);
      });
    });
  }

  deleteProduct(id: number): Cypress.Chainable<void> {
    return step(ACTIONS.apiDeleteProduct, () => {
      guardedApi({
        method: 'DELETE',
        url: `/api/products/${id}?force=true`,
        headers: authHeaders(),
      }).then((response) => {
        expect([200, 404], 'delete product status').to.include(response.status);
      });
    });
  }

  /** Reports the exchange without the credentials that authorized it. */
  private attachExchange(name: string, requestBody: unknown, response: ApiResponse): void {
    allure.attachment(
      name,
      JSON.stringify({ request: requestBody, response: { status: response.status } }, null, 2),
      'application/json',
    );
  }
}
