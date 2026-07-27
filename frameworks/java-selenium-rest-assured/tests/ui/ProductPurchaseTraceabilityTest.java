package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.util.Map;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import pages.CartPage;
import pages.CheckoutPage;
import pages.StorePage;
import services.ProductService;

@Epic("Chapter 5")
@Feature("UI automation")
@Story("Product purchase traceability")
class ProductPurchaseTraceabilityTest {
    @ParameterizedTest(name = "mobile={0}")
    @ValueSource(booleans = {false, true})
    void tracesStockThroughCartAndOrderHistory(boolean mobile) {
        ProductService service = new ProductService();
        WebDriver driver = AuthenticatedBrowser.create(mobile);
        Integer productId = null;
        Integer orderId = null;
        service.clearCart();
        try {
            Map<String, Object> product = service.createProduct(
                    ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            productId = ((Number) product.get("id")).intValue();
            int initialStock = ((Number) product.get("stock")).intValue();
            StorePage store = new StorePage(driver);
            CartPage cart = new CartPage(driver);
            CheckoutPage checkout = new CheckoutPage(driver);
            store.openProduct(productId, product.get("name").toString());
            assertEquals(Map.of("stock", initialStock, "reserved", 0, "available", initialStock),
                    store.readInventory(productId));
            store.addToCart(productId);
            assertEquals(Map.of("stock", initialStock, "reserved", TestData.PURCHASE_QUANTITY,
                    "available", initialStock - TestData.PURCHASE_QUANTITY),
                    store.readInventory(productId));
            cart.openAndVerify(product.get("name").toString(), TestData.PURCHASE_QUANTITY,
                    ((Number) product.get("price")).doubleValue());
            cart.proceedToCheckout();
            orderId = checkout.placeOrder();
            store.openProduct(productId, product.get("name").toString());
            assertEquals(Map.of("stock", initialStock - 1, "reserved", 0,
                    "available", initialStock - 1), store.readInventory(productId));
            WebElement row = store.openOrderHistory(productId, orderId);
            assertTrue(row.getText().contains(String.valueOf(TestData.PURCHASE_QUANTITY)));
            assertTrue(row.getText().toLowerCase().contains("paid"));
            if (mobile) store.assertMobileModalContract();
        } finally {
            if (orderId != null) service.deleteOrder(orderId);
            service.clearCart();
            if (productId != null) service.deleteProduct(productId);
            driver.quit();
        }
    }
}
