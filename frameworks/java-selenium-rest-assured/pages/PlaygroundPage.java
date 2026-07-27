package pages;

import config.Environment;
import helpers.Steps;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public final class PlaygroundPage extends BasePage {
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
}
