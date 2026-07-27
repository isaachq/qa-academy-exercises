import { expect, type Page } from '@playwright/test';

export class PlaygroundPage {
  constructor(private readonly page: Page) {}

  async openWithSeed(seed: number): Promise<void> {
    await this.page.addInitScript((value) => localStorage.setItem('flaky_seed', String(value)), seed);
    await this.page.goto('/playground', { waitUntil: 'commit' });
    await expect(this.page.getByTestId('flaky-seed-display')).toContainText(String(seed));
  }

  async runFastSuccess(seed: number): Promise<void> {
    await this.page.getByTestId('trigger-success-fast').click();
    await expect(this.page.getByTestId('flaky-invoice-modal')).toBeVisible({ timeout: 8_000 });
    await expect(this.page.getByTestId('flaky-invoice-status')).toBeVisible();
    await expect(this.page.getByTestId('flaky-seed-display')).toContainText(String(seed));
  }
}
