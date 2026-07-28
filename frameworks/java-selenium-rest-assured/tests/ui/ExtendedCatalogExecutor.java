package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.ExtendedCatalog;
import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.UniqueName;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import services.ProductService;
import services.OrderService;
import pages.PlaygroundPage;
import pages.CheckoutPage;

final class ExtendedCatalogExecutor {
    private static final List<String> SECTION_IDS = List.of(
            "section-text-inputs", "section-buttons", "section-radio", "section-checkbox",
            "section-dropdown", "section-other-inputs", "section-modals", "section-table",
            "section-tabs", "section-accordion", "section-links", "section-loading",
            "section-badges", "section-contact-form", "section-order-form",
            "section-advanced-datatable", "section-basic-auth", "section-iframe",
            "section-geolocation", "section-hover", "section-new-tab",
            "section-download-upload", "section-flakiness", "section-shadow-dom");

    static void run(String id) {
        ExtendedCatalog.UiCase scenario = ExtendedCatalog.UI_CASES.stream()
                .filter(candidate -> candidate.id().equals(id))
                .findFirst().orElseThrow();
        ProductService service = new ProductService();
        Integer productId = null;
        if (scenario.id().startsWith("UI-CHECKOUT-")
                || (scenario.id().startsWith("UI-CART-") && !scenario.id().equals("UI-CART-001"))) {
            service.clearCart();
            Map<String, Object> product = service.createProduct(
                    ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            productId = ((Number) product.get("id")).intValue();
            int status = service.addToCart(productId, 1).statusCode();
            if (status != 200 && status != 201) {
                throw new AssertionError("Add to cart returned " + status);
            }
        }

        WebDriver driver = null;
        try {
            boolean loginScenario = scenario.id().startsWith("UI-AUTH-");
            driver = AuthenticatedBrowser.create(scenario.mobile(), !loginScenario);
            WebDriver activeDriver = driver;
            WebDriverWait wait = new WebDriverWait(activeDriver, Duration.ofSeconds(15));
            if (loginScenario) {
                runLoginScenario(activeDriver, wait, scenario.id());
                return;
            }
            if (scenario.id().startsWith("UI-PLAY-")) {
                runPlaygroundScenario(activeDriver, scenario.id());
                return;
            }
            if (scenario.id().startsWith("UI-CART-")) {
                runCartScenario(activeDriver, wait, scenario.id(), productId, service);
                return;
            }
            if (scenario.id().startsWith("UI-STORE-") || scenario.id().startsWith("UI-PRODUCT-")) {
                runStoreAndProductScenario(activeDriver, wait, scenario.id(), service);
                return;
            }
            if (scenario.id().startsWith("UI-QUERY-")) {
                runQueryScenario(activeDriver, wait, scenario.id());
                return;
            }
            if (scenario.id().startsWith("UI-MOBILE-")) {
                runMobileScenario(activeDriver, wait, scenario.id(), service);
                return;
            }
            if (scenario.id().startsWith("UI-CHECKOUT-")) {
                runCheckoutScenario(activeDriver, wait, scenario.id(), productId, service);
                productId = null; // scenario owns cleanup, including a created order
                return;
            }
            if (scenario.id().startsWith("UI-ORDER-")) {
                runOrderScenario(activeDriver, wait, scenario.id());
                return;
            }
            if (scenario.id().equals("UI-SHELL-001")) {
                ((JavascriptExecutor) activeDriver).executeScript(
                        "localStorage.removeItem('qa-academy-terms-consent-v1')");
                activeDriver.get(Environment.BASE_URL + scenario.route());
                wait.until(d -> d.findElement(testId("terms-gate-dialog")).isDisplayed());
                activeDriver.findElement(testId("terms-gate-accept")).click();
                assertEquals("accepted", ((JavascriptExecutor) activeDriver).executeScript(
                        "return localStorage.getItem('qa-academy-terms-consent-v1')"));
                return;
            }

            activeDriver.get(Environment.BASE_URL + scenario.route());
            if (scenario.id().equals("UI-SHELL-002")) {
                wait.until(d -> d.findElement(testId("mobile-menu-open"))).click();
            }
            List<String> selectors = scenario.id().equals("UI-PLAY-001")
                    ? SECTION_IDS : scenario.selectors();
            for (String selector : selectors) {
                assertNotNull(wait.until(d -> d.findElement(testId(selector))));
            }
        } finally {
            if (driver != null) {
                driver.quit();
            }
            if (productId != null) {
                service.clearCart();
                service.deleteProduct(productId);
            }
        }
    }

    private static void runOrderScenario(WebDriver driver, WebDriverWait wait, String id) {
        if (id.equals("UI-ORDER-003")) {
            driver.get(Environment.BASE_URL + "/orders");
            new org.openqa.selenium.support.ui.Select(wait.until(ExpectedConditions.visibilityOfElementLocated(
                    testId("orders-items-per-page")))).selectByValue("10");
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("orders-page-indicator")));
            if (!driver.findElements(testId("orders-next")).isEmpty() && driver.findElement(testId("orders-next")).isEnabled()) {
                driver.findElement(testId("orders-next")).click();
                wait.until(d -> d.findElement(testId("orders-page-indicator")).getText().contains("Page 2"));
            }
            return;
        }
        OrderService orders = new OrderService();
        OrderService.ControlledOrder controlled = null;
        try {
            controlled = orders.createControlledOrder();
            int orderId = controlled.orderId();
            driver.get(Environment.BASE_URL + "/orders");
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("orders-search"))).sendKeys(String.valueOf(orderId));
            if (id.equals("UI-ORDER-002")) {
                new org.openqa.selenium.support.ui.Select(driver.findElement(testId("orders-status-filter"))).selectByValue("paid");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-row-id-" + orderId)));
                assertEquals(1, driver.findElements(By.cssSelector("[data-testid^='order-row-id-']")).size());
            } else {
                wait.until(ExpectedConditions.elementToBeClickable(testId("order-view-" + orderId))).click();
                assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(testId("order-modal"))).getText()
                        .contains(String.valueOf(orderId)));
                driver.findElement(testId("order-modal-open-page")).click();
                wait.until(ExpectedConditions.urlMatches("/orders/" + orderId + "$"));
                assertTrue(driver.findElement(testId("order-detail-id")).getText().contains(String.valueOf(orderId)));
            }
        } finally { orders.cleanup(controlled); }
    }

    private static void runCheckoutScenario(WebDriver driver, WebDriverWait wait, String id,
            int productId, ProductService service) {
        driver.get(Environment.BASE_URL + "/checkout");
        try {
            switch (id) {
                case "UI-CHECKOUT-001" -> {
                    for (String key : List.of("fullname", "email", "address", "city", "state", "zip", "card", "expiry", "cvv"))
                        wait.until(ExpectedConditions.visibilityOfElementLocated(testId("checkout-" + key + "-error")));
                    assertTrue(!driver.findElement(testId("checkout-submit")).isEnabled());
                }
                case "UI-CHECKOUT-002" -> {
                    driver.findElement(testId("checkout-fullname")).sendKeys("Invalid@Name");
                    driver.findElement(testId("checkout-email")).sendKeys("not-an-email");
                    driver.findElement(testId("checkout-zip")).sendKeys("-1");
                    driver.findElement(testId("checkout-card-number")).sendKeys("123");
                    driver.findElement(testId("checkout-expiry")).sendKeys("1399");
                    driver.findElement(testId("checkout-cvv")).sendKeys("1");
                    assertTrue(driver.findElement(testId("checkout-fullname-error")).getText().contains("only"));
                    assertTrue(driver.findElement(testId("checkout-email-error")).getText().contains("invalid"));
                    assertTrue(driver.findElement(testId("checkout-card-error")).getText().contains("15-16"));
                    assertTrue(driver.findElement(testId("checkout-expiry-error")).getText().contains("month"));
                }
                case "UI-CHECKOUT-003" -> {
                    int orderId = new CheckoutPage(driver).placeOrder();
                    try { assertTrue(driver.findElement(testId("order-detail-id")).getText().contains(String.valueOf(orderId)));
                        driver.findElement(testId("order-detail-total"));
                    } finally { service.deleteOrder(orderId); }
                }
                case "UI-CHECKOUT-004" -> {
                    driver.findElement(testId("checkout-more-about-shipping-taxes")).click();
                    WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("tax-shipping-dialog")));
                    assertTrue(modal.getRect().getX() >= 0 && modal.getRect().getX() + modal.getRect().getWidth() <= 412);
                    assertTrue(modal.getRect().getHeight() <= 915);
                    driver.findElement(testId("tax-shipping-close")).click();
                    wait.until(ExpectedConditions.invisibilityOf(modal));
                }
                default -> throw new IllegalArgumentException(id);
            }
        } finally { service.clearCart(); service.deleteProduct(productId); }
    }

    private static void runStoreAndProductScenario(WebDriver driver, WebDriverWait wait,
            String id, ProductService service) {
        if (id.equals("UI-STORE-001")) {
            driver.get(Environment.BASE_URL + "/store");
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-search")));
            driver.findElement(testId("store-category-filter")); driver.findElement(testId("store-type-filter"));
            assertTrue(!driver.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).isEmpty());
            return;
        }
        if (id.equals("UI-STORE-003")) {
            driver.get(Environment.BASE_URL + "/store");
            var size = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-items-per-page")));
            new org.openqa.selenium.support.ui.Select(size).selectByValue("5");
            wait.until(d -> d.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).size() <= 5);
            assertTrue(driver.findElement(testId("store-page-indicator")).getText().contains("Page 1"));
            driver.findElement(testId("store-next")).click();
            wait.until(d -> d.findElement(testId("store-page-indicator")).getText().contains("Page 2"));
            return;
        }
        if (id.equals("UI-PRODUCT-004")) {
            driver.get(Environment.BASE_URL + "/products");
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-table")));
            driver.findElement(By.xpath("//*[@data-testid='products-type-filter']//*[normalize-space()='Template']")).click();
            WebElement row = wait.until(d -> d.findElements(By.cssSelector("[data-testid^='product-row-']")).stream()
                    .filter(WebElement::isDisplayed).findFirst().orElse(null));
            String productId = row.getAttribute("data-testid").replace("product-row-", "");
            ((JavascriptExecutor) driver).executeScript("arguments[0].click()", driver.findElement(testId("product-delete-" + productId)));
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-error-toast")));
            assertTrue(driver.findElement(testId("product-row-" + productId)).isDisplayed());
            return;
        }
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        boolean deleted = false;
        try {
            String expectedName = String.valueOf(product.get("name"));
            if (id.equals("UI-PRODUCT-002")) {
                expectedName += "-edited";
                assertEquals(expectedName, service.updateProduct(productId, Map.of("name", expectedName)).get("name"));
            }
            driver.get(Environment.BASE_URL + (id.startsWith("UI-STORE") ? "/store" : "/products"));
            WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    testId(id.startsWith("UI-STORE") ? "store-search" : "products-search")));
            search.sendKeys(expectedName);
            if (id.equals("UI-STORE-002")) {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("product-add-to-cart-" + productId)));
                assertEquals(1, driver.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).size());
            } else if (id.equals("UI-PRODUCT-003")) {
                driver.findElement(testId("product-delete-" + productId)).click();
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-success-toast")));
                wait.until(d -> d.findElements(testId("product-row-" + productId)).isEmpty()); deleted = true;
            } else {
                assertTrue(driver.findElement(testId("product-row-" + productId)).getText().contains(expectedName));
            }
        } finally { if (!deleted) service.deleteProduct(productId); }
    }

    private static void runQueryScenario(WebDriver driver, WebDriverWait wait, String id) {
        driver.get(Environment.BASE_URL + "/query-lab");
        wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-page")));
        if (id.equals("UI-QUERY-002")) driver.findElement(testId("query-lab-resource-orders")).click();
        if (id.equals("UI-QUERY-003")) driver.findElement(testId("query-lab-transport-override")).click();
        if (id.equals("UI-QUERY-001")) {
            driver.findElement(testId("query-lab-search")).sendKeys("a");
            new org.openqa.selenium.support.ui.Select(driver.findElement(testId("query-lab-sort-field"))).selectByValue("price");
        }
        if (id.equals("UI-QUERY-004")) driver.findElement(testId("query-lab-search")).sendKeys("no-result-" + System.nanoTime());
        driver.findElement(testId("query-lab-run")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("query-lab-loading")));
        if (id.equals("UI-QUERY-003")) assertTrue(driver.findElement(testId("query-lab-transport-badge")).getText().contains("POST_OVERRIDE"));
        else if (id.equals("UI-QUERY-004")) wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-no-results")));
        else { assertTrue(driver.findElement(testId("query-lab-status-badge")).getText().contains("200"));
            wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-table"))); }
    }

    private static void runMobileScenario(WebDriver driver, WebDriverWait wait, String id, ProductService service) {
        String route = id.equals("UI-MOBILE-003") ? "/playground" : "/store";
        driver.get(Environment.BASE_URL + route);
        if (id.equals("UI-MOBILE-001")) { wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-search"))); }
        if (id.equals("UI-MOBILE-002")) {
            Map<String,Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            int productId = ((Number) product.get("id")).intValue();
            try { driver.findElement(testId("store-search")).sendKeys(String.valueOf(product.get("name")));
                wait.until(ExpectedConditions.elementToBeClickable(testId("product-add-to-cart-" + productId))).click();
                driver.findElement(testId("product-stock-info-" + productId)).click();
                WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("stock-info-modal")));
                assertTrue(modal.getRect().getX() + modal.getRect().getWidth() <= 412);
                driver.get(Environment.BASE_URL + "/cart"); assertTrue(driver.findElement(testId("cart-items")).getText().contains(String.valueOf(product.get("name"))));
            } finally { service.clearCart(); service.deleteProduct(productId); }
        }
        if (id.equals("UI-MOBILE-003")) { driver.findElement(testId("section-advanced-datatable")); driver.findElement(testId("section-shadow-dom")); }
        long width = ((Number)((JavascriptExecutor)driver).executeScript("return document.documentElement.scrollWidth")).longValue();
        assertTrue(width <= 412, "Horizontal overflow: " + width);
    }

    private static void runCartScenario(WebDriver driver, WebDriverWait wait, String id,
            Integer preparedProductId, ProductService service) {
        Integer ownedProductId = preparedProductId;
        if (id.equals("UI-CART-001")) {
            Map<String, Object> product = service.createProduct(
                    ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            ownedProductId = ((Number) product.get("id")).intValue();
            try {
                driver.get(Environment.BASE_URL + "/store");
                wait.until(ExpectedConditions.elementToBeClickable(
                        testId("product-add-to-cart-" + ownedProductId))).click();
                wait.until(d -> "1".equals(d.findElement(testId("header-cart-count")).getText()));
                driver.get(Environment.BASE_URL + "/cart");
                wait.until(d -> d.findElements(By.cssSelector("[data-testid^='cart-item-']"))
                        .stream().anyMatch(row -> row.getText().contains(String.valueOf(product.get("name")))));
            } finally {
                service.clearCart(); service.deleteProduct(ownedProductId);
            }
            return;
        }

        driver.get(Environment.BASE_URL + "/cart");
        WebElement row = wait.until(d -> d.findElements(By.cssSelector("[data-testid^='cart-item-']"))
                .stream().filter(WebElement::isDisplayed).findFirst().orElse(null));
        String itemId = row.getAttribute("data-testid").replace("cart-item-", "");
        switch (id) {
            case "UI-CART-002" -> {
                driver.findElement(testId("cart-increase-" + itemId)).click();
                wait.until(d -> "2".equals(d.findElement(testId("cart-quantity-" + itemId)).getText()));
                double expected = ((Number) TestData.PRODUCT.get("price")).doubleValue() * 2;
                wait.until(d -> d.findElement(testId("cart-subtotal")).getText()
                        .contains(String.format("%.2f", expected)));
            }
            case "UI-CART-003" -> {
                driver.findElement(testId("cart-remove-" + itemId)).click();
                var alert = wait.until(ExpectedConditions.alertIsPresent());
                assertTrue(alert.getText().contains("Remove this item from cart?"));
                alert.accept();
                wait.until(d -> d.findElements(testId("cart-item-" + itemId)).isEmpty());
            }
            case "UI-CART-004" -> {
                driver.findElement(testId("cart-clear")).click();
                var alert = wait.until(ExpectedConditions.alertIsPresent());
                assertTrue(alert.getText().contains("Clear entire cart?"));
                alert.accept();
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("cart-empty-state")));
            }
            default -> throw new IllegalArgumentException("Unsupported cart case " + id);
        }
    }

    private static void runPlaygroundScenario(WebDriver driver, String id) {
        PlaygroundPage playground = new PlaygroundPage(driver);
        playground.open();
        switch (id) {
            case "UI-PLAY-001" -> playground.expectCompleteSectionContract();
            case "UI-PLAY-002" -> playground.expectContactFormValidationAndBoundaries();
            case "UI-PLAY-003" -> playground.expectModalTabsAndAccordion();
            case "UI-PLAY-004" -> playground.expectDataTableContract();
            case "UI-PLAY-005" -> playground.expectIframeHoverAndNewTab();
            case "UI-PLAY-006" -> playground.expectDownloadAndUpload();
            case "UI-PLAY-008" -> playground.expectOpenShadowDom();
            default -> throw new IllegalArgumentException("Unsupported Playground case " + id);
        }
    }

    private static void runLoginScenario(WebDriver driver, WebDriverWait wait, String id) {
        driver.get(Environment.BASE_URL + "/login");
        var email = wait.until(d -> d.findElement(testId("login-email")));
        if (id.equals("UI-AUTH-002")) {
            email.sendKeys("missing-" + System.currentTimeMillis() + "@example.invalid");
            driver.findElement(testId("login-continue")).click();
            wait.until(d -> d.findElement(testId("login-error")).isDisplayed());
            assertNull(((JavascriptExecutor) driver).executeScript(
                    "return localStorage.getItem('api_token')"));
            assertTrue(driver.getCurrentUrl().endsWith("/login"));
            return;
        }
        email.sendKeys(Environment.required("UI_EMAIL"));
        driver.findElement(testId("login-continue")).click();
        wait.until(d -> d.findElement(testId("login-password")))
                .sendKeys(Environment.required("UI_PASSWORD"));
        driver.findElement(testId("login-submit")).click();
        wait.until(d -> !d.getCurrentUrl().endsWith("/login"));
        assertNotNull(((JavascriptExecutor) driver).executeScript(
                "return localStorage.getItem('api_token')"));
    }

    private static By testId(String value) {
        return By.cssSelector("[data-testid='" + value + "']");
    }

    // One entry point per executable JUnit case; each resolves to the concrete flow above.
    static void ui_auth_001() { run("UI-AUTH-001"); }
    static void ui_auth_002() { run("UI-AUTH-002"); }
    static void ui_shell_001() { run("UI-SHELL-001"); }
    static void ui_shell_002() { run("UI-SHELL-002"); }
    static void ui_store_001() { run("UI-STORE-001"); }
    static void ui_store_002() { run("UI-STORE-002"); }
    static void ui_store_003() { run("UI-STORE-003"); }
    static void ui_product_001() { run("UI-PRODUCT-001"); }
    static void ui_product_002() { run("UI-PRODUCT-002"); }
    static void ui_product_003() { run("UI-PRODUCT-003"); }
    static void ui_product_004() { run("UI-PRODUCT-004"); }
    static void ui_cart_001() { run("UI-CART-001"); }
    static void ui_cart_002() { run("UI-CART-002"); }
    static void ui_cart_003() { run("UI-CART-003"); }
    static void ui_cart_004() { run("UI-CART-004"); }
    static void ui_checkout_001() { run("UI-CHECKOUT-001"); }
    static void ui_checkout_002() { run("UI-CHECKOUT-002"); }
    static void ui_checkout_003() { run("UI-CHECKOUT-003"); }
    static void ui_checkout_004() { run("UI-CHECKOUT-004"); }
    static void ui_order_001() { run("UI-ORDER-001"); }
    static void ui_order_002() { run("UI-ORDER-002"); }
    static void ui_order_003() { run("UI-ORDER-003"); }
    static void ui_query_001() { run("UI-QUERY-001"); }
    static void ui_query_002() { run("UI-QUERY-002"); }
    static void ui_query_003() { run("UI-QUERY-003"); }
    static void ui_query_004() { run("UI-QUERY-004"); }
    static void ui_play_001() { run("UI-PLAY-001"); }
    static void ui_play_002() { run("UI-PLAY-002"); }
    static void ui_play_003() { run("UI-PLAY-003"); }
    static void ui_play_004() { run("UI-PLAY-004"); }
    static void ui_play_005() { run("UI-PLAY-005"); }
    static void ui_play_006() { run("UI-PLAY-006"); }
    static void ui_play_008() { run("UI-PLAY-008"); }
    static void ui_mobile_001() { run("UI-MOBILE-001"); }
    static void ui_mobile_002() { run("UI-MOBILE-002"); }
    static void ui_mobile_003() { run("UI-MOBILE-003"); }
}
