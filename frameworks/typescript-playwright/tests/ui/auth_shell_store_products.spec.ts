import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
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

test('[UI-AUTH-001] Login válido conserva una sesión autenticada', async ({ browser }) => {
  await labels('Authentication UI', 'UI-AUTH-001 - Login válido');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await step('Given: se abre login sin una sesión previa', () => page.goto('/login'));
    await step('When: se valida el correo y se envía la contraseña válida', async () => {
      await page.getByTestId('login-email').fill(environment.uiEmail);
      await page.getByTestId('login-continue').click();
      await expect(page.getByTestId('login-password')).toBeVisible();
      await page.getByTestId('login-password').fill(environment.uiPassword);
      await page.getByTestId('login-submit').click();
    });
    await step('Then: la aplicación abre una ruta autenticada y guarda el token', async () => {
      await expect(page).not.toHaveURL(/\/login$/);
      expect(await page.evaluate(() => localStorage.getItem('api_token'))).toBeTruthy();
    });
  } finally {
    await context.close();
  }
});

test('[UI-AUTH-002] Login inválido muestra un error trazable', async ({ browser }) => {
  await labels('Authentication UI', 'UI-AUTH-002 - Login inválido');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('/login');
    await step('When: se intenta continuar con una cuenta inexistente', async () => {
      await page.getByTestId('login-email').fill(`missing-${Date.now()}@example.invalid`);
      await page.getByTestId('login-continue').click();
    });
    await step('Then: no se crea sesión y se presenta el error', async () => {
      await expect(page.getByTestId('login-error')).toBeVisible();
      expect(await page.evaluate(() => localStorage.getItem('api_token'))).toBeNull();
      await expect(page).toHaveURL(/\/login$/);
    });
  } finally {
    await context.close();
  }
});

test('[UI-SHELL-001] Aceptar Terms Gate persiste el consentimiento', async ({ browser }) => {
  await labels('Application shell UI', 'UI-SHELL-001 - Accept Terms Gate');
  const context = await browser.newContext();
  await context.addInitScript(({ apiKey, email }) => {
    localStorage.setItem('api_token', apiKey);
    localStorage.setItem('user_email', email);
    localStorage.removeItem('qa-academy-terms-consent-v1');
  }, { apiKey: environment.apiKey, email: environment.uiEmail });
  const page = await context.newPage();
  try {
    await page.goto('/store');
    await expect(page.getByTestId('terms-gate-dialog')).toBeVisible();
    await step('When: el usuario acepta los términos', () =>
      page.getByTestId('terms-gate-accept').click());
    await step('Then: el diálogo se oculta y el consentimiento queda persistido', async () => {
      await expect(page.getByTestId('terms-gate-dialog')).toBeHidden();
      expect(await page.evaluate(() =>
        localStorage.getItem('qa-academy-terms-consent-v1'))).toBe('accepted');
    });
  } finally {
    await context.close();
  }
});

test('[UI-SHELL-002] Navegación responsive expone sidebar y drawer', async ({ page }) => {
  await labels('Application shell UI', 'UI-SHELL-002 - Responsive navigation');
  await page.goto('/store');
  await step('Then: escritorio muestra sidebar y ruta activa', async () => {
    await expect(page.getByTestId('primary-sidebar')).toBeVisible();
    await expect(page.getByTestId('desktop-nav').getByRole('link', { name: /store/i }))
      .toHaveAttribute('aria-current', 'page');
  });
  await step('When: la ventana cambia a ancho móvil', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('mobile-menu-open')).toBeVisible();
    await page.getByTestId('mobile-menu-open').click();
  });
  await step('Then: el drawer móvil permite navegar y cerrar', async () => {
    await expect(page.getByTestId('mobile-nav')).toBeVisible();
    await page.getByTestId('mobile-menu-close').click();
    await expect(page.getByTestId('mobile-nav')).toBeHidden();
  });
});

test('[UI-STORE-001] Store carga catálogo y controles', async ({ page }) => {
  await labels('Store UI', 'UI-STORE-001 - Load Store');
  await step('When: se abre el Store', () => page.goto('/store'));
  await step('Then: catálogo, búsqueda y filtros están utilizables', async () => {
    await expect(page.getByTestId('store-search')).toBeVisible();
    await expect(page.getByTestId('store-category-filter')).toBeVisible();
    await expect(page.getByTestId('store-type-filter')).toBeVisible();
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/).first()).toBeVisible();
  });
});

test('[UI-STORE-002] Store busca y filtra productos', async ({ page, productService }) => {
  await labels('Store UI', 'UI-STORE-002 - Search and filter');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('ui-store-filter'), ...teachingData.product, category: 'Office',
    });
    await page.goto('/store');
    await step('When: se busca por nombre y se filtra la categoría', async () => {
      await page.getByTestId('store-search').fill(product!.name);
      await page.getByTestId('store-category-filter').getByRole('button', { name: 'Office' }).click();
    });
    await step('Then: sólo el producto controlado permanece visible', async () => {
      await expect(page.getByTestId(`product-add-to-cart-${product!.id}`)).toBeVisible();
      await expect(page.getByTestId(/^product-add-to-cart-\d+$/)).toHaveCount(1);
    });
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-STORE-003] Store pagina respetando el tamaño seleccionado', async ({ page }) => {
  await labels('Store UI', 'UI-STORE-003 - Pagination');
  await page.goto('/store');
  await step('When: se selecciona el menor tamaño de página', async () => {
    await page.getByTestId('store-items-per-page').selectOption('5');
  });
  await step('Then: se limita el catálogo y la navegación cambia de página', async () => {
    await expect(page.getByTestId(/^product-add-to-cart-\d+$/)).toHaveCount(5);
    await expect(page.getByTestId('store-page-indicator')).toContainText('Page 1');
    await page.getByTestId('store-next').click();
    await expect(page.getByTestId('store-page-indicator')).toContainText('Page 2');
  });
});

test('[UI-PRODUCT-001] Producto propio creado queda visible en administración', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-001 - Create owned product');
  let product: Product | undefined;
  try {
    product = await step('Given: la API crea el dato controlado porque la UI no ofrece alta', () =>
      productService.createProduct({ name: uniqueProductName('ui-create'), ...teachingData.product }));
    await page.goto('/products');
    await page.getByTestId('products-search').fill(product.name);
    await step('Then: administración refleja el producto y su ID persistente', async () => {
      await expect(page.getByTestId(`product-row-${product!.id}`)).toContainText(product!.name);
    });
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-002] Producto propio editado se actualiza en administración', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-002 - Edit owned product');
  let product: Product | undefined;
  try {
    product = await productService.createProduct({
      name: uniqueProductName('ui-edit'), ...teachingData.product,
    });
    const editedName = `${product.name}-edited`;
    await step('When: la API actualiza el dato porque la UI no ofrece edición', async () => {
      const response = await page.request.patch(`/api/products/${product!.id}`, {
        headers: { Authorization: `Bearer ${environment.apiKey}` },
        data: { name: editedName },
      });
      expect(response.status()).toBe(200);
    });
    await page.goto('/products');
    await page.getByTestId('products-search').fill(editedName);
    await expect(page.getByTestId(`product-row-${product.id}`)).toContainText(editedName);
  } finally {
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-003] Producto propio se elimina desde la UI', async ({ page, productService }) => {
  await labels('Products UI', 'UI-PRODUCT-003 - Delete owned product');
  const product = await productService.createProduct({
    name: uniqueProductName('ui-delete'), ...teachingData.product,
  });
  let deleted = false;
  try {
    await page.goto('/products');
    await page.getByTestId('products-search').fill(product.name);
    await step('When: se elimina la fila persistente desde administración', async () => {
      await page.getByTestId(`product-delete-${product.id}`).click();
    });
    await step('Then: aparece confirmación y la fila desaparece', async () => {
      await expect(page.getByTestId('products-success-toast')).toBeVisible();
      await expect(page.getByTestId(`product-row-${product.id}`)).toHaveCount(0);
      deleted = true;
    });
  } finally {
    if (!deleted) await productService.deleteProduct(product.id);
  }
});

test('[UI-PRODUCT-004] Producto no eliminable mantiene protegida su fila', async ({ page }) => {
  await labels('Products UI', 'UI-PRODUCT-004 - Protected product');
  await page.goto('/products');
  await page.getByTestId('products-type-filter').getByRole('button', { name: 'Template' }).click();
  const row = page.getByTestId(/^product-row-\d+$/).first();
  await step('When: se intenta eliminar un producto de plantilla protegido', async () => {
    await expect(row).toBeVisible();
    const id = (await row.getAttribute('data-testid'))!.replace('product-row-', '');
    await page.getByTestId(`product-delete-${id}`).click();
    await expect(page.getByTestId('products-error-toast')).toBeVisible();
    await expect(page.getByTestId(`product-row-${id}`)).toBeVisible();
  });
});
