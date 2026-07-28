package tests.ui;

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
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import services.ProductService;
import pages.StorePage;

@Epic("Chapter 5")
@Feature("Query Lab & Mobile UI")
public class QueryLabMobileTest {

    private By testId(String value) {
        return By.cssSelector("[data-testid='" + value + "']");
    }

    @Test
    @Story("UI-QUERY-001")
    @DisplayName("[UI-QUERY-001] Query products")
    void ui_query_001_queryProducts() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: Query Lab page is open", () -> {
                driver.get(Environment.BASE_URL + "/query-lab");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-page")));
            });

            Steps.step("When: user configures product search query and runs query", () -> {
                driver.findElement(testId("query-lab-search")).sendKeys("a");
                new org.openqa.selenium.support.ui.Select(driver.findElement(testId("query-lab-sort-field"))).selectByValue("price");
                driver.findElement(testId("query-lab-run")).click();
                wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("query-lab-loading")));
            });

            Steps.step("Then: products table results are loaded with HTTP 200 status", () -> {
                assertTrue(driver.findElement(testId("query-lab-status-badge")).getText().contains("200"));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-table")));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-QUERY-002")
    @DisplayName("[UI-QUERY-002] Query orders")
    void ui_query_002_queryOrders() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: Query Lab is configured for orders resource", () -> {
                driver.get(Environment.BASE_URL + "/query-lab");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-page")));
                driver.findElement(testId("query-lab-resource-orders")).click();
            });

            Steps.step("When: user executes orders query", () -> {
                driver.findElement(testId("query-lab-run")).click();
                wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("query-lab-loading")));
            });

            Steps.step("Then: orders query results table is rendered", () -> {
                WebElement badge = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-status-badge")));
                assertTrue(badge.getText().contains("200"));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-table")));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-QUERY-003")
    @DisplayName("[UI-QUERY-003] Change Query transport")
    void ui_query_003_changeTransport() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: Query Lab page is open", () -> {
                driver.get(Environment.BASE_URL + "/query-lab");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-page")));
            });

            Steps.step("When: user switches transport mode to POST override", () -> {
                driver.findElement(testId("query-lab-transport-override")).click();
                driver.findElement(testId("query-lab-run")).click();
                wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("query-lab-loading")));
            });

            Steps.step("Then: transport badge reflects POST_OVERRIDE mode", () -> {
                WebElement badge = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-transport-badge")));
                assertTrue(badge.getText().contains("POST_OVERRIDE"));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-QUERY-004")
    @DisplayName("[UI-QUERY-004] Query response states and cooldown")
    void ui_query_004_responseStatesAndCooldown() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: Query Lab page is open", () -> {
                driver.get(Environment.BASE_URL + "/query-lab");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-page")));
            });

            Steps.step("When: user searches for nonexistent term to trigger empty state", () -> {
                driver.findElement(testId("query-lab-search")).sendKeys("no-result-" + System.nanoTime());
                driver.findElement(testId("query-lab-run")).click();
                wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("query-lab-loading")));
            });

            Steps.step("Then: no results state is displayed", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("query-lab-no-results")));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-MOBILE-001")
    @DisplayName("[UI-MOBILE-001] Responsive Store")
    void ui_mobile_001_responsiveStore() {
        WebDriver driver = AuthenticatedBrowser.create(true, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: store page is loaded in mobile viewport", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("Then: search bar is accessible and layout fits without horizontal scroll", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-search")));
                long width = ((Number) ((JavascriptExecutor) driver).executeScript("return document.documentElement.scrollWidth")).longValue();
                assertTrue(width <= 412, "Horizontal overflow: " + width);
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-MOBILE-002")
    @DisplayName("[UI-MOBILE-002] Responsive cart and modal")
    void ui_mobile_002_responsiveCartAndModal() {
        ProductService service = new ProductService();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        String productName = String.valueOf(product.get("name"));
        WebDriver driver = AuthenticatedBrowser.create(true, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: product is added to cart in mobile viewport", () -> {
                driver.get(Environment.BASE_URL + "/store");
                Ui.type(driver, testId("store-search"), productName);
                wait.until(ExpectedConditions.elementToBeClickable(testId("product-add-to-cart-" + productId))).click();
                new StorePage(driver).expectReserved(productId, 1);
            });

            Steps.step("When: user opens stock info modal", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("product-stock-info-" + productId))).click();
            });

            Steps.step("Then: modal and cart elements fit mobile boundaries without overflow", () -> {
                WebElement modal = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("stock-info-modal")));
                assertTrue(modal.getRect().getX() + modal.getRect().getWidth() <= 412);
                driver.get(Environment.BASE_URL + "/cart");
                // The cart list mounts before its data arrives, so the row is read through a
                // wait that keeps polling across the re-render instead of one fixed reference.
                assertTrue(Ui.firstDisplayedAfterReloadIfNeeded(driver, By.cssSelector("[data-testid^='cart-item-']"))
                        .getText().contains(productName));
                long width = ((Number) ((JavascriptExecutor) driver).executeScript("return document.documentElement.scrollWidth")).longValue();
                assertTrue(width <= 412, "Horizontal overflow: " + width);
            });
        } finally {
            driver.quit();
            service.clearCart();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-MOBILE-003")
    @DisplayName("[UI-MOBILE-003] Responsive Playground")
    void ui_mobile_003_responsivePlayground() {
        WebDriver driver = AuthenticatedBrowser.create(true, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: playground page is loaded in mobile viewport", () -> {
                driver.get(Environment.BASE_URL + "/playground");
            });

            Steps.step("Then: complex components adapt to mobile width without overflow", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("section-advanced-datatable")));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("section-shadow-dom")));
                long width = ((Number) ((JavascriptExecutor) driver).executeScript("return document.documentElement.scrollWidth")).longValue();
                assertTrue(width <= 412, "Horizontal overflow: " + width);
            });
        } finally {
            driver.quit();
        }
    }
}
