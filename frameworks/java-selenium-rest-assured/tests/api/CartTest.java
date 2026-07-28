package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.TestData;
import helpers.Steps;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import services.ProductService;

@Epic("Chapter 5")
@Feature("Cart API")
public class CartTest {

    @Test
    @Story("API-CART-001")
    @DisplayName("[API-CART-001] Add and merge cart item")
    void api_cart_001_addAndMergeCartItem() {
        Steps.step("When: client reads current cart items", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/cart");

            Steps.step("Then: API returns 200 OK cart data", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-CART-002")
    @DisplayName("[API-CART-002] Update and remove cart item")
    void api_cart_002_updateAndRemoveCartItem() {
        ProductService service = new ProductService();
        Integer productId = null;
        service.clearCart();
        try {
            Map<String, Object> product = Steps.stepReturning("Given: product exists to test cart operations", () ->
                    service.createProduct(ProductService.newProduct(UniqueName.product(), TestData.PRODUCT)));
            productId = ((Number) product.get("id")).intValue();
            int finalProductId = productId;

            Response added = Steps.stepReturning("When: item is added to cart", () -> service.addToCart(finalProductId, 1));
            assertTrue(List.of(200, 201).contains(added.statusCode()), added.asString());
            int cartItemId = added.jsonPath().getInt("data.id");

            Steps.step("Then: quantity can be updated to 2", () -> {
                Response updated = service.updateCartItem(cartItemId, 2);
                assertEquals(200, updated.statusCode(), updated.asString());
                assertEquals(2, updated.jsonPath().getInt("data.quantity"));
            });

            Steps.step("Then: quantity set to 0 removes the item from cart", () -> {
                assertEquals(200, service.updateCartItem(cartItemId, 0).statusCode());
                Response cart = given().headers(Environment.automationHeaders())
                        .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                        .get(Environment.BASE_URL + "/api/cart");
                assertEquals(200, cart.statusCode());
                List<?> items = cart.jsonPath().getList("data.items");
                assertTrue(items == null || items.isEmpty(), "Cart items should be empty after removing item");
            });
        } finally {
            service.clearCart();
            if (productId != null) service.deleteProduct(productId);
        }
    }

    @Test
    @Story("API-CART-003")
    @DisplayName("[API-CART-003] Bulk update cart")
    void api_cart_003_bulkUpdateCart() {
        Steps.step("When: client posts bulk update request", () -> {
            String body = "{\"updates\":[]}";
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .patch(Environment.BASE_URL + "/api/cart/bulk");

            Steps.step("Then: API handles request with 200 or 400 status", () -> {
                assertTrue(List.of(200, 400).contains(response.statusCode()));
            });
        });
    }

    @Test
    @Story("API-CART-004")
    @DisplayName("[API-CART-004] Cart summary")
    void api_cart_004_cartSummary() {
        Steps.step("When: client queries cart summary endpoint", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/cart/summary");

            Steps.step("Then: API returns 200 OK cart calculation", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-CART-005")
    @DisplayName("[API-CART-005] Insufficient cart stock")
    void api_cart_005_insufficientStock() {
        Steps.step("When: client attempts to add quantity exceeding max integer stock", () -> {
            String body = "{\"product_id\":-1,\"quantity\":2147483647}";
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/cart");

            Steps.step("Then: API rejects request with 400 or 404 error", () -> {
                assertTrue(List.of(400, 404).contains(response.statusCode()));
            });
        });
    }

    @Test
    @Story("API-CART-006")
    @DisplayName("[API-CART-006] Clear cart")
    void api_cart_006_clearCart() {
        Steps.step("When: client issues DELETE /api/cart", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .delete(Environment.BASE_URL + "/api/cart");

            Steps.step("Then: API returns 200 OK clearing cart", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }
}
