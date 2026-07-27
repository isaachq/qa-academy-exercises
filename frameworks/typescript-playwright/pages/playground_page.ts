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

  async open(): Promise<void> {
    await step('Playground: open a fresh page', async () => {
      await this.page.goto('/playground');
      await expect(this.page.getByTestId('section-text-inputs')).toBeVisible();
    });
  }

  async expectCompleteSectionContract(): Promise<void> {
    await step('Playground: verify all 24 unique sections', async () => {
      const sections = [
        'section-text-inputs', 'section-buttons', 'section-radio', 'section-checkbox',
        'section-dropdown', 'section-other-inputs', 'section-modals', 'section-table',
        'section-tabs', 'section-accordion', 'section-links', 'section-loading',
        'section-badges', 'section-contact-form', 'section-order-form',
        'section-advanced-datatable', 'section-basic-auth', 'section-iframe',
        'section-geolocation', 'section-hover', 'section-new-tab',
        'section-download-upload', 'section-flakiness', 'section-shadow-dom',
      ];
      for (const id of sections) await expect(this.page.getByTestId(id)).toHaveCount(1);
      const duplicates = await this.page.evaluate(() => {
        const values = [...document.querySelectorAll('[data-testid]')]
          .map((element) => element.getAttribute('data-testid'))
          .filter((value): value is string => Boolean(value));
        return values.filter((value, index) => values.indexOf(value) !== index);
      });
      expect(duplicates).toEqual([]);
    });
  }

  async expectContactFormValidationAndBoundaries(): Promise<void> {
    await step('Playground: submit an empty contact form', async () => {
      await this.page.getByTestId('open-contact-modal').click();
      await this.page.getByTestId('contact-submit').click();
      await expect(this.page.getByTestId('contact-name-error')).toBeVisible();
      await expect(this.page.getByTestId('contact-email-error')).toBeVisible();
      await expect(this.page.getByTestId('contact-message-error')).toBeVisible();
    });
    await step('Playground: submit valid boundary values', async () => {
      await this.page.getByTestId('contact-name').fill('Boundary User');
      await this.page.getByTestId('contact-email').fill('boundary@example.test');
      await this.page.getByTestId('contact-message').fill('A'.repeat(500));
      await this.page.getByTestId('contact-submit').click();
      await expect(this.page.getByTestId('contact-success-close')).toBeVisible();
      await this.page.getByTestId('contact-success-close').click();
    });
  }

  async expectModalTabsAndAccordion(): Promise<void> {
    await step('Playground: open and close the modal', async () => {
      await this.page.getByTestId('button-show-modal').click();
      await expect(this.page.getByTestId('modal-content')).toBeVisible();
      await this.page.getByTestId('modal-cancel').click();
      await expect(this.page.getByTestId('modal-content')).toBeHidden();
    });
    await step('Playground: change the active tab', async () => {
      await this.page.getByTestId('tab-button-2').click();
      await expect(this.page.getByTestId('tab-panel-2')).toBeVisible();
      await expect(this.page.getByTestId('tab-panel-1')).toHaveCount(0);
    });
    await step('Playground: expand and collapse an accordion item', async () => {
      const button = this.page.getByTestId('accordion-button-1');
      await button.click();
      await expect(this.page.getByTestId('accordion-content-1')).toBeVisible();
      await button.click();
      await expect(this.page.getByTestId('accordion-content-1')).toBeHidden();
    });
  }

  async expectDataTableContract(): Promise<void> {
    await step('Playground: open the 100-row DataTable', async () => {
      await this.page.getByTestId('open-datatable').click();
      await expect(this.page.getByTestId('datatable-modal')).toBeVisible();
      await expect(this.page.locator('[data-testid^="datatable-row-"]')).toHaveCount(100);
    });
    await step('Playground: search and sort without invented pagination', async () => {
      await this.page.getByTestId('datatable-search').fill('Alice');
      const filtered = this.page.locator('[data-testid^="datatable-row-"]');
      await expect(filtered).not.toHaveCount(0);
      const filteredCount = await filtered.count();
      expect(filteredCount).toBeLessThan(100);
      await this.page.getByTestId('datatable-search').clear();
      await this.page.getByTestId('sort-name').click();
      await expect(this.page.getByTestId('sort-name')).toContainText('↑');
      await expect(this.page.getByTestId('datatable-modal').getByText(/next/i)).toHaveCount(0);
      await this.page.getByTestId('datatable-close').click();
    });
  }

  async expectIframeHoverAndNewTab(): Promise<void> {
    await step('Playground: enter and return from the iframe', async () => {
      const frame = this.page.frameLocator('[data-testid="example-iframe"]');
      await expect(frame.locator('body')).not.toBeEmpty();
      await expect(this.page.getByTestId('section-iframe')).toBeVisible();
    });
    await step('Playground: reveal hover-only content', async () => {
      await this.page.getByTestId('hover-button-1').hover();
      await expect(this.page.getByTestId('hover-span')).toBeVisible();
    });
    await step('Playground: open and close a controlled new tab', async () => {
      const popupPromise = this.page.waitForEvent('popup');
      await this.page.getByTestId('open-new-tab-form').click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      expect(new URL(popup.url()).pathname).toContain('/playground/second-form');
      await popup.close();
      await expect(this.page.getByTestId('section-new-tab')).toBeVisible();
    });
  }

  async expectDownloadAndUpload(): Promise<void> {
    await step('Playground: download the CSV artifact', async () => {
      const downloadPromise = this.page.waitForEvent('download');
      await this.page.getByTestId('download-csv').click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
      expect(await download.failure()).toBeNull();
    });
    await step('Playground: upload a simulated text file', async () => {
      await this.page.getByTestId('file-upload-input').setInputFiles({
        name: 'playground-upload.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('traceable playground upload'),
      });
      await expect(this.page.getByTestId('uploading-state')).toBeVisible();
      await expect(this.page.getByTestId('upload-success')).toBeVisible({ timeout: 8_000 });
    });
  }

  async expectOpenShadowDom(): Promise<void> {
    await step('Playground: interact through the open shadow root', async () => {
      const host = this.page.getByTestId('shadow-host');
      await expect(host).toBeVisible();
      await this.page.getByTestId('shadow-input').fill('traceable automation');
      await this.page.getByTestId('shadow-submit').click();
      await expect(this.page.getByTestId('shadow-result')).toHaveText(
        'Shadow DOM received: traceable automation',
      );
    });
  }
}
