import { environment } from '../config/environment';

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export type Product = ProductInput & { id: number; permissions: string };

const headers = () => ({ Authorization: `Bearer ${environment.apiKey()}` });

export class ProductService {
  clearCart(): Cypress.Chainable {
    return cy.request({ method: 'DELETE', url: '/api/cart', headers: headers(), failOnStatusCode: false });
  }

  createProduct(input: ProductInput): Cypress.Chainable<Product> {
    return cy.request({
      method: 'POST',
      url: '/api/products',
      headers: headers(),
      body: input,
    }).then((response) => {
      expect(response.status).to.eq(201);
      return response.body.data as Product;
    });
  }

  getProduct(id: number): Cypress.Chainable<Product> {
    return cy.request({ url: `/api/products/${id}`, headers: headers() })
      .then((response) => response.body.data as Product);
  }

  updateProduct(id: number, input: Partial<ProductInput>): Cypress.Chainable<Product> {
    return cy.request({
      method: 'PATCH',
      url: `/api/products/${id}`,
      headers: headers(),
      body: input,
    }).then((response) => response.body.data as Product);
  }

  deleteOrder(id: number): Cypress.Chainable {
    return cy.request({
      method: 'DELETE',
      url: `/api/orders/${id}`,
      headers: headers(),
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [200, 404]);
  }

  deleteProduct(id: number): Cypress.Chainable {
    return cy.request({
      method: 'DELETE',
      url: `/api/products/${id}?force=true`,
      headers: headers(),
      failOnStatusCode: false,
    }).its('status').should('be.oneOf', [200, 404]);
  }
}
