import { expect, type Page } from '@playwright/test';
import { ACTIONS, step } from '../helpers/steps.js';

export type Inventory = { stock: number; reserved: number; available: number };

export class StorePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await step(ACTIONS.storeOpen, async () => {
      await this.page.goto('/store', { waitUntil: 'commit' });
    });
  }

  async searchProduct(productId: number, productName: string): Promise<void> {
    await step(ACTIONS.storeSearch, async () => {
      await this.page.getByTestId('store-search').fill(productName);
      await expect(this.page.getByTestId(`product-add-to-cart-${productId}`)).toBeVisible();
    });
  }

  async openProduct(productId: number, productName: string): Promise<void> {
    await this.open();
    await this.searchProduct(productId, productName);
  }

  async readInventory(productId: number): Promise<Inventory> {
    return step(ACTIONS.storeReadInventory, async () => {
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
    });
  }

  async addToCart(productId: number): Promise<void> {
    await step(ACTIONS.storeAddToCart, async () => {
      const responsePromise = this.page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/cart' &&
          response.request().method() === 'POST',
      );
      await this.page.getByTestId(`product-add-to-cart-${productId}`).click();
      const response = await responsePromise;
      expect(response.ok()).toBeTruthy();
    });
  }

  async expectReserved(productId: number, expectedReserved: number): Promise<void> {
    await step(ACTIONS.storeVerifyReserved, async () => {
      await expect(
        this.page.getByTestId(`product-stock-info-${productId}`).locator('..'),
      ).toContainText(`Reserved: ${expectedReserved}`);
    });
  }

  async openOrderHistory(productId: number): Promise<void> {
    await step(ACTIONS.storeOpenOrderHistory, async () => {
      await this.page.getByTestId(`product-order-history-${productId}`).click();
      await expect(this.page.getByTestId('order-history-modal')).toBeVisible();
    });
  }

  async expectOrderRow(orderId: number, quantity: number, status: string): Promise<void> {
    await step(ACTIONS.storeVerifyOrderRow, async () => {
      const row = this.page.getByTestId(`order-history-row-${orderId}`);
      await expect(row).toBeVisible();
      await expect(row).toContainText(String(quantity));
      await expect(row).toContainText(status);
    });
  }

  async expectMobileModalContract(testId: string): Promise<void> {
    await step(ACTIONS.storeVerifyMobileModal, async () => {
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
    });
  }
}
