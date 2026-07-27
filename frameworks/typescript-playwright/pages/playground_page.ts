import { expect, type Page } from '@playwright/test';
import { ACTIONS, step } from '../helpers/steps.js';

export class PlaygroundPage {
  constructor(private readonly page: Page) {}

  async openWithSeed(seed: number): Promise<void> {
    await step(ACTIONS.playgroundOpen, async () => {
      await this.page.addInitScript(
        (value) => localStorage.setItem('flaky_seed', String(value)),
        seed,
      );
      await this.page.goto('/playground', { waitUntil: 'commit' });
    });
  }

  async expectSeed(seed: number): Promise<void> {
    await step(ACTIONS.playgroundVerifySeed, async () => {
      await expect(this.page.getByTestId('flaky-seed-display')).toContainText(String(seed));
    });
  }

  async triggerFastSuccess(): Promise<void> {
    await step(ACTIONS.playgroundTrigger, async () => {
      await this.page.getByTestId('trigger-success-fast').click();
    });
  }

  async expectInvoiceModal(seed: number): Promise<void> {
    await step(ACTIONS.playgroundVerifyInvoice, async () => {
      await expect(this.page.getByTestId('flaky-invoice-modal')).toBeVisible({ timeout: 8_000 });
      await expect(this.page.getByTestId('flaky-invoice-status')).toBeVisible();
      await expect(this.page.getByTestId('flaky-seed-display')).toContainText(String(seed));
    });
  }
}
