package pages;

import config.Environment;
import helpers.Steps;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.interactions.Actions;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class PlaygroundPage extends BasePage {
    private static final List<String> SECTION_IDS = List.of(
            "section-text-inputs", "section-buttons", "section-radio", "section-checkbox",
            "section-dropdown", "section-other-inputs", "section-modals", "section-table",
            "section-tabs", "section-accordion", "section-links", "section-loading",
            "section-badges", "section-contact-form", "section-order-form",
            "section-advanced-datatable", "section-basic-auth", "section-iframe",
            "section-geolocation", "section-hover", "section-new-tab",
            "section-download-upload", "section-flakiness", "section-shadow-dom");
    public PlaygroundPage(WebDriver driver) { super(driver); }

    public void openWithSeed(long seed) {
        Steps.step(Steps.Actions.PLAYGROUND_OPEN, () -> {
            // Navigate to the domain first to establish context for localStorage
            driver.get(Environment.BASE_URL + "/playground");
            ((JavascriptExecutor) driver).executeScript(
                    "localStorage.setItem('flaky_seed', arguments[0]);", String.valueOf(seed));
            // Reload the page to apply the seed
            driver.navigate().refresh();
        });
    }

    public void expectSeed(long seed) {
        Steps.step(Steps.Actions.PLAYGROUND_VERIFY_SEED, () -> {
            if (!visible("flaky-seed-display").getText().contains(String.valueOf(seed))) {
                throw new AssertionError("The fixed flaky seed was not applied");
            }
        });
    }

    public void triggerFastSuccess() {
        Steps.step(Steps.Actions.PLAYGROUND_TRIGGER, () -> visible("trigger-success-fast").click());
    }

    public void expectInvoiceModal(long seed) {
        Steps.step(Steps.Actions.PLAYGROUND_VERIFY_INVOICE, () -> {
            visible("flaky-invoice-modal");
            visible("flaky-invoice-status");
            if (!visible("flaky-seed-display").getText().contains(String.valueOf(seed))) {
                throw new AssertionError("The fixed flaky seed changed during the run");
            }
        });
    }

    public void open() { driver.get(Environment.BASE_URL + "/playground"); visible("section-text-inputs"); }

    public void expectCompleteSectionContract() {
        for (String id : SECTION_IDS) {
            if (driver.findElements(By.cssSelector("[data-testid='" + id + "']")).size() != 1) {
                throw new AssertionError(id + " must occur exactly once");
            }
        }
        List<WebElement> elements = driver.findElements(By.cssSelector("[data-testid]"));
        Set<String> ids = new HashSet<>();
        for (WebElement element : elements) {
            String id = element.getAttribute("data-testid");
            if (id != null && !ids.add(id)) throw new AssertionError("Duplicate data-testid: " + id);
        }
    }

    public void expectContactFormValidationAndBoundaries() {
        wait.until(ExpectedConditions.elementToBeClickable(testId("open-contact-modal"))).click();
        visible("contact-submit").click();
        visible("contact-name-error"); visible("contact-email-error"); visible("contact-message-error");
        visible("contact-name").sendKeys("Boundary User");
        visible("contact-email").sendKeys("boundary@example.test");
        visible("contact-message").sendKeys("A".repeat(500));
        visible("contact-submit").click();
        visible("contact-success-close").click();
    }

    public void expectModalTabsAndAccordion() {
        visible("button-show-modal").click(); visible("modal-content"); visible("modal-cancel").click();
        visible("tab-button-2").click(); visible("tab-panel-2");
        WebElement accordion = visible("accordion-button-1");
        accordion.click(); visible("accordion-content-1"); accordion.click();
    }

    public void expectDataTableContract() {
        wait.until(ExpectedConditions.elementToBeClickable(testId("open-datatable"))).click();
        visible("datatable-modal");
        By rows = By.cssSelector("[data-testid^='datatable-row-']");
        wait.until(d -> d.findElements(rows).size() == 100);
        WebElement search = visible("datatable-search");
        search.sendKeys("Alice"); wait.until(d -> !d.findElements(rows).isEmpty() && d.findElements(rows).size() < 100);
        search.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        visible("sort-name").click();
        if (!visible("sort-name").getText().contains("↑")) throw new AssertionError("Name was not sorted ascending");
        visible("datatable-close").click();
    }

    public void expectIframeHoverAndNewTab() {
        driver.switchTo().frame(visible("example-iframe"));
        wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("body")));
        if (driver.findElement(By.tagName("body")).getText().isBlank()) throw new AssertionError("iframe is empty");
        driver.switchTo().defaultContent();
        new Actions(driver).moveToElement(visible("hover-button-1")).perform(); visible("hover-span");
        String original = driver.getWindowHandle();
        visible("open-new-tab-form").click();
        wait.until(d -> d.getWindowHandles().size() == 2);
        driver.getWindowHandles().stream().filter(h -> !h.equals(original)).findFirst().ifPresent(driver.switchTo()::window);
        if (!driver.getCurrentUrl().contains("/playground/second-form")) throw new AssertionError("Unexpected popup URL");
        driver.close(); driver.switchTo().window(original); visible("section-new-tab");
    }

    public void expectDownloadAndUpload() {
        visible("download-csv").click();
        try {
            Path upload = Files.createTempFile("playground-upload", ".txt");
            Files.writeString(upload, "traceable playground upload");
            present("file-upload-input").sendKeys(upload.toAbsolutePath().toString());
            visible("uploading-state"); visible("upload-success");
            Files.deleteIfExists(upload);
        } catch (java.io.IOException error) { throw new AssertionError(error); }
    }

    public void expectOpenShadowDom() {
        WebElement host = visible("shadow-host");
        var root = host.getShadowRoot();
        root.findElement(By.cssSelector("[data-testid='shadow-input']")).sendKeys("traceable automation");
        root.findElement(By.cssSelector("[data-testid='shadow-submit']")).click();
        String result = root.findElement(By.cssSelector("[data-testid='shadow-result']")).getText();
        if (!result.equals("Shadow DOM received: traceable automation")) throw new AssertionError(result);
    }
}
