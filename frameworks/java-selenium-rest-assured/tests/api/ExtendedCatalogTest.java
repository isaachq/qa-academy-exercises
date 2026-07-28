package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.TestData;
import data.ExtendedCatalog;
import helpers.UniqueName;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import services.ProductService;

public class ExtendedCatalogTest {
    @TestFactory
    Stream<DynamicTest> extendedApiCatalog() {
        return ExtendedCatalog.API_CASES.stream().map(scenario ->
                DynamicTest.dynamicTest("[" + scenario.id() + "] " + scenario.title(),
                        () -> run(scenario)));
    }

    private void run(ExtendedCatalog.ApiCase scenario) {
        if (scenario.id().equals("API-CART-002")) {
            runCartItemLifecycle();
            return;
        }

        String body = scenario.body();
        if (scenario.id().equals("API-AUTH-001")) {
            String password = System.getenv("UI_PASSWORD");
            Assumptions.assumeTrue(password != null && !password.isBlank(),
                    "UI_PASSWORD is required for the valid login contract");
            body = "{\"email\":\"" + Environment.required("UI_EMAIL")
                    + "\",\"password\":\"" + password + "\"}";
        }

        RequestSpecification request = given().headers(Environment.automationHeaders())
                .contentType(ContentType.JSON);
        if (!scenario.publicRequest()) {
            request.header("Authorization", "Bearer " + Environment.required("API_KEY"));
        }
        if (scenario.override()) {
            request.header("X-HTTP-Method-Override", "QUERY");
        }
        if (body != null) {
            request.body(body);
        }

        Response response = request.request(
                scenario.method(), Environment.BASE_URL + scenario.path());
        assertTrue(scenario.expected().contains(response.statusCode()), response.asString());

        if (scenario.id().equals("API-AUTH-003")) {
            String email = response.jsonPath().getString("data.email");
            if (email == null) email = response.jsonPath().getString("user.email");
            if (email == null) email = response.jsonPath().getString("email");
            assertEquals(Environment.required("UI_EMAIL"), email);
        }
        if (scenario.id().equals("API-QUERY-004")) {
            assertTrue(response.header("Allow").contains("QUERY"));
        }
        if (scenario.id().equals("API-GQL-002")) {
            assertTrue(response.jsonPath().getList("errors", Map.class).size() > 0);
        }
    }

    private void runCartItemLifecycle() {
        ProductService service = new ProductService();
        Integer productId = null;
        service.clearCart();
        try {
            Map<String, Object> product = service.createProduct(
                    ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            productId = ((Number) product.get("id")).intValue();
            Response added = service.addToCart(productId, 1);
            assertTrue(List.of(200, 201).contains(added.statusCode()), added.asString());
            int cartItemId = added.jsonPath().getInt("data.id");
            Response updated = service.updateCartItem(cartItemId, 2);
            assertEquals(200, updated.statusCode(), updated.asString());
            assertEquals(2, updated.jsonPath().getInt("data.quantity"));
            assertEquals(200, service.updateCartItem(cartItemId, 0).statusCode());
            assertEquals(404, service.getCartItem(cartItemId).statusCode());
        } finally {
            service.clearCart();
            if (productId != null) {
                service.deleteProduct(productId);
            }
        }
    }
}
