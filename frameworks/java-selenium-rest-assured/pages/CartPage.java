package pages;

import helpers.Steps;
import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.WebDriver;

public final class CartPage extends BasePage {
    public CartPage(WebDriver driver) { super(driver); }

    public void openCart() {
        Steps.step(Steps.Actions.CART_OPEN, () -> open("/cart"));
    }

    public void expectItem(String productName, int quantity, double unitPrice) {
        Steps.step(Steps.Actions.CART_VERIFY_ITEM, () -> {
            String items = visible("cart-items").getText();
            Assertions.assertTrue(items.contains(productName));
            Assertions.assertTrue(items.contains(String.valueOf(quantity)));
            Assertions.assertTrue(visible("cart-subtotal").getText()
                    .contains("%.2f".formatted(quantity * unitPrice)));
        });
    }

    public void proceedToCheckout() {
        Steps.step(Steps.Actions.CART_CHECKOUT, () -> visible("cart-checkout").click());
    }
}
