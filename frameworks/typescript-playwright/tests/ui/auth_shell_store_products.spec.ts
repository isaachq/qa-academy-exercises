import { allure } from 'allure-playwright';
import { environment, vercelAutomationHeaders } from '../../config/environment.js';
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

test('[UI-AUTH-001] Valid login preserves an authenticated session', async ({ browser }) => {
  await labels('Authentication UI', 'UI-AUTH-001 - Valid login');
  const context = await browser.newContext({ extraHTTPHeaders: vercelAutomationHeaders() });
  // Seed the Vercel bypass cookie so the application's own XHRs reuse it,
  // mirroring the cy.request pre-seed that the Cypress beforeEach performs.
  await context.request.get(environment.baseUrl, { failOnStatusCode: false });
  await context.addInitScript(() => {
    localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
  });
  const page = await context.newPage();
  try {
    await step('Given: login opens without a previous session', () => page.goto('/login'));
    await step('When: user validates the email and submits the valid password', async () => {
      await page.getByTestId('login-email').fill(environment.uiEmail);
      await page.getByTestId('login-continue').click();
      await expect(page.getByTestId('login-password')).toBeVisible();
      // Use pressSequentially to fire individual keyboard events so that the
      // application's React controlled input updates its state correctly before
      // the form is submitted (matching Cypress's type('{selectall}{del}…') pattern).
      await page.getByTestId('login-password').pressSequentially(environment.uiPassword);
      await page.getByTestId('login-submit').click();
    });
    await step('Then: the application opens an authenticated route and stores the token', async () => {
      await expect(page).not.toHaveURL(/\/login$/);
      expect(await page.evaluate(() => localStorage.getItem('api_token'))).toBeTruthy();
    });
  } finally {
    await context.close();
  }
});

test('[UI-AUTH-002] Invalid login displays a traceable error', async ({ browser }) => {
  await labels('Authentication UI', 'UI-AUTH-002 - Invalid login');
  const context = await browser.newContext({ extraHTTPHeaders: vercelAutomationHeaders() });
  await context.addInitScript(() => {
    localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
  });
  const page = await context.newPage();
  try {
    await page.goto('/login');
    await step('When: user attempts to continue with a nonexistent account', async () => {
      await page.getByTestId('login-email').fill(`missing-${Date.now()}@example.invalid`);
      await page.getByTestId('login-continue').click();
    });
    await step('Then: no session is created and an error is displayed', async () => {
      await expect(page.getByTestId('login-error')).toBeVisible();
      expect(await page.evaluate(() => localStorage.getItem('api_token'))).toBeNull();
      await expect(page).toHaveURL(/\/login$/);
    });
  } finally {
    await context.close();
  }
});

test('[UI-SHELL-001] Accepting the Terms Gate persists consent', async ({ browser }) => {
  await labels('Application shell UI', 'UI-SHELL-001 - Accept Terms Gate');
  const context = await browser.newContext({ extraHTTPHeaders: vercelAutomationHeaders() });
  await context.addInitScript(({ apiKey, email }) => {
    localStorage.setItem('api_token', apiKey);
    localStorage.setItem('user_email', email);
    localStorage.removeItem('qa-academy-terms-consent-v1');
  }, { apiKey: environment.apiKey, email: environment.uiEmail });
  const page = await context.newPage();
  try {
    await page.goto('/store');
    await expect(page.getByTestId('terms-gate-dialog')).toBeVisible();
    await step('When: user accepts the terms', () =>
      page.getByTestId('terms-gate-accept').click());
    await step('Then: the dialog closes and consent remains persisted', async () => {
      await expect(page.getByTestId('terms-gate-dialog')).toBeHidden();
      expect(await page.evaluate(() =>
        localStorage.getItem('qa-academy-terms-consent-v1'))).toBe('accepted');
    });
  } finally {
    await context.close();
  }
});

test('[UI-SHELL-002] Responsive navigation exposes the sidebar and drawer', async ({ page }) => {
  await labels('Application shell UI', 'UI-SHELL-002 - Responsive navigation');
  await page.goto('/store');
  await step('Then: desktop shows the sidebar and active route', async () => {
    await expect(page.getByTestId('primary-sidebar')).toBeVisible();
    await expect(page.getByTestId('desktop-nav').getByRole('link', { name: /store/i }))
      .toHaveAttribute('aria-current', 'page');
  });
  await step('When: viewport changes to mobile width', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('mobile-menu-open')).toBeVisible();
    await page.getByTestId('mobile-menu-open').click();
  });
  await step('Then: the mobile drawer can be opened and closed', async () => {
    await expect(page.getByTestId('mobile-nav')).toBeVisible();
    await page.getByTestId('mobile-menu-close').click();
    await expect(page.getByTestId('mobile-nav')).toBeHidden();
  });
});

test('[UI-STORE-001] Store loads its catalog and controls', async ({ page }) => {
  await labels('Store UI', 'UI-STORE-001 - Load Store');
  await step('When: user opens the Store', () => page.goto('/store'));
  await step('Then: catalog, search and filters are usable', async () => {
    await expect(page.getByTestId('store-search')).toBeVisible();
    await expect(page.getByTestId('store-category-filter')).toBeVisible();
    await expect(page.getByTestId('store-type-filter')).toBeVisible();
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/).first()).toBeVisible();
  });
});

test('[UI-STORE-002] Store searches and filters products', async ({ page, productService }) => {
  await labels('Store UI', 'UI-STORE-002 - Search and filter');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('ui-store-filter'), ...teachingData.product, category: 'Office',
    });
    await page.goto('/store');
    await step('When: user searches by name and filters the category', async () => {
      await page.getByTestId('store-search').fill(product!.name);
      await page.getByTestId('store-category-filter').getByRole('button', { name: 'Office' }).click();
    });
    await step('Then: only the controlled product remains visible', async () => {
      await expect(page.getByTestId(`product-add-to-cart-${product!.id}`)).toBeVisible();
      await expect(page.getByTestId(/^product-add-to-cart-\d+$/)).toHaveCount(1);
    });
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-STORE-003] Store paginates using the selected page size', async ({ page }) => {
  await labels('Store UI', 'UI-STORE-003 - Pagination');
  await page.goto('/store');
  await expect(page.getByTestId(/^product-add-to-cart-\d+$/).first()).toBeVisible();
  await step('When: user selects the smallest page size', async () => {
    const pageResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === '/api/products'
        && url.searchParams.get('limit') === '5'
        && response.request().method() === 'GET';
    });
    await page.getByTestId('store-items-per-page').selectOption('5');
    const response = await pageResponse;
    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data.length).toBeLessThanOrEqual(5);
  });
  await step('Then: the catalog is limited and navigation changes page', async () => {
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/)).toHaveCount(5);
    await expect(page.getByTestId('store-page-indicator')).toContainText('Page 1');
    await page.getByTestId('store-next').click();
    await expect(page.getByTestId('store-page-indicator')).toContainText('Page 2');
  });
});

test('[UI-PRODUCT-001] A newly created owned product is visible in administration', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-001 - Create owned product');
  let product: Product | undefined;
  try {
    product = await step('Given: API creates controlled data because the UI has no create control', () =>
      productService.createProduct({ name: uniqueProductName('ui-create'), ...teachingData.product }));
    await page.goto('/products');
    await page.getByTestId('products-search').fill(product.name);
    await step('Then: administration displays the product and its persistent ID', async () => {
      await expect(page.getByTestId(`product-row-${product!.id}`)).toContainText(product!.name);
    });
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-002] An edited owned product is updated in administration', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-002 - Edit owned product');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('ui-edit'), ...teachingData.product,
    });
    const editedName = `${product.name}-edited`;
    await step('When: API updates controlled data because the UI has no edit control', async () => {
      const updated = await productService.updateProduct(product!.id, { name: editedName });
      expect(updated.name).toBe(editedName);
    });
    await page.goto('/products');
    await page.getByTestId('products-search').fill(editedName);
    await expect(page.getByTestId(`product-row-${product.id}`)).toContainText(editedName);
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-003] An owned product is deleted from the UI', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-003 - Delete owned product');
  const product = await productService.createProduct({
    name: uniqueProductName('ui-delete'), ...teachingData.product,
  });
  let deleted = false;
  try {
    await page.goto('/products');
    await page.getByTestId('products-search').fill(product.name);
    await step('When: user deletes the persistent row from administration', async () => {
      await page.getByTestId(`product-delete-${product.id}`).click();
    });
    await step('Then: confirmation appears and the row disappears', async () => {
      await expect(page.getByTestId('products-success-toast')).toBeVisible();
      await expect(page.getByTestId(`product-row-${product.id}`)).toHaveCount(0);
      deleted = true;
    });
  } finally {
    if (!deleted) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-004] A non-deletable product keeps its row protected', async ({ page }) => {
  await labels('Products UI', 'UI-PRODUCT-004 - Protected product');
  await page.goto('/products');
  await expect(page.getByTestId('products-table')).toBeVisible();
  await page.getByTestId('products-type-filter').getByRole('button', { name: 'Template' }).click();
  const row = page.getByTestId(/^product-row-\d+$/).first();
  await step('When: user attempts to delete a protected template product', async () => {
    await expect(row).toBeVisible();
    const id = (await row.getAttribute('data-testid'))!.replace('product-row-', '');
    await page.getByTestId(`product-delete-${id}`).click({ force: true });
    await expect(page.getByTestId('products-error-toast')).toBeVisible();
    await expect(page.getByTestId(`product-row-${id}`)).toBeVisible();
  });
});
