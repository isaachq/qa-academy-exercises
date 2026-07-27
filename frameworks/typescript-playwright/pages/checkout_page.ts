import { expect, type Page } from '@playwright/test';
import { ACTIONS, step } from '../helpers/steps.js';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async fillTestingDetails(): Promise<void> {
    await step(ACTIONS.checkoutFill, async () => {
      await this.page.getByTestId('checkout-use-fake-name-email').check();
      await this.page.getByTestId('checkout-use-fake-address').check();
      await this.page.getByTestId('checkout-use-testing-card').check();
    });
  }

  async submitOrder(): Promise<number> {
    return step(ACTIONS.checkoutSubmit, async () => {
      await this.page.getByTestId('checkout-submit').click();
      await expect(this.page).toHaveURL(/\/orders\/\d+$/);
      const orderId = Number(this.page.url().match(/\/orders\/(\d+)$/)?.[1]);
      if (!orderId) throw new Error('Order ID was not present in the order detail URL');
      return orderId;
    });
  }

  async placeOrder(): Promise<number> {
    await this.fillTestingDetails();
    return this.submitOrder();
  }
}
