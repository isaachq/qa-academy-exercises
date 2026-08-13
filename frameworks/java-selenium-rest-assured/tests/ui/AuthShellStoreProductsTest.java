package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.Steps;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import services.ProductService;

@Epic("Chapter 5")
@Tag("extended")
@Feature("Authentication & Product Catalog UI")
public class AuthShellStoreProductsTest {

    private By testId(String value) {
        return By.cssSelector("[data-testid='" + value + "']");
    }

    @Test
    @Story("UI-AUTH-001")
    @DisplayName("[UI-AUTH-001] Valid login preserves an authenticated session")
    void ui_auth_001_validLogin() {
        WebDriver driver = AuthenticatedBrowser.create(false, false);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: login opens without a previous session", () -> {
                driver.get(Environment.BASE_URL + "/login");
            });

            Steps.step("When: user validates the email and submits the valid password", () -> {
                WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("login-email")));
                email.sendKeys(Environment.required("UI_EMAIL"));
                driver.findElement(testId("login-continue")).click();
                WebElement password = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("login-password")));
                password.sendKeys(Environment.required("UI_PASSWORD"));
                driver.findElement(testId("login-submit")).click();
            });

            Steps.step("Then: the application opens an authenticated route and stores the token", () -> {
                wait.until(d -> !d.getCurrentUrl().endsWith("/login"));
                String token = (String) ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('api_token')");
                assertNotNull(token, "api_token should be persisted in localStorage");
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-AUTH-002")
    @DisplayName("[UI-AUTH-002] Invalid login displays a traceable error")
    void ui_auth_002_invalidLogin() {
        WebDriver driver = AuthenticatedBrowser.create(false, false);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: login page is loaded", () -> {
                driver.get(Environment.BASE_URL + "/login");
            });

            Steps.step("When: user attempts to continue with a nonexistent account", () -> {
                WebElement email = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("login-email")));
                email.sendKeys("missing-" + System.currentTimeMillis() + "@example.invalid");
                driver.findElement(testId("login-continue")).click();
            });

            Steps.step("Then: no session is created and an error is displayed", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("login-error")));
                Object token = ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('api_token')");
                assertNull(token, "api_token should not be set for invalid credentials");
                assertTrue(driver.getCurrentUrl().endsWith("/login"));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-SHELL-001")
    @DisplayName("[UI-SHELL-001] Accepting the Terms Gate persists consent")
    void ui_shell_001_acceptTermsGate() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user has not yet consented to the Terms Gate", () -> {
                ((JavascriptExecutor) driver).executeScript("localStorage.removeItem('qa-academy-terms-consent-v1')");
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("When: user accepts the terms", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("terms-gate-dialog")));
                driver.findElement(testId("terms-gate-accept")).click();
            });

            Steps.step("Then: the dialog closes and consent remains persisted", () -> {
                wait.until(ExpectedConditions.invisibilityOfElementLocated(testId("terms-gate-dialog")));
                Object consent = ((JavascriptExecutor) driver).executeScript("return localStorage.getItem('qa-academy-terms-consent-v1')");
                assertEquals("accepted", consent);
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-SHELL-002")
    @DisplayName("[UI-SHELL-002] Responsive navigation exposes the sidebar and drawer")
    void ui_shell_002_responsiveNavigation() {
        WebDriver driver = AuthenticatedBrowser.create(true, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: app shell is loaded in mobile viewport", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("When: user opens the mobile navigation drawer", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("mobile-menu-open"))).click();
            });

            Steps.step("Then: mobile navigation drawer is exposed", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("app-shell")));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-STORE-001")
    @DisplayName("[UI-STORE-001] Store loads its catalog and controls")
    void ui_store_001_loadStore() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("When: user opens the Store", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("Then: catalog, search and filters are usable", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-search")));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-category-filter")));
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-type-filter")));
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid^='product-add-to-cart-']")));
                assertTrue(!driver.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).isEmpty());
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-STORE-002")
    @DisplayName("[UI-STORE-002] Store searches and filters products")
    void ui_store_002_searchAndFilterStore() {
        ProductService service = new ProductService();
        Map<String, Object> productPayload = Map.of(
                "name", UniqueName.product(),
                "price", 19.99,
                "stock", 10,
                "category", "Office",
                "type", "Physical",
                "permissions", "ALL"
        );
        Map<String, Object> product = service.createProduct(productPayload);
        int productId = ((Number) product.get("id")).intValue();
        String name = String.valueOf(product.get("name"));
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: controlled product exists in catalog", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("When: user searches by name and filters the category", () -> {
                WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-search")));
                search.clear();
                search.sendKeys(name);
                driver.findElement(By.xpath("//*[@data-testid='store-category-filter']//*[normalize-space()='Office']")).click();
            });

            Steps.step("Then: only the controlled product remains visible", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("product-add-to-cart-" + productId)));
                wait.until(d -> d.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).size() == 1);
                assertEquals(1, driver.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).size());
            });
        } finally {
            driver.quit();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-STORE-003")
    @DisplayName("[UI-STORE-003] Store paginates using the selected page size")
    void ui_store_003_paginateStore() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: store page is loaded", () -> {
                driver.get(Environment.BASE_URL + "/store");
            });

            Steps.step("When: user selects the smallest page size", () -> {
                WebElement sizeSelect = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-items-per-page")));
                new org.openqa.selenium.support.ui.Select(sizeSelect).selectByValue("5");
                wait.until(d -> d.findElements(By.cssSelector("[data-testid^='product-add-to-cart-']")).size() <= 5);
            });

            Steps.step("Then: the catalog is limited and navigation changes page", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("store-page-indicator")));
                assertTrue(driver.findElement(testId("store-page-indicator")).getText().contains("Page 1"));
                wait.until(ExpectedConditions.elementToBeClickable(testId("store-next"))).click();
                wait.until(d -> d.findElement(testId("store-page-indicator")).getText().contains("Page 2"));
            });
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PRODUCT-001")
    @DisplayName("[UI-PRODUCT-001] A newly created owned product is visible in administration")
    void ui_product_001_createOwnedProduct() {
        ProductService service = new ProductService();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        String name = String.valueOf(product.get("name"));
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: API creates controlled data because the UI has no create control", () -> {
                driver.get(Environment.BASE_URL + "/products");
            });

            Steps.step("When: user searches for the product in administration", () -> {
                WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-search")));
                search.clear();
                search.sendKeys(name);
            });

            Steps.step("Then: administration displays the product row", () -> {
                WebElement row = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("product-row-" + productId)));
                assertTrue(row.getText().contains(name));
            });
        } finally {
            driver.quit();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-PRODUCT-002")
    @DisplayName("[UI-PRODUCT-002] An edited owned product is updated in administration")
    void ui_product_002_editOwnedProduct() {
        ProductService service = new ProductService();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        String editedName = product.get("name") + "-edited";
        service.updateProduct(productId, Map.of("name", editedName));

        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: product was updated via API", () -> {
                driver.get(Environment.BASE_URL + "/products");
            });

            Steps.step("When: user searches for the updated product name", () -> {
                WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-search")));
                search.clear();
                search.sendKeys(editedName);
            });

            Steps.step("Then: row displays the new updated name", () -> {
                WebElement row = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("product-row-" + productId)));
                assertTrue(row.getText().contains(editedName));
            });
        } finally {
            driver.quit();
            service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-PRODUCT-003")
    @DisplayName("[UI-PRODUCT-003] An owned product is deleted from the UI")
    void ui_product_003_deleteOwnedProduct() {
        ProductService service = new ProductService();
        Map<String, Object> product = service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        int productId = ((Number) product.get("id")).intValue();
        String name = String.valueOf(product.get("name"));
        boolean deleted = false;

        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: product is located in administration table", () -> {
                driver.get(Environment.BASE_URL + "/products");
                WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-search")));
                search.clear();
                search.sendKeys(name);
            });

            Steps.step("When: user deletes the persistent row from administration", () -> {
                wait.until(ExpectedConditions.elementToBeClickable(testId("product-delete-" + productId))).click();
            });

            Steps.step("Then: confirmation appears and the row disappears", () -> {
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-success-toast")));
                wait.until(d -> d.findElements(testId("product-row-" + productId)).isEmpty());
            });
            deleted = true;
        } finally {
            driver.quit();
            if (!deleted) service.deleteProduct(productId);
        }
    }

    @Test
    @Story("UI-PRODUCT-004")
    @DisplayName("[UI-PRODUCT-004] A non-deletable product keeps its row protected")
    void ui_product_004_protectNonDeletableProduct() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        try {
            Steps.step("Given: user filters products by template type", () -> {
                driver.get(Environment.BASE_URL + "/products");
                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-table")));
                driver.findElement(By.xpath("//*[@data-testid='products-type-filter']//*[normalize-space()='Template']")).click();
            });

            Steps.step("When: user attempts to delete a protected template product", () -> {
                WebElement row = wait.until(d -> d.findElements(By.cssSelector("[data-testid^='product-row-']")).stream()
                        .filter(WebElement::isDisplayed).findFirst().orElse(null));
                assertNotNull(row, "Template product row should exist");
                String productId = row.getAttribute("data-testid").replace("product-row-", "");
                ((JavascriptExecutor) driver).executeScript("arguments[0].click()", driver.findElement(testId("product-delete-" + productId)));

                wait.until(ExpectedConditions.visibilityOfElementLocated(testId("products-error-toast")));
                assertTrue(driver.findElement(testId("product-row-" + productId)).isDisplayed());
            });
        } finally {
            driver.quit();
        }
    }
}
