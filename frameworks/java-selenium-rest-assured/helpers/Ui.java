package helpers;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Waits that survive the client-side re-renders of the application under test.
 *
 * <p>Every page of the application mounts before its data arrives and re-renders when the
 * response lands. Selenium resolves an element once and keeps using that reference, so a
 * re-render between the lookup and the interaction raises
 * {@link StaleElementReferenceException}, and a list read too early looks empty. The other
 * three teaching frameworks get this for free from Playwright's auto-waiting locators; this
 * helper expresses the same contract explicitly for Selenium.
 */
public final class Ui {
    private Ui() {}

    /** Long enough for a cold serverless response, short enough to fail a real defect fast. */
    public static final Duration TIMEOUT = Duration.ofSeconds(20);

    /** A wait that keeps polling instead of aborting when a re-render detaches the subject. */
    public static WebDriverWait resilient(WebDriver driver) {
        WebDriverWait wait = new WebDriverWait(driver, TIMEOUT);
        wait.ignoring(StaleElementReferenceException.class);
        return wait;
    }

    /** First displayed element for the locator, re-querying while the list renders. */
    public static WebElement firstDisplayed(WebDriver driver, By locator) {
        return resilient(driver).until(d -> d.findElements(locator).stream()
                .filter(WebElement::isDisplayed)
                .findFirst()
                .orElse(null));
    }

    /**
     * Same as {@link #firstDisplayed} with one reload before giving up.
     *
     * <p>The hosted deployment occasionally answers the first data request of a page with a
     * challenge, which leaves the list permanently empty for that page load. A learner would
     * reload; the reload is what this expresses, so the case fails only when the application
     * really never renders the row.
     */
    public static WebElement firstDisplayedAfterReloadIfNeeded(WebDriver driver, By locator) {
        try {
            return firstDisplayed(driver, locator);
        } catch (TimeoutException firstAttempt) {
            driver.navigate().refresh();
            return firstDisplayed(driver, locator);
        }
    }

    /**
     * Types into a field, re-finding it when a re-render detaches it mid-edit.
     *
     * <p>The retry starts from an empty field so a partially typed value is never doubled.
     */
    public static void type(WebDriver driver, By locator, String text) {
        resilient(driver).until(d -> {
            WebElement field = d.findElement(locator);
            if (!field.isDisplayed() || !field.isEnabled()) {
                return null;
            }
            String current = field.getDomProperty("value");
            if (current != null && !current.isEmpty()) {
                field.clear();
            }
            field.sendKeys(text);
            return field;
        });
    }

    /** Clicks an element, re-finding it when a re-render replaces it before the click lands. */
    public static void click(WebDriver driver, By locator) {
        resilient(driver).until(d -> {
            WebElement element = d.findElement(locator);
            if (!element.isDisplayed() || !element.isEnabled()) {
                return null;
            }
            element.click();
            return element;
        });
    }
}
