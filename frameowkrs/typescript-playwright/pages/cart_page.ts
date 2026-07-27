import { expect, type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async openAndVerify(productName: string, quantity: number, unitPrice: number): Promise<void> {
    await this.page.goto('/cart');
    const item = this.page.getByTestId('cart-items').filter({ hasText: productName });
    await expect(item).toBeVisible();
    await expect(item).toContainText(String(quantity));
    await expect(this.page.getByTestId('cart-subtotal')).toContainText(
      (quantity * unitPrice).toFixed(2),
    );
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByTestId('cart-checkout').click();
  }
}
