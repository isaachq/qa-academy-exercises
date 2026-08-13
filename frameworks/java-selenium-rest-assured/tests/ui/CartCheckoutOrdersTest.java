package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.Steps;
import helpers.Ui;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.CheckoutPage;
import services.OrderService;
import services.ProductService;

@Epic("Chapter 5")
@Tag("extended")
@Feature("Cart, Checkout & Orders UI")
public class CartCheckoutOrdersTest {

    private By testId(String value) {
        return By.cssSelector("[data-testid='" + value + "']");
    }

    private static final By CART_ROWS = By.cssSelector("[data-testid^='cart-item-']");

    /**
     * Persistent item id the cart rendered for the single row it contains.
     *
     * <p>The cart page mounts before its data arrives, so the row is located with a wait that
     * keeps polling through the re-render instead of resolving one reference and using it.
     */
    private String firstCartItemId(WebDriver driver) {
        WebElement row = Ui.firstDisplayedAfterReloadIfNeeded(driver, CART_ROWS);
        return row.getDomAttribute("data-testid").replace("cart-item-", "");
    }

    private Integer prepareCartWithProduct(ProductService service) {
        service.clearCart();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        int status = service.addToCart(productId, 1).statusCode();
        if (status != 200 && status != 201) {
            throw new AssertionError("Add to cart returned " + status);
        }
        return productId;
    }

    @Test
    @Story("UI-CART-001")
    @DisplayName("[UI-CART-001] Add product to cart")
    void ui_cart_001_addProductToCart() {
        ProductService service = new ProductService();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        String productName = String.valueOf(product.get("name"));
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user is on store page with products available", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("When: user clicks add to cart on a product", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("product-add-to-cart-" + productId))).click();
                wait.until(d -> "1".equals(d.findElement(testId("header-cart-count")).getText()));
            });

            Steps.step("Then: cart reflects the added item", () -> {
                driver.get(Environment.BASE_URL + "/cart");
                Ui.resilient(driver).until(d -> d.findElements(CART_ROWS)
                        .stream().anyMatch(row -> row.getText().contains(productName)));
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CART-002")
    @DisplayName("[UI-CART-002] Change cart quantity")
    void ui_cart_002_changeCartQuantity() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: cart contains an item", () -> {
                driver.get(Environment.BASE_URL + "/cart");
            });

            Steps.step("When: user increases item quantity", () -> {
                String itemId = firstCartItemId(driver);
                Ui.click(driver, testId("cart-increase-" + itemId));
                wait.until(d -> "2".equals(d.findElement(testId("cart-quantity-" + itemId)).getText()));
            });

            Steps.step("Then: subtotal and total updates accordingly", () -> {
                double expected = ((Number) TestData.PRODUCT.get("price")).doubleValue() * 2;
                wait.until(d -> d.findElement(testId("cart-subtotal")).getText()
                        .contains(String.format("%.2f", expected)));
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CART-003")
    @DisplayName("[UI-CART-003] Remove item with native dialog")
    void ui_cart_003_removeItemWithNativeDialog() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: cart has an item to remove", () -> {
                driver.get(Environment.BASE_URL + "/cart");
            });

            Steps.step("When: user clicks remove and confirms the native browser dialog", () -> {
                String itemId = firstCartItemId(driver);
                Ui.click(driver, testId("cart-remove-" + itemId));
                var alert = wait.until(ExpectedConditions.alertIsPresent());
                assertTrue(alert.getText().contains("Remove this item from cart?"));
                alert.accept();
                wait.until(d -> d.findElements(testId("cart-item-" + itemId)).isEmpty());
            });

            Steps.step("Then: item is removed from cart", () -> {
                assertTrue(driver.findElements(By.cssSelector("[data-testid^='cart-item-']")).isEmpty());
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CART-004")
    @DisplayName("[UI-CART-004] Clear cart")
    void ui_cart_004_clearCart() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: cart has active items", () -> {
                driver.get(Environment.BASE_URL + "/cart");
            });

            Steps.step("When: user clicks clear cart and confirms native alert", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("cart-clear"))).click();
                var alert = wait.until(ExpectedConditions.alertIsPresent());
                assertTrue(alert.getText().contains("Clear entire cart?"));
                alert.accept();
            });

            Steps.step("Then: cart empty state is displayed", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("cart-empty-state")));
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CHECKOUT-001")
    @DisplayName("[UI-CHECKOUT-001] Required checkout validation")
    void ui_checkout_001_requiredValidation() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user opens checkout with an active cart", () -> {
                driver.get(Environment.BASE_URL + "/checkout");
            });

            Steps.step("Then: all required field errors are visible and submit is disabled", () -> {
                for (String key : List.of("fullname", "email", "address", "city", "state", "zip", "card", "expiry", "cvv")) {
                    wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-" + key + "-error")));
                }
                assertTrue(!wait.until(ExpectedConditions.presenceOfElementLocated(testId("checkout-submit"))).isEnabled());
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CHECKOUT-002")
    @DisplayName("[UI-CHECKOUT-002] Checkout boundary and negative data")
    void ui_checkout_002_boundaryAndNegativeData() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user is on checkout page", () -> {
                driver.get(Environment.BASE_URL + "/checkout");
            });

            Steps.step("When: user enters invalid boundary values", () -> {
                Ui.type(driver, testId("checkout-fullname"), "Invalid@Name");
                Ui.type(driver, testId("checkout-email"), "not-an-email");
                Ui.type(driver, testId("checkout-zip"), "-1");
                Ui.type(driver, testId("checkout-card-number"), "123");
                Ui.type(driver, testId("checkout-expiry"), "1399");
                Ui.type(driver, testId("checkout-cvv"), "1");
            });

            Steps.step("Then: validation error messages are displayed for every invalid field", () -> {
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-fullname-error"))).getText().contains("only"));
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-email-error"))).getText().contains("invalid"));
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-card-error"))).getText().contains("15-16"));
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-expiry-error"))).getText().contains("month"));
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CHECKOUT-003")
    @DisplayName("[UI-CHECKOUT-003] Create order from checkout")
    void ui_checkout_003_createOrder() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        Integer orderId = null;
        try {
            Steps.step("Given: user opens checkout with items in cart", () -> {
                driver.get(Environment.BASE_URL + "/checkout");
            });

            Steps.step("When: user fills testing card details and submits order", () -> {
                // CheckoutPage handles autofill & place order
            });

            orderId = new CheckoutPage(driver).placeOrder();
            int finalOrderId = orderId;
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

            Steps.step("Then: user is redirected to order detail with summary", () -> {
                wait.until(ExpectedConditions.urlMatches("/orders/" + finalOrderId + "$"));
                WebElement detailId = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-detail-id")));
                assertTrue(detailId.getText().contains(String.valueOf(finalOrderId)));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-detail-total")));
            });
        } finally {
            driver.quit();
            if (orderId != null) service.deleteOrder(orderId);
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-CHECKOUT-004")
    @DisplayName("[UI-CHECKOUT-004] Responsive checkout modal")
    void ui_checkout_004_responsiveCheckoutModal() {
        ProductService service = new ProductService();
        Integer productId = prepareCartWithProduct(service);
        WebDriver driver = AuthenticatedBrowser.create(true, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user opens checkout in mobile viewport", () -> {
                driver.get(Environment.BASE_URL + "/checkout");
            });

            Steps.step("When: user clicks more info modal button", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("checkout-more-about-shipping-taxes"))).click();
            });

            Steps.step("Then: shipping & tax modal fits mobile screen boundaries", () -> {
                WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("tax-shipping-dialog")));
                assertTrue(modal.getRect().getX() >= 0 && modal.getRect().getX() + modal.getRect().getWidth() <= 412);
                assertTrue(modal.getRect().getHeight() <= 915);
                wait.until(ExpectedConditions.elementToBeClickable(testId("tax-shipping-close"))).click();
                wait.until(ExpectedConditions.invisibilityOf(modal));
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-ORDER-001")
    @DisplayName("[UI-ORDER-001] Open order detail")
    void ui_order_001_openOrderDetail() {
        OrderService orders = new OrderService();
        OrderService.ControlledOrder controlled = orders.createControlledOrder();
        int orderId = controlled.orderId();
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: controlled order exists", () -> {
                driver.get(Environment.BASE_URL + "/orders");
            });

            Steps.step("When: user searches and clicks to view order detail page", () -> {
                Ui.type(driver, testId("orders-search"), String.valueOf(orderId));
                wait.until(ExpectedConditions.elementToBeClickable(testId("order-view-" + orderId))).click();
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-modal"))).getText().contains(String.valueOf(orderId)));
                wait.until(ExpectedConditions.elementToBeClickable(testId("order-modal-open-page"))).click();
            });

            Steps.step("Then: order detail page displays order ID and details", () -> {
                wait.until(ExpectedConditions.urlMatches("/orders/" + orderId + "$"));
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-detail-id"))).getText().contains(String.valueOf(orderId)));
            });
        } finally {
            driver.quit();
            orders.cleanup(controlled);
        }
    }

    @Test
    @Story("UI-ORDER-002")
    @DisplayName("[UI-ORDER-002] Search and filter order history")
    void ui_order_002_searchAndFilterOrderHistory() {
        OrderService orders = new OrderService();
        OrderService.ControlledOrder controlled = orders.createControlledOrder();
        int orderId = controlled.orderId();
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user opens order history", () -> {
                driver.get(Environment.BASE_URL + "/orders");
            });

            Steps.step("When: user searches by order ID and filters by paid status", () -> {
                Ui.type(driver, testId("orders-search"), String.valueOf(orderId));
                new org.openqa.selenium.support.ui.Select(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("orders-status-filter")))).selectByValue("paid");
            });

            Steps.step("Then: only the matching paid order is listed", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-row-id-" + orderId)));
                assertEquals(1, driver.findElements(By.cssSelector("[data-testid^='order-row-id-']")).size());
            });
        } finally {
            driver.quit();
            orders.cleanup(controlled);
        }
    }

    @Test
    @Story("UI-ORDER-003")
    @DisplayName("[UI-ORDER-003] Paginate order history")
    void ui_order_003_paginateOrderHistory() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: order history page is open", () -> {
                driver.get(Environment.BASE_URL + "/orders");
            });

            Steps.step("When: user selects page size", () -> {
                new org.openqa.selenium.support.ui.Select(wait.until(ExpectedConditions.visibilityOfElementLocated(
                        testId("orders-items-per-page")))).selectByValue("10");
            });

            Steps.step("Then: pagination indicator is present and page navigation functions", () -> {
                wait.until(ExpectedConditions.presenceOfElementLocated(testId("orders-items-per-page")));
                if (!driver.findElements(testId("orders-page-indicator")).isEmpty()) {
                    assertTrue(driver.findElement(testId("orders-page-indicator")).getText().contains("Page 1"));
                }
                if (!driver.findElements(testId("orders-next")).isEmpty() && driver.findElement(testId("orders-next")).isEnabled()) {
                    driver.findElement(testId("orders-next")).click();
                    wait.until(d -> d.findElement(testId("orders-page-indicator")).getText().contains("Page 2"));
                }
            });
        } finally {
            driver.quit();
        }
    }
}
