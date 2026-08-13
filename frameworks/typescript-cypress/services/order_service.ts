import { teachingData } from '../data/test_data';
import { guardedApi } from '../helpers/api_response';
import { uniqueProductName } from '../helpers/unique_name';
import { ProductService, authHeaders, type Product } from './product_service';

export type Order = {
  id: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  payment_status: string;
  order_items?: Array<Record<string, unknown>>;
  order_shipping?: Record<string, unknown> | Array<Record<string, unknown>> | null;
};

export type ControlledOrder = { order: Order; product: Product };

type Financial = { tax: number; shipping: number; state: string; country: string };

/**
 * Creates and removes the paid orders the extended catalog needs. Orders are the
 * one resource the platform will not let a test invent, so every scenario that
 * reads an order builds its own and deletes it again.
 */
export class OrderService {
  constructor(private readonly products = new ProductService()) {}

  createControlledOrder(tag: string, paymentStatus = 'paid'): Cypress.Chainable<ControlledOrder> {
    this.products.clearCart();
    return this.products
      .createProduct({ name: uniqueProductName(tag), ...teachingData.product })
      .then((product) =>
        guardedApi({
          method: 'POST',
          url: '/api/cart',
          headers: authHeaders(),
          body: { product_id: product.id, quantity: 1 },
        })
          .then((added) => {
            expect(added.status, 'add to cart status').to.eq(201);
            return this.placeOrder(paymentStatus);
          })
          .then((order) => ({ order, product })),
      );
  }

  get(id: number): Cypress.Chainable<Order> {
    return guardedApi<{ data: Order }>({
      url: `/api/orders/${id}`,
      headers: authHeaders(),
    }).then((response) => {
      expect(response.status, 'read order status').to.eq(200);
      return response.body.data;
    });
  }

  cleanup(controlled?: ControlledOrder, orderAlreadyDeleted = false): void {
    if (!controlled) return;
    if (!orderAlreadyDeleted) this.products.deleteOrder(controlled.order.id);
    this.products.clearCart();
    this.products.deleteProduct(controlled.product.id);
  }

  /**
   * The platform recomputes tax and shipping server side and rejects a mismatch
   * with SYNC_ERROR plus the values it expects, so the first rejection is used
   * to resubmit rather than to fail.
   */
  private placeOrder(paymentStatus: string): Cypress.Chainable<Order> {
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
    const submit = (financial: Financial) =>
      guardedApi<any>({
        method: 'POST',
        url: '/api/orders',
        headers: authHeaders(),
        body: { shipping, payment, financial },
      });

    return submit({ tax: 0, shipping: 0, state: 'NY', country: 'USA' })
      .then((response) => {
        if (response.status !== 400) return cy.wrap(response, { log: false });
        expect(response.body.error, 'financial mismatch error').to.eq('SYNC_ERROR');
        return submit({
          tax: response.body.correct_values.tax,
          shipping: response.body.correct_values.shipping_cost,
          state: 'NY',
          country: 'USA',
        });
      })
      .then((response: any) => {
        expect(response.status, JSON.stringify(response.body)).to.eq(201);
        const created = response.body.data as Order & { order_id: number };
        // The creation payload names the identifier `order_id`; every later read
        // uses `id`, so the service normalizes it once here.
        const order: Order = { ...created, id: created.order_id };
        return order;
      });
  }
}
