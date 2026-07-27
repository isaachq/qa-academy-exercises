import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import { CheckoutPage } from '../../pages/checkout_page.js';
import type { ControlledOrder } from '../../services/order_service.js';
import type { Product } from '../../services/product_service.js';

const apiHeaders = () => ({ Authorization: `Bearer ${environment.apiKey}` });

async function labels(feature: string, story: string) {
  await allure.epic('Chapter 5');
  await allure.feature(feature);
  await allure.story(story);
}

async function createCartProduct(
  page: import('@playwright/test').Page,
  productService: import('../../services/product_service.js').ProductService,
  tag: string,
) {
  await productService.clearCart();
  const product = await productService.createProduct({
    name: uniqueProductName(tag), ...teachingData.product, stock: 10,
  });
  await page.goto('/store');
  await page.getByTestId('store-search').fill(product.name);
  const response = page.waitForResponse((r) =>
    new URL(r.url()).pathname === '/api/cart' && r.request().method() === 'POST');
  await page.getByTestId(`product-add-to-cart-${product.id}`).click();
  expect((await response).status()).toBe(201);
  return product;
}

test('[UI-CART-001] Agregar producto actualiza carrito y badge', async ({ page, productService }) => {
  await labels('Cart UI', 'UI-CART-001 - Add product');
  let product: Product | undefined;
  try {
    product = await step('Given: existe un producto controlado y el carrito está vacío', () =>
      createCartProduct(page, productService, 'ui-cart-add'));
    await step('Then: el badge y el carrito muestran la misma unidad', async () => {
      await expect(page.getByTestId('header-cart-count')).toHaveText('1');
      await page.goto('/cart');
      const item = page.getByTestId(/^cart-item-\d+$/).filter({ hasText: product!.name });
      await expect(item).toBeVisible();
      await expect(item.getByTestId(/^cart-quantity-\d+$/)).toHaveText('1');
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CART-002] Cambiar cantidad recalcula el subtotal', async ({ page, productService }) => {
  await labels('Cart UI', 'UI-CART-002 - Change quantity');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-cart-quantity');
    await page.goto('/cart');
    const item = page.getByTestId(/^cart-item-\d+$/).filter({ hasText: product.name });
    const id = (await item.getAttribute('data-testid'))!.replace('cart-item-', '');
    await step('When: se incrementa la cantidad del item persistente', () =>
      page.getByTestId(`cart-increase-${id}`).click());
    await step('Then: cantidad y subtotal se recalculan', async () => {
      await expect(page.getByTestId(`cart-quantity-${id}`)).toHaveText('2');
      await expect(page.getByTestId('cart-subtotal')).toContainText((product!.price * 2).toFixed(2));
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CART-003] Eliminar usa diálogo nativo y quita el item confirmado', async ({ page, productService }) => {
  await labels('Cart UI', 'UI-CART-003 - Native delete dialog');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-cart-remove');
    await page.goto('/cart');
    const item = page.getByTestId(/^cart-item-\d+$/).filter({ hasText: product.name });
    const id = (await item.getAttribute('data-testid'))!.replace('cart-item-', '');
    const dialog = page.waitForEvent('dialog');
    await page.getByTestId(`cart-remove-${id}`).click();
    const confirmation = await dialog;
    await step('Then: el diálogo contiene el contrato esperado y se acepta', async () => {
      expect(confirmation.type()).toBe('confirm');
      expect(confirmation.message()).toContain('Remove this item from cart?');
      await confirmation.accept();
      await expect(page.getByTestId(`cart-item-${id}`)).toHaveCount(0);
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CART-004] Vaciar carrito confirma y presenta estado vacío', async ({ page, productService }) => {
  await labels('Cart UI', 'UI-CART-004 - Clear cart');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-cart-clear');
    await page.goto('/cart');
    const dialog = page.waitForEvent('dialog');
    await step('When: se solicita vaciar el carrito', () => page.getByTestId('cart-clear').click());
    const confirmation = await dialog;
    expect(confirmation.message()).toContain('Clear entire cart?');
    await confirmation.accept();
    await step('Then: se presenta el estado vacío y desaparece el badge', async () => {
      await expect(page.getByTestId('cart-empty-state')).toBeVisible();
      await expect(page.getByTestId('header-cart-count')).toHaveCount(0);
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CHECKOUT-001] Checkout muestra todas las validaciones requeridas', async ({ page, productService }) => {
  await labels('Checkout UI', 'UI-CHECKOUT-001 - Required validation');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-checkout-required');
    await page.goto('/checkout');
    await step('Then: los campos vacíos exponen errores y bloquean el submit', async () => {
      for (const key of ['fullname', 'email', 'address', 'city', 'state', 'zip', 'card', 'expiry', 'cvv']) {
        await expect(page.getByTestId(`checkout-${key}-error`)).toBeVisible();
      }
      await expect(page.getByTestId('checkout-submit')).toBeDisabled();
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CHECKOUT-002] Checkout rechaza límites y valores inválidos', async ({ page, productService }) => {
  await labels('Checkout UI', 'UI-CHECKOUT-002 - Boundaries and negatives');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-checkout-boundary');
    await page.goto('/checkout');
    await step('When: se introducen caracteres, formatos y límites inválidos', async () => {
      await page.getByTestId('checkout-fullname').fill('Invalid@Name');
      await page.getByTestId('checkout-email').fill('not-an-email');
      await page.getByTestId('checkout-zip').fill('-1');
      await page.getByTestId('checkout-card-number').fill('123');
      await page.getByTestId('checkout-expiry').fill('1399');
      await page.getByTestId('checkout-cvv').fill('1');
    });
    await step('Then: cada límite produce un error específico', async () => {
      await expect(page.getByTestId('checkout-fullname-error')).toContainText('only');
      await expect(page.getByTestId('checkout-email-error')).toContainText('invalid');
      await expect(page.getByTestId('checkout-zip-error')).toContainText('numeric');
      await expect(page.getByTestId('checkout-card-error')).toContainText('15-16');
      await expect(page.getByTestId('checkout-expiry-error')).toContainText('month');
      await expect(page.getByTestId('checkout-cvv-error')).toContainText('3-4');
    });
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CHECKOUT-003] Checkout crea orden y abre su detalle', async ({ page, productService }) => {
  await labels('Checkout UI', 'UI-CHECKOUT-003 - Create order');
  let product: Product | undefined;
  let orderId: number | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-checkout-order');
    await page.goto('/checkout');
    orderId = await step('When: se completan datos de prueba y se envía la orden', () =>
      new CheckoutPage(page).placeOrder());
    await step('Then: el detalle presenta ID, total e item persistidos', async () => {
      await expect(page.getByTestId('order-detail-id')).toContainText(String(orderId));
      await expect(page.getByTestId('order-detail-items')).toContainText(product!.name);
      await expect(page.getByTestId('order-detail-total')).toBeVisible();
    });
  } finally {
    if (orderId) await productService.deleteOrder(orderId);
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-CHECKOUT-004] Modal de impuestos permanece dentro del viewport responsive', async ({ page, productService }) => {
  await labels('Checkout UI', 'UI-CHECKOUT-004 - Responsive modal');
  let product: Product | undefined;
  try {
    product = await createCartProduct(page, productService, 'ui-checkout-modal');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/checkout');
    await page.getByTestId('checkout-more-about-shipping-taxes').click();
    const modal = page.getByTestId('tax-shipping-dialog');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.height).toBeLessThanOrEqual(844);
    await page.getByTestId('tax-shipping-close').click();
    await expect(modal).toBeHidden();
  } finally {
    await productService.clearCart();
    if (product) await productService.deleteProduct(product.id);
  }
});

test('[UI-ORDER-001] Abrir detalle muestra contenido y navegación completa', async ({ page, orderService }) => {
  await labels('Orders UI', 'UI-ORDER-001 - Open detail');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('ui-order-detail');
    await page.goto('/orders');
    await page.getByTestId('orders-search').fill(String(controlled.order.id));
    await page.getByTestId(`order-view-${controlled.order.id}`).click();
    await step('Then: el modal corresponde a la orden y abre la página completa', async () => {
      await expect(page.getByTestId('order-modal')).toBeVisible();
      await expect(page.getByTestId('order-modal')).toContainText(String(controlled!.order.id));
      await page.getByTestId('order-modal-open-page').click();
      await expect(page).toHaveURL(new RegExp(`/orders/${controlled!.order.id}$`));
      await expect(page.getByTestId('order-detail-id')).toContainText(String(controlled!.order.id));
    });
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[UI-ORDER-002] Historial busca y filtra una orden controlada', async ({ page, orderService }) => {
  await labels('Orders UI', 'UI-ORDER-002 - Search and filter');
  let controlled: ControlledOrder | undefined;
  try {
    controlled = await orderService.createControlledOrder('ui-order-filter', 'paid');
    await page.goto('/orders');
    await step('When: se busca el ID y se filtra por estado', async () => {
      await page.getByTestId('orders-search').fill(String(controlled!.order.id));
      await page.getByTestId('orders-status-filter').selectOption(controlled!.order.payment_status);
    });
    await step('Then: sólo aparece la orden controlada', async () => {
      await expect(page.getByTestId(`order-row-id-${controlled!.order.id}`)).toBeVisible();
      await expect(page.getByTestId(/^order-row-id-\d+$/)).toHaveCount(1);
    });
  } finally {
    await orderService.cleanup(controlled);
  }
});

test('[UI-ORDER-003] Historial pagina de forma estable', async ({ page }) => {
  await labels('Orders UI', 'UI-ORDER-003 - Paginate history');
  await page.goto('/orders');
  await page.getByTestId('orders-items-per-page').selectOption('10');
  await step('Then: la primera página respeta el límite', async () => {
    await expect(page.getByTestId(/^order-row-id-\d+$/)).toHaveCount(10);
    await expect(page.getByTestId('orders-page-indicator')).toContainText('Page 1');
  });
  await step('When: se avanza, el indicador cambia y volver restaura la página', async () => {
    await page.getByTestId('orders-next').click();
    await expect(page.getByTestId('orders-page-indicator')).toContainText('Page 2');
    await page.getByTestId('orders-prev').click();
    await expect(page.getByTestId('orders-page-indicator')).toContainText('Page 1');
  });
});
