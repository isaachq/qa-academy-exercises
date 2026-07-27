import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
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

test('[UI-QUERY-001] Query Lab consulta productos con documento visible', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-001 - Query products');
  await openLab(page);
  await step('When: se configuran filtros y se ejecuta QUERY de productos', async () => {
    await page.getByTestId('query-lab-search').fill('a');
    await page.getByTestId('query-lab-sort-field').selectOption('price');
    await page.getByTestId('query-lab-sort-direction').selectOption('asc');
    await runLab(page);
  });
  await step('Then: preview, transporte, tabla y metadata son coherentes', async () => {
    await expect(page.getByTestId('query-lab-preview-code')).toContainText('QUERY');
    await expect(page.getByTestId('query-lab-status-badge')).toContainText('200');
    await expect(page.getByTestId('query-lab-transport-badge')).toContainText('QUERY');
    await expect(page.getByTestId('query-lab-table')).toBeVisible();
  });
});

test('[UI-QUERY-002] Query Lab consulta órdenes y usa el campo total', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-002 - Query orders');
  await openLab(page);
  await step('When: se cambia a órdenes y se ordena por total', async () => {
    await page.getByTestId('query-lab-resource-orders').click();
    await page.getByTestId('query-lab-sort-field').selectOption('total');
    await runLab(page);
  });
  await step('Then: resultados y encabezado usan total, no total_amount', async () => {
    await expect(page.getByTestId('query-lab-transport-badge')).toContainText('QUERY');
    await expect(page.getByTestId('query-lab-th-total')).toBeVisible();
    await expect(page.getByTestId('query-lab-results')).not.toContainText('total_amount');
  });
});

test('[UI-QUERY-003] Query Lab cambia al transporte POST override', async ({ page }) => {
  await labels('Query Lab UI', 'UI-QUERY-003 - Change transport');
  await openLab(page);
  await step('When: se selecciona POST con X-HTTP-Method-Override', async () => {
    await page.getByTestId('query-lab-transport-override').click();
    await expect(page.getByTestId('query-lab-preview-code'))
      .toContainText('X-HTTP-Method-Override: QUERY');
    await runLab(page);
  });
  await step('Then: la respuesta identifica POST_OVERRIDE', async () => {
    await expect(page.getByTestId('query-lab-transport-badge')).toContainText('POST_OVERRIDE');
  });
});

test('[UI-QUERY-004] Query Lab expone loading vacío error y cooldown', async ({ page }) => {
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
  await step('When: una consulta real permanece en vuelo', async () => {
    await page.getByTestId('query-lab-run').click();
    await expect(page.getByTestId('query-lab-loading')).toBeVisible();
    await expect(page.getByTestId('query-lab-loading')).toBeHidden();
  });
  await step('Then: inicia el cooldown accesible', async () => {
    await expect(page.getByTestId('query-lab-cooldown-toast')).toBeVisible();
    await expect(page.getByTestId('query-lab-run')).toBeDisabled();
    await expect(page.getByTestId('query-lab-run')).toBeEnabled({ timeout: 5_000 });
  });
  await step('When: una búsqueda no coincide, aparece el estado vacío', async () => {
    await page.getByTestId('query-lab-search').fill(`no-result-${Date.now()}`);
    await runLab(page);
    await expect(page.getByTestId('query-lab-no-results')).toBeVisible();
    await expect(page.getByTestId('query-lab-run')).toBeEnabled({ timeout: 5_000 });
  });
  await step('When: el rango es inválido, el error del servidor es visible', async () => {
    await page.getByTestId('query-lab-search').fill('');
    await page.getByTestId('query-lab-price-min').fill('100');
    await page.getByTestId('query-lab-price-max').fill('1');
    await runLab(page);
    await expect(page.getByTestId('query-lab-error')).toBeVisible();
  });
});

test('[UI-MOBILE-001] Store se adapta a viewport móvil sin desbordamiento', async ({ page }) => {
  await labels('Mobile UI', 'UI-MOBILE-001 - Responsive Store');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/store');
  await step('Then: controles principales y tarjetas caben en el viewport', async () => {
    await expect(page.getByTestId('mobile-menu-open')).toBeVisible();
    await expect(page.getByTestId('store-search')).toBeVisible();
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/).first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});

test('[UI-MOBILE-002] Carrito y modal conservan contrato responsive', async ({ page, productService }) => {
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
    await page.getByTestId(`product-add-to-cart-${product.id}`).click();
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

test('[UI-MOBILE-003] Playground mantiene sus secciones utilizables en móvil', async ({ page }) => {
  await labels('Mobile UI', 'UI-MOBILE-003 - Responsive Playground');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/playground');
  await step('Then: controles iniciales, tabla y Shadow DOM no generan desbordamiento global', async () => {
    await expect(page.getByTestId('section-text-inputs')).toBeVisible();
    await expect(page.getByTestId('section-advanced-datatable')).toBeVisible();
    await expect(page.getByTestId('section-shadow-dom')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
