package pages;

import config.Environment;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public final class PlaygroundPage extends BasePage {
    public PlaygroundPage(WebDriver driver) { super(driver); }

    public void openWithSeed(long seed) {
        ((JavascriptExecutor) driver).executeScript(
                "localStorage.setItem('flaky_seed', arguments[0]);", String.valueOf(seed));
        driver.get(Environment.BASE_URL + "/playground");
        if (!visible("flaky-seed-display").getText().contains(String.valueOf(seed))) {
            throw new AssertionError("The fixed flaky seed was not applied");
        }
    }

    public void runFastSuccess() {
        visible("trigger-success-fast").click();
        visible("flaky-invoice-modal");
        visible("flaky-invoice-status");
    }
}
