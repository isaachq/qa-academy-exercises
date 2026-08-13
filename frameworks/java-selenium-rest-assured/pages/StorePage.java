package pages;

import helpers.Steps;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public final class StorePage extends BasePage {
    public StorePage(WebDriver driver) { super(driver); }

    public void openStore() {
        Steps.step(Steps.Actions.STORE_OPEN, () -> open("/store"));
    }

    public void searchProduct(int id, String name) {
        Steps.step(Steps.Actions.STORE_SEARCH, () -> {
            WebElement input = visible("store-search");
            input.clear();
            input.sendKeys(name);
            visible("product-add-to-cart-" + id);
        });
    }

    public void openProduct(int id, String name) {
        openStore();
        searchProduct(id, name);
    }

    public Map<String, Integer> readInventory(int id) {
        return Steps.stepReturning(Steps.Actions.STORE_READ_INVENTORY, () -> {
            // Retry the click until the modal opens.  On mobile emulation the first
            // click may land during a brief post-navigation card transition and be
            // absorbed without opening the modal; scrolling the button to the centre
            // of the viewport before each attempt mirrors Playwright's actionability
            // checks and allows the transition to finish between polls.
            wait.until(d -> {
                try {
                    WebElement btn = ExpectedConditions.elementToBeClickable(
                            testId("product-stock-info-" + id)).apply(d);
                    if (btn == null) return null;
                    ((JavascriptExecutor) d).executeScript(
                            "arguments[0].scrollIntoView({block:'center'})", btn);
                    btn.click();
                    return ExpectedConditions.visibilityOfElementLocated(
                            testId("stock-info-modal")).apply(d);
                } catch (org.openqa.selenium.StaleElementReferenceException e) {
                    return null;
                }
            });
            String text = visible("stock-info-modal").getText();
            Map<String, Integer> values = Map.of(
                    "stock", numberAfter(text, "Total Stock"),
                    "reserved", numberAfter(text, "Reserved in Your Cart"),
                    "available", numberAfter(text, "Available to Add"));
            visible("stock-info-close").click();
            return values;
        });
    }

    private int numberAfter(String text, String label) {
        Matcher match = Pattern.compile(Pattern.quote(label) + ":\\s*(\\d+)",
                Pattern.CASE_INSENSITIVE).matcher(text);
        if (!match.find()) throw new AssertionError("Inventory value not found for " + label);
        return Integer.parseInt(match.group(1));
    }

    public void addToCart(int id) {
        Steps.step(Steps.Actions.STORE_ADD_TO_CART,
                () -> visible("product-add-to-cart-" + id).click());
    }

    public void expectReserved(int id, int expectedReserved) {
        Steps.step(Steps.Actions.STORE_VERIFY_RESERVED, () -> {
            // Use textContent (all DOM text regardless of CSS visibility) so that the check
            // matches Playwright's toContainText behaviour on mobile layouts where the
            // reserved-count node may be CSS-hidden until the cart API responds.
            wait.until(d -> {
                try {
                    String text = (String) ((JavascriptExecutor) d)
                            .executeScript("return arguments[0].textContent",
                                    d.findElement(testId("product-stock-info-" + id))
                                     .findElement(org.openqa.selenium.By.xpath("..")));
                    return text != null && text.contains("Reserved: " + expectedReserved);
                } catch (org.openqa.selenium.StaleElementReferenceException e) {
                    return false;
                }
            });
        });
    }

    public void openOrderHistory(int productId) {
        Steps.step(Steps.Actions.STORE_OPEN_ORDER_HISTORY, () -> {
            visible("product-order-history-" + productId).click();
            visible("order-history-modal");
        });
    }

    public void expectOrderRow(int orderId, int quantity, String status) {
        Steps.step(Steps.Actions.STORE_VERIFY_ORDER_ROW, () -> {
            WebElement row = visible("order-history-row-" + orderId);
            String text = row.getText().toLowerCase();
            if (!text.contains(String.valueOf(quantity))) {
                throw new AssertionError("Order history row does not show quantity " + quantity);
            }
            if (!text.contains(status.toLowerCase())) {
                throw new AssertionError("Order history row does not show status " + status);
            }
        });
    }

    public void expectMobileModalContract() {
        Steps.step(Steps.Actions.STORE_VERIFY_MOBILE_MODAL, () -> {
            WebElement modal = visible("order-history-modal");
            Rectangle rect = modal.getRect();
            JavascriptExecutor js = (JavascriptExecutor) driver;
            long viewportWidth = ((Number) js.executeScript("return window.innerWidth")).longValue();
            long viewportHeight = ((Number) js.executeScript("return window.innerHeight")).longValue();
            if (rect.getX() < 0
                    || rect.getX() + rect.getWidth() > viewportWidth
                    || rect.getHeight() > viewportHeight) {
                throw new AssertionError("Order history modal is clipped on mobile");
            }
            Boolean backdropOwnsHitTarget = (Boolean) js.executeScript(
                    "const modal=arguments[0], backdrop=modal.parentElement;"
                            + "return getComputedStyle(backdrop).position==='fixed'"
                            + " && getComputedStyle(modal).overflowY==='auto'"
                            + " && backdrop.contains(document.elementFromPoint(1,1));",
                    modal);
            if (!Boolean.TRUE.equals(backdropOwnsHitTarget)) {
                throw new AssertionError(
                        "Backdrop does not block the page or the panel cannot scroll");
            }
            visible("order-history-close").click();
        });
    }
}
