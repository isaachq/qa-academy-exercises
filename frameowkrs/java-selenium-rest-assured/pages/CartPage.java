package pages;

import org.junit.jupiter.api.Assertions;
import org.openqa.selenium.WebDriver;

public final class CartPage extends BasePage {
    public CartPage(WebDriver driver) { super(driver); }

    public void openAndVerify(String productName, int quantity, double unitPrice) {
        open("/cart");
        String items = visible("cart-items").getText();
        Assertions.assertTrue(items.contains(productName));
        Assertions.assertTrue(items.contains(String.valueOf(quantity)));
        Assertions.assertTrue(visible("cart-subtotal").getText()
                .contains("%.2f".formatted(quantity * unitPrice)));
    }

    public void proceedToCheckout() { visible("cart-checkout").click(); }
}
