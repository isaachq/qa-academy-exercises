import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import type { ControlledOrder } from '../../services/order_service.js';
import type { Product } from '../../services/product_service.js';

async function labels(feature: string, story: string) {
  await allure.epic('Chapter 5');
  await allure.feature(feature);
  await allure.story(story);
}

async function openLab(page: import('@playwright/test').Page) {
  await page.goto('/query-lab');
  await expect(page.getByTestId('query-lab-page')).toBeVisible();
}

async function runLab(page: import('@playwright/test').Page) {
  await page.getByTestId('query-lab-run').click();
  await expect(page.getByTestId('query-lab-loading')).toBeHidden();
}

test('[UI-QUERY-001] Query Lab queries products with a visible document', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-001 - Query products');
  await openLab(page);
  await step('When: user configures filters and runs a product QUERY', async () => {
    await page.getByTestId('query-lab-search').fill('a');
    await page.getByTestId('query-lab-sort-field').selectOption('price');
    await page.getByTestId('query-lab-sort-direction').selectOption('asc');
    await runLab(page);
  });
  await step('Then: preview, transport, table and metadata are consistent', async () => {
    await expect(page.getByTestId('query-lab-preview-code')).toContainText('QUERY');
    await expect(page.getByTestId('query-lab-status-badge')).toContainText('200');
    await expect(page.getByTestId('query-lab-transport-badge')).toContainText('QUERY');
    await expect(page.getByTestId('query-lab-table')).toBeVisible();
  });
});

test('[UI-QUERY-002] Query Lab queries orders and uses the total field', async ({ page, orderService }) => {
  await labels('Query Lab UI', 'UI-QUERY-002 - Query orders');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await step('Given: a controlled order exists for the query result', () =>
      orderService.createControlledOrder('ui-query-orders'));
    await openLab(page);
    await step('When: user switches to orders and sorts by total', async () => {
      await page.getByTestId('query-lab-resource-orders').click();
      await page.getByTestId('query-lab-sort-field').selectOption('total');
      await runLab(page);
    });
    await step('Then: results and header use total rather than total_amount', async () => {
      await expect(page.getByTestId('query-lab-transport-badge')).toContainText('QUERY');
      await expect(page.getByTestId('query-lab-th-total')).toBeVisible();
      await expect(page.getByTestId('query-lab-results')).toContainText(String(controlled!.order.id));
      await expect(page.getByTestId('query-lab-results')).not.toContainText('total_amount');
    });
  } finally {
    await step('Teardown: delete the controlled order and product', () =>
      orderService.cleanup(controlled));
  }
});

test('[UI-QUERY-003] Query Lab switches to POST override transport', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-003 - Change transport');
  await openLab(page);
  await step('When: user selects POST with X-HTTP-Method-Override', async () => {
    await page.getByTestId('query-lab-transport-override').click();
    await expect(page.getByTestId('query-lab-preview-code'))
      .toContainText('X-HTTP-Method-Override: QUERY');
    await runLab(page);
  });
  await step('Then: the response identifies POST_OVERRIDE', async () => {
    await expect(page.getByTestId('query-lab-transport-badge')).toContainText('POST_OVERRIDE');
  });
});

test('[UI-QUERY-004] Query Lab exposes loading empty error and cooldown states', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-004 - Loading empty error cooldown');
  await openLab(page);
  let delayed = false;
  await page.route('**/api/products/query', async (route) => {
    if (!delayed) {
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    await route.continue();
  });
  await step('When: a real query remains in flight', async () => {
    await page.getByTestId('query-lab-run').click();
    await expect(page.getByTestId('query-lab-loading')).toBeVisible();
    await expect(page.getByTestId('query-lab-loading')).toBeHidden();
  });
  await step('Then: the accessible cooldown starts', async () => {
    await expect(page.getByTestId('query-lab-cooldown-toast')).toBeVisible();
    await expect(page.getByTestId('query-lab-run')).toBeDisabled();
    await expect(page.getByTestId('query-lab-run')).toBeEnabled({ timeout: 5_000 });
  });
  await step('When: a search has no matches, the empty state appears', async () => {
    await page.getByTestId('query-lab-search').fill(`no-result-${Date.now()}`);
    await runLab(page);
    await expect(page.getByTestId('query-lab-no-results')).toBeVisible();
    await expect(page.getByTestId('query-lab-run')).toBeEnabled({ timeout: 5_000 });
  });
  await step('When: the range is invalid, the server error is visible', async () => {
    await page.getByTestId('query-lab-search').fill('');
    await page.getByTestId('query-lab-price-min').fill('100');
    await page.getByTestId('query-lab-price-max').fill('1');
    await runLab(page);
    await expect(page.getByTestId('query-lab-error')).toBeVisible();
  });
});

test('[UI-MOBILE-001] Store adapts to a mobile viewport without overflow', async ({ page }) => {
  await labels('Mobile UI', 'UI-MOBILE-001 - Responsive Store');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/store');
  await step('Then: primary controls and cards fit inside the viewport', async () => {
    await expect(page.getByTestId('mobile-menu-open')).toBeVisible();
    await expect(page.getByTestId('store-search')).toBeVisible();
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/).first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});

test('[UI-MOBILE-002] Cart and modal preserve the responsive contract', async ({ page, productService }) => {
  await labels('Mobile UI', 'UI-MOBILE-002 - Responsive cart and modal');
  let product: Product | undefined;
  try {
    await productService.clearCart();
    product = await productService.createProduct({
      name: uniqueProductName('ui-mobile-cart'), ...teachingData.product,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/store');
    await page.getByTestId('store-search').fill(product.name);
    const addResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/api/cart' &&
      response.request().method() === 'POST');
    await page.getByTestId(`product-add-to-cart-${product.id}`).click();
    expect((await addResponse).status()).toBe(201);
    await page.getByTestId(`product-stock-info-${product.id}`).click();
    const modal = page.getByTestId('stock-info-modal');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.height).toBeLessThanOrEqual(844);
    await page.getByTestId('stock-info-close').click();
    await page.goto('/cart');
    await expect(page.getByTestId('cart-items')).toContainText(product.name);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-MOBILE-003] Playground keeps its sections usable on mobile', async ({ page }) => {
  await labels('Mobile UI', 'UI-MOBILE-003 - Responsive Playground');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/playground');
  await step('Then: initial controls, table and Shadow DOM do not cause global overflow', async () => {
    await expect(page.getByTestId('section-text-inputs')).toBeVisible();
    await expect(page.getByTestId('section-advanced-datatable')).toBeVisible();
    await expect(page.getByTestId('section-shadow-dom')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
