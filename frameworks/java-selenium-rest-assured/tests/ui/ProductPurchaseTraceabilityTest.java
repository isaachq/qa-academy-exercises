package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;

import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.Steps;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;
import pages.CartPage;
import pages.CheckoutPage;
import pages.StorePage;
import services.ProductService;

@Epic("Chapter 5")
@Feature("UI automation")
@Story("Product purchase traceability")
class ProductPurchaseTraceabilityTest {
    @DisplayName(Steps.Titles.PRODUCT_PURCHASE_TRACEABILITY)
    @ParameterizedTest(name = Steps.Titles.PRODUCT_PURCHASE_TRACEABILITY + " [mobile={0}]")
    @ValueSource(booleans = {false, true})
    void tracesStockThroughCartAndOrderHistory(boolean mobile) {
        ProductService service = new ProductService();
        WebDriver driver = AuthenticatedBrowser.create(mobile);
        StorePage store = new StorePage(driver);
        CartPage cart = new CartPage(driver);
        CheckoutPage checkout = new CheckoutPage(driver);
        int quantity = TestData.PURCHASE_QUANTITY;
        Integer productId = null;
        Integer orderId = null;

        Steps.step(Steps.Scenario.SETUP_CLEAR_CART, service::clearCart);
        try {
            Map<String, Object> product = Steps.stepReturning(
                    Steps.Scenario.SETUP_CREATE_PRODUCT,
                    () -> service.createProduct(
                            ProductService.newProduct(UniqueName.product(), TestData.PRODUCT)));
            productId = ((Number) product.get("id")).intValue();
            int initialStock = ((Number) product.get("stock")).intValue();
            String productName = product.get("name").toString();
            int finalProductId = productId;

            Steps.step(Steps.Scenario.OPEN_PRODUCT,
                    () -> store.openProduct(finalProductId, productName));

            Steps.step(Steps.Scenario.ASSERT_INITIAL_INVENTORY, () -> assertEquals(
                    Map.of("stock", initialStock, "reserved", 0, "available", initialStock),
                    store.readInventory(finalProductId)));

            Steps.step(Steps.Scenario.ADD_TO_CART, () -> store.addToCart(finalProductId));

            Steps.step(Steps.Scenario.ASSERT_RESERVED_INVENTORY, () -> {
                store.expectReserved(finalProductId, quantity);
                assertEquals(Map.of("stock", initialStock, "reserved", quantity,
                        "available", initialStock - quantity),
                        store.readInventory(finalProductId));
            });

            Steps.step(Steps.Scenario.OPEN_CART, cart::openCart);

            Steps.step(Steps.Scenario.ASSERT_CART_CONTENT, () -> cart.expectItem(productName,
                    quantity, ((Number) product.get("price")).doubleValue()));

            Steps.step(Steps.Scenario.PROCEED_TO_CHECKOUT, cart::proceedToCheckout);

            orderId = Steps.stepReturning(Steps.Scenario.PLACE_ORDER, checkout::placeOrder);
            int finalOrderId = orderId;

            Steps.step(Steps.Scenario.REOPEN_PRODUCT,
                    () -> store.openProduct(finalProductId, productName));

            Steps.step(Steps.Scenario.ASSERT_PURCHASED_INVENTORY, () -> assertEquals(
                    Map.of("stock", initialStock - quantity, "reserved", 0,
                            "available", initialStock - quantity),
                    store.readInventory(finalProductId)));

            Steps.step(Steps.Scenario.OPEN_ORDER_HISTORY,
                    () -> store.openOrderHistory(finalProductId));

            Steps.step(Steps.Scenario.ASSERT_ORDER_HISTORY,
                    () -> store.expectOrderRow(finalOrderId, quantity, "paid"));

            if (mobile) {
                Steps.step(Steps.Scenario.ASSERT_MOBILE_MODAL, store::expectMobileModalContract);
            }
        } finally {
            Integer createdProductId = productId;
            Integer createdOrderId = orderId;
            Steps.step(Steps.Scenario.TEARDOWN_PURCHASE, () -> {
                if (createdOrderId != null) service.deleteOrder(createdOrderId);
                service.clearCart();
                if (createdProductId != null) service.deleteProduct(createdProductId);
                driver.quit();
            });
        }
    }
}
