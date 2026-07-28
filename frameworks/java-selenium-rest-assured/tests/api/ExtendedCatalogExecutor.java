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
import org.junit.jupiter.api.Assumptions;
import services.ProductService;

final class ExtendedCatalogExecutor {

    static void run(String id) {
        ExtendedCatalog.ApiCase scenario = ExtendedCatalog.API_CASES.stream()
                .filter(candidate -> candidate.id().equals(id))
                .findFirst().orElseThrow();
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

    private static void runCartItemLifecycle() {
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

    // One entry point per executable JUnit case; each resolves to the concrete flow above.
    static void api_auth_001() { run("API-AUTH-001"); }
    static void api_auth_002() { run("API-AUTH-002"); }
    static void api_auth_003() { run("API-AUTH-003"); }
    static void api_auth_004() { run("API-AUTH-004"); }
    static void api_health_001() { run("API-HEALTH-001"); }
    static void api_product_001() { run("API-PRODUCT-001"); }
    static void api_product_003() { run("API-PRODUCT-003"); }
    static void api_product_004() { run("API-PRODUCT-004"); }
    static void api_product_005() { run("API-PRODUCT-005"); }
    static void api_cart_001() { run("API-CART-001"); }
    static void api_cart_002() { run("API-CART-002"); }
    static void api_cart_003() { run("API-CART-003"); }
    static void api_cart_004() { run("API-CART-004"); }
    static void api_cart_005() { run("API-CART-005"); }
    static void api_cart_006() { run("API-CART-006"); }
    static void api_order_001() { run("API-ORDER-001"); }
    static void api_order_002() { run("API-ORDER-002"); }
    static void api_order_003() { run("API-ORDER-003"); }
    static void api_order_004() { run("API-ORDER-004"); }
    static void api_order_005() { run("API-ORDER-005"); }
    static void api_order_006() { run("API-ORDER-006"); }
    static void api_order_007() { run("API-ORDER-007"); }
    static void api_order_008() { run("API-ORDER-008"); }
    static void api_query_001() { run("API-QUERY-001"); }
    static void api_query_002() { run("API-QUERY-002"); }
    static void api_query_003() { run("API-QUERY-003"); }
    static void api_query_004() { run("API-QUERY-004"); }
    static void api_query_005() { run("API-QUERY-005"); }
    static void api_query_006() { run("API-QUERY-006"); }
    static void api_query_007() { run("API-QUERY-007"); }
    static void api_gql_001() { run("API-GQL-001"); }
    static void api_gql_002() { run("API-GQL-002"); }
    static void api_gql_003() { run("API-GQL-003"); }
    static void api_gql_004() { run("API-GQL-004"); }
    static void api_gql_005() { run("API-GQL-005"); }
    static void api_gql_006() { run("API-GQL-006"); }
    static void api_gql_007() { run("API-GQL-007"); }
}
