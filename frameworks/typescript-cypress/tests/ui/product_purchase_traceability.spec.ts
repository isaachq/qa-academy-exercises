import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { uniqueProductName } from '../../helpers/unique_name';
import { CartPage } from '../../pages/cart_page';
import { CheckoutPage } from '../../pages/checkout_page';
import { StorePage } from '../../pages/store_page';
import { ProductService, type Product } from '../../services/product_service';

describe('Product purchase traceability', () => {
  const service = new ProductService();
  let product: Product | undefined;
  let orderId: number | undefined;

  beforeEach(() => {
    product = undefined;
    orderId = undefined;
    service.clearCart();
  });

  afterEach(() => {
    if (orderId) service.deleteOrder(orderId);
    service.clearCart();
    if (product) service.deleteProduct(product.id);
  });

  it('traces stock through reservation, checkout and order history', () => {
    allure.epic('Chapter 5');
    allure.feature('UI automation');
    allure.story('Product purchase traceability');
    const store = new StorePage();
    const cart = new CartPage();
    const checkout = new CheckoutPage();
    service.createProduct({ name: uniqueProductName(), ...teachingData.product }).then((created) => {
      product = created;
      store.openProduct(created.id, created.name);
      return store.readInventory(created.id);
    }).then((before) => {
      expect(before).to.deep.eq({ stock: product!.stock, reserved: 0, available: product!.stock });
      store.addToCart(product!.id);
      return store.readInventory(product!.id).then((reserved) => ({ before, reserved }));
    }).then(({ before, reserved }) => {
      expect(reserved.stock).to.eq(before.stock);
      expect(reserved.reserved).to.eq(teachingData.purchaseQuantity);
      expect(reserved.available).to.eq(before.stock - teachingData.purchaseQuantity);
      cart.openAndVerify(product!.name, teachingData.purchaseQuantity, product!.price);
      cart.proceedToCheckout();
      return checkout.placeOrder().then((id) => { orderId = id; return before; });
    }).then((before) => {
      store.openProduct(product!.id, product!.name);
      return store.readInventory(product!.id).then((purchased) => ({ before, purchased }));
    }).then(({ before, purchased }) => {
      expect(purchased).to.deep.eq({
        stock: before.stock - teachingData.purchaseQuantity,
        reserved: 0,
        available: before.stock - teachingData.purchaseQuantity,
      });
      store.openOrderHistory(product!.id, orderId!);
      cy.get(`[data-testid="order-history-row-${orderId}"]`)
        .invoke('text')
        .should('include', String(teachingData.purchaseQuantity))
        .and('include', 'paid');
    });
  });
});
