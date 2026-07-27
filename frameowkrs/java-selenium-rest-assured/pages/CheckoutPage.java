package pages;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public final class CheckoutPage extends BasePage {
    public CheckoutPage(WebDriver driver) { super(driver); }

    public int placeOrder() {
        visible("checkout-use-fake-name-email").click();
        visible("checkout-use-fake-address").click();
        visible("checkout-use-testing-card").click();
        visible("checkout-submit").click();
        wait.until(ExpectedConditions.urlMatches("/orders/\\d+$"));
        Matcher match = Pattern.compile("/orders/(\\d+)$").matcher(driver.getCurrentUrl());
        if (!match.find()) throw new AssertionError("Order ID was not present in the order detail URL");
        return Integer.parseInt(match.group(1));
    }
}
