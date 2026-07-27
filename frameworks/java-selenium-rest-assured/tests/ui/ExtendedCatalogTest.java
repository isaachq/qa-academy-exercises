package tests.ui;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import config.Environment;
import data.ExtendedCatalog;
import fixtures.AuthenticatedBrowser;
import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ExtendedCatalogTest {
    private static final List<String> SECTION_IDS = List.of(
            "section-text-inputs", "section-buttons", "section-radio", "section-checkbox",
            "section-dropdown", "section-other-inputs", "section-modals", "section-table",
            "section-tabs", "section-accordion", "section-links", "section-loading",
            "section-badges", "section-contact-form", "section-order-form",
            "section-advanced-datatable", "section-basic-auth", "section-iframe",
            "section-geolocation", "section-hover", "section-new-tab",
            "section-download-upload", "section-flakiness", "section-shadow-dom");

    @TestFactory
    Stream<DynamicTest> extendedUiCatalog() {
        return ExtendedCatalog.UI_CASES.stream().map(scenario ->
                DynamicTest.dynamicTest("[" + scenario.id() + "] " + scenario.title(),
                        () -> run(scenario)));
    }

    private void run(ExtendedCatalog.UiCase scenario) {
        WebDriver driver = AuthenticatedBrowser.create(scenario.mobile());
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
            if (scenario.id().equals("UI-SHELL-001")) {
                ((JavascriptExecutor) driver).executeScript(
                        "localStorage.removeItem('qa-academy-terms-consent-v1')");
                driver.get(Environment.BASE_URL + scenario.route());
                wait.until(d -> d.findElement(testId("terms-gate-dialog")).isDisplayed());
                driver.findElement(testId("terms-gate-accept")).click();
                assertEquals("accepted", ((JavascriptExecutor) driver).executeScript(
                        "return localStorage.getItem('qa-academy-terms-consent-v1')"));
                return;
            }

            driver.get(Environment.BASE_URL + scenario.route());
            if (scenario.id().equals("UI-SHELL-002")) {
                wait.until(d -> d.findElement(testId("mobile-menu-open"))).click();
            }
            List<String> selectors = scenario.id().equals("UI-PLAY-001")
                    ? SECTION_IDS : scenario.selectors();
            for (String selector : selectors) {
                assertNotNull(wait.until(d -> d.findElement(testId(selector))));
            }
        } finally {
            driver.quit();
        }
    }

    private static By testId(String value) {
        return By.cssSelector("[data-testid='" + value + "']");
    }
}
