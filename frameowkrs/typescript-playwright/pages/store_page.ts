import { expect, type Page } from '@playwright/test';

export class StorePage {
  constructor(private readonly page: Page) {}

  async openProduct(productId: number, productName: string): Promise<void> {
    await this.page.goto('/store');
    await this.page.getByTestId('store-search').fill(productName);
    await expect(this.page.getByTestId(`product-add-to-cart-${productId}`)).toBeVisible();
  }

  async readInventory(productId: number): Promise<{ stock: number; reserved: number; available: number }> {
    await this.page.getByTestId(`product-stock-info-${productId}`).click();
    const modal = this.page.getByTestId('stock-info-modal');
    await expect(modal).toBeVisible();
    const text = await modal.innerText();
    const numberAfter = (label: string) => {
      const match = text.match(new RegExp(`${label}:\\s*(\\d+)`, 'i'));
      if (!match) throw new Error(`Inventory value not found for ${label}`);
      return Number(match[1]);
    };
    const values = {
      stock: numberAfter('Total Stock'),
      reserved: numberAfter('Reserved in Your Cart'),
      available: numberAfter('Available to Add'),
    };
    await this.page.getByTestId('stock-info-close').click();
    return values;
  }

  async addToCart(productId: number): Promise<void> {
    await this.page.getByTestId(`product-add-to-cart-${productId}`).click();
  }

  async openOrderHistory(productId: number, orderId: number): Promise<void> {
    await this.page.getByTestId(`product-order-history-${productId}`).click();
    const modal = this.page.getByTestId('order-history-modal');
    await expect(modal).toBeVisible();
    await expect(this.page.getByTestId(`order-history-row-${orderId}`)).toBeVisible();
  }

  async assertMobileModalContract(testId: string): Promise<void> {
    const modal = this.page.getByTestId(testId);
    const backdrop = modal.locator('..');
    const box = await modal.boundingBox();
    if (!box) throw new Error(`${testId} has no bounding box`);
    const viewport = this.page.viewportSize();
    expect(viewport).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width);
    expect(box.height).toBeLessThanOrEqual(viewport!.height);
    await expect(backdrop).toHaveCSS('position', 'fixed');
    await expect(modal).toHaveCSS('overflow-y', 'auto');
    const backdropOwnsHitTarget = await backdrop.evaluate((element) => {
      const target = document.elementFromPoint(1, 1);
      return target !== null && element.contains(target);
    });
    expect(backdropOwnsHitTarget).toBe(true);
    const close = this.page.getByTestId('order-history-close');
    await expect(close).toBeVisible();
    await close.click();
    await expect(modal).toBeHidden();
  }
}
