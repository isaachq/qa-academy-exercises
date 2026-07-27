import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import { CartPage } from '../../pages/cart_page.js';
import { CheckoutPage } from '../../pages/checkout_page.js';
import { StorePage } from '../../pages/store_page.js';

test('traces a product from available stock through cart reservation and purchase history', async ({
  page,
  productService,
}, testInfo) => {
  await allure.epic('Chapter 5');
  await allure.feature('UI automation');
  await allure.story('Product purchase traceability');

  const store = new StorePage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  let productId: number | undefined;
  let orderId: number | undefined;

  await productService.clearCart();
  try {
    const product = await productService.createProduct({
      name: uniqueProductName('typescript-playwright'),
      ...teachingData.product,
    });
    productId = product.id;

    await store.openProduct(product.id, product.name);
    const before = await store.readInventory(product.id);
    expect(before).toEqual({ stock: product.stock, reserved: 0, available: product.stock });

    await store.addToCart(product.id);
    const reserved = await store.readInventory(product.id);
    expect(reserved.stock).toBe(before.stock);
    expect(reserved.reserved).toBe(teachingData.purchaseQuantity);
    expect(reserved.available).toBe(before.stock - teachingData.purchaseQuantity);

    await cart.openAndVerify(product.name, teachingData.purchaseQuantity, product.price);
    await cart.proceedToCheckout();
    orderId = await checkout.placeOrder();

    await store.openProduct(product.id, product.name);
    const purchased = await store.readInventory(product.id);
    expect(purchased.stock).toBe(before.stock - teachingData.purchaseQuantity);
    expect(purchased.reserved).toBe(0);
    expect(purchased.available).toBe(purchased.stock);

    await store.openOrderHistory(product.id, orderId);
    const orderRow = page.getByTestId(`order-history-row-${orderId}`);
    await expect(orderRow).toContainText(String(teachingData.purchaseQuantity));
    await expect(orderRow).toContainText('paid');

    if (testInfo.project.name === 'mobile-chromium') {
      await store.assertMobileModalContract('order-history-modal');
    }
  } finally {
    if (orderId) await productService.deleteOrder(orderId);
    await productService.clearCart();
    if (productId) await productService.deleteProduct(productId);
  }
});
