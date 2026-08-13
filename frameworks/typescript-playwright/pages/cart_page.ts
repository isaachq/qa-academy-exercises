import { expect, type Page } from '@playwright/test';
import { ACTIONS, step } from '../helpers/steps.js';

export class CartPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await step(ACTIONS.cartOpen, async () => {
      await this.page.goto('/cart', { waitUntil: 'commit' });
    });
  }

  async expectItem(productName: string, quantity: number, unitPrice: number): Promise<void> {
    await step(ACTIONS.cartVerifyItem, async () => {
      const item = this.page.getByTestId('cart-items').filter({ hasText: productName });
      await expect(item).toBeVisible();
      await expect(item).toContainText(String(quantity));
      await expect(this.page.getByTestId('cart-subtotal')).toContainText(
        (quantity * unitPrice).toFixed(2),
      );
    });
  }

  async proceedToCheckout(): Promise<void> {
    await step(ACTIONS.cartCheckout, async () => {
      await this.page.getByTestId('cart-checkout').click();
    });
  }
}
