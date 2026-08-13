import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { STEPS, TITLES, step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import { CartPage } from '../../pages/cart_page.js';
import { CheckoutPage } from '../../pages/checkout_page.js';
import { StorePage, type Inventory } from '../../pages/store_page.js';
import type { Product } from '../../services/product_service.js';

test(TITLES.productPurchaseTraceability, async ({ page, productService }, testInfo) => {
  await allure.epic('Chapter 5');
  await allure.feature('UI automation');
  await allure.story('BOOK-TEST-UI-001 - Product purchase traceability');

  const store = new StorePage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  const quantity = teachingData.purchaseQuantity;
  let product: Product | undefined;
  let orderId: number | undefined;
  let before: Inventory | undefined;

  await step(STEPS.setupClearCart, () => productService.clearCart());
  try {
    product = await step(STEPS.setupCreateProduct, () =>
      productService.createProduct({
        name: uniqueProductName('typescript-playwright'),
        ...teachingData.product,
      }),
    );

    await step(STEPS.openProduct, () => store.openProduct(product!.id, product!.name));

    before = await step(STEPS.assertInitialInventory, async () => {
      const inventory = await store.readInventory(product!.id);
      expect(inventory).toEqual({
        stock: product!.stock,
        reserved: 0,
        available: product!.stock,
      });
      return inventory;
    });

    await step(STEPS.addToCart, () => store.addToCart(product!.id));

    await step(STEPS.assertReservedInventory, async () => {
      await store.expectReserved(product!.id, quantity);
      const reserved = await store.readInventory(product!.id);
      expect(reserved).toEqual({
        stock: before!.stock,
        reserved: quantity,
        available: before!.stock - quantity,
      });
    });

    await step(STEPS.openCart, () => cart.open());
    await step(STEPS.assertCartContent, () =>
      cart.expectItem(product!.name, quantity, product!.price),
    );
    await step(STEPS.proceedToCheckout, () => cart.proceedToCheckout());

    orderId = await step(STEPS.placeOrder, () => checkout.placeOrder());

    await step(STEPS.reopenProduct, () => store.openProduct(product!.id, product!.name));

    await step(STEPS.assertPurchasedInventory, async () => {
      const purchased = await store.readInventory(product!.id);
      expect(purchased).toEqual({
        stock: before!.stock - quantity,
        reserved: 0,
        available: before!.stock - quantity,
      });
    });

    await step(STEPS.openOrderHistory, () => store.openOrderHistory(product!.id));
    await step(STEPS.assertOrderHistory, () =>
      store.expectOrderRow(orderId!, quantity, 'paid'),
    );

    if (testInfo.project.name === 'mobile-chromium') {
      await step(STEPS.assertMobileModal, () =>
        store.expectMobileModalContract('order-history-modal'),
      );
    }
  } finally {
    await step(STEPS.teardownPurchase, async () => {
      if (orderId) await productService.deleteOrder(orderId);
      await productService.clearCart();
      if (product) await productService.deleteProduct(product.id);
    });
  }
});
