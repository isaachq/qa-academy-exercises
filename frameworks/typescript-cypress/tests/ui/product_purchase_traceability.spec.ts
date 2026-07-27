import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { STEPS, TITLES, step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { CartPage } from '../../pages/cart_page';
import { CheckoutPage } from '../../pages/checkout_page';
import { StorePage, type Inventory } from '../../pages/store_page';
import { ProductService, type Product } from '../../services/product_service';

describe('Product purchase traceability', () => {
  const service = new ProductService();
  const store = new StorePage();
  const cart = new CartPage();
  const checkout = new CheckoutPage();
  const quantity = teachingData.purchaseQuantity;

  // Cypress aborts the command queue on the first failure, so the scenario keeps
  // its cleanup in a hook. The state below is what the hook needs to undo.
  let product: Product | undefined;
  let orderId: number | undefined;
  let before: Inventory | undefined;

  beforeEach(() => {
    product = undefined;
    orderId = undefined;
    before = undefined;
  });

  afterEach(() => {
    step(STEPS.teardownPurchase, () => {
      if (orderId) service.deleteOrder(orderId);
      service.clearCart();
      if (product) service.deleteProduct(product.id);
    });
  });

  it(TITLES.productPurchaseTraceability, () => {
    allure.epic('Chapter 5');
    allure.feature('UI automation');
    allure.story('BOOK-TEST-UI-001 - Product purchase traceability');

    step(STEPS.setupClearCart, () => {
      service.clearCart();
    });

    step(STEPS.setupCreateProduct, () => {
      service
        .createProduct({ name: uniqueProductName(), ...teachingData.product })
        .then((created) => {
          product = created;
        });
    });

    step(STEPS.openProduct, () => {
      store.openProduct(product!.id, product!.name);
    });

    step(STEPS.assertInitialInventory, () => {
      store.readInventory(product!.id).then((inventory) => {
        before = inventory;
        expect(inventory).to.deep.eq({
          stock: product!.stock,
          reserved: 0,
          available: product!.stock,
        });
      });
    });

    step(STEPS.addToCart, () => {
      store.addToCart(product!.id);
    });

    step(STEPS.assertReservedInventory, () => {
      store.expectReserved(product!.id, quantity);
      store.readInventory(product!.id).then((reserved) => {
        expect(reserved).to.deep.eq({
          stock: before!.stock,
          reserved: quantity,
          available: before!.stock - quantity,
        });
      });
    });

    step(STEPS.openCart, () => {
      cart.open();
    });

    step(STEPS.assertCartContent, () => {
      cart.expectItem(product!.name, quantity, product!.price);
    });

    step(STEPS.proceedToCheckout, () => {
      cart.proceedToCheckout();
    });

    step(STEPS.placeOrder, () => {
      checkout.placeOrder().then((id) => {
        orderId = id;
      });
    });

    step(STEPS.reopenProduct, () => {
      store.openProduct(product!.id, product!.name);
    });

    step(STEPS.assertPurchasedInventory, () => {
      store.readInventory(product!.id).then((purchased) => {
        expect(purchased).to.deep.eq({
          stock: before!.stock - quantity,
          reserved: 0,
          available: before!.stock - quantity,
        });
      });
    });

    step(STEPS.openOrderHistory, () => {
      store.openOrderHistory(product!.id);
    });

    step(STEPS.assertOrderHistory, () => {
      store.expectOrderRow(orderId!, quantity, 'paid');
    });

    if (Cypress.env('deviceProfile') === 'mobile') {
      step(STEPS.assertMobileModal, () => {
        store.expectMobileModalContract();
      });
    }
  });
});
