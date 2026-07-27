package pages;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public final class StorePage extends BasePage {
    public StorePage(WebDriver driver) { super(driver); }

    public void openProduct(int id, String name) {
        open("/store");
        visible("store-search").sendKeys(name);
        visible("product-add-to-cart-" + id);
    }

    public Map<String, Integer> readInventory(int id) {
        visible("product-stock-info-" + id).click();
        String text = visible("stock-info-modal").getText();
        Map<String, Integer> values = Map.of(
                "stock", numberAfter(text, "Total Stock"),
                "reserved", numberAfter(text, "Reserved in Your Cart"),
                "available", numberAfter(text, "Available to Add"));
        visible("stock-info-close").click();
        return values;
    }

    private int numberAfter(String text, String label) {
        Matcher match = Pattern.compile(Pattern.quote(label) + ":\\s*(\\d+)",
                Pattern.CASE_INSENSITIVE).matcher(text);
        if (!match.find()) throw new AssertionError("Inventory value not found for " + label);
        return Integer.parseInt(match.group(1));
    }

    public void addToCart(int id) { visible("product-add-to-cart-" + id).click(); }

    public WebElement openOrderHistory(int productId, int orderId) {
        visible("product-order-history-" + productId).click();
        visible("order-history-modal");
        return visible("order-history-row-" + orderId);
    }

    public void assertMobileModalContract() {
        WebElement modal = visible("order-history-modal");
        Rectangle rect = modal.getRect();
        Dimension viewport = driver.manage().window().getSize();
        if (rect.getX() < 0 || rect.getY() < 0
                || rect.getX() + rect.getWidth() > viewport.getWidth()
                || rect.getHeight() > viewport.getHeight()) {
            throw new AssertionError("Order history modal is clipped on mobile");
        }
        Boolean backdropOwnsHitTarget = (Boolean) ((JavascriptExecutor) driver).executeScript(
                "const modal=arguments[0], backdrop=modal.parentElement;"
                        + "return getComputedStyle(backdrop).position==='fixed'"
                        + " && getComputedStyle(modal).overflowY==='auto'"
                        + " && backdrop.contains(document.elementFromPoint(1,1));",
                modal);
        if (!Boolean.TRUE.equals(backdropOwnsHitTarget)) {
            throw new AssertionError("Backdrop does not block the page or the panel cannot scroll");
        }
        visible("order-history-close").click();
    }
}
