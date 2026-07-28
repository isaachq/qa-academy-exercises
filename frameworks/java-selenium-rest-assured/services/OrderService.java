package services;

import static io.restassured.RestAssured.given;

import config.Environment;
import data.TestData;
import helpers.UniqueName;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import java.util.LinkedHashMap;
import java.util.Map;

/** Creates an isolated persisted order for tests that must not depend on shared history. */
public final class OrderService {
    public record ControlledOrder(Map<String, Object> order, Map<String, Object> product) {
        public int orderId() { return ((Number) order.get("id")).intValue(); }
        public int productId() { return ((Number) product.get("id")).intValue(); }
    }

    private final ProductService products = new ProductService();

    private Map<String, String> headers() {
        Map<String, String> headers = new LinkedHashMap<>(Environment.automationHeaders());
        headers.put("Authorization", "Bearer " + Environment.required("API_KEY"));
        return headers;
    }

    public ControlledOrder createControlledOrder() {
        products.clearCart();
        Map<String, Object> product = products.createProduct(
                ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
        try {
            Response added = products.addToCart(((Number) product.get("id")).intValue(), 1);
            if (added.statusCode() != 201) throw new AssertionError(added.asString());
            Map<String, Object> shipping = Map.of(
                    "full_name", "Framework Test User", "email", "framework." + System.nanoTime() + "@example.test",
                    "address_line", "123 Main Street", "city", "New York", "state", "NY",
                    "zip_code", "10001", "country", "USA", "is_fake", true);
            Map<String, Object> payment = Map.of("card_number", "4242424242424242",
                    "expiry_date", "12/25", "cvv", "123", "brand", "Visa", "payment_status", "paid");
            Map<String, Object> financial = Map.of("tax", 0, "shipping", 0, "state", "NY", "country", "USA");
            Response response = create(shipping, payment, financial);
            if (response.statusCode() == 400 && "SYNC_ERROR".equals(response.jsonPath().getString("error"))) {
                financial = Map.of("tax", response.jsonPath().getDouble("correct_values.tax"),
                        "shipping", response.jsonPath().getDouble("correct_values.shipping_cost"),
                        "state", "NY", "country", "USA");
                response = create(shipping, payment, financial);
            }
            if (response.statusCode() != 201) throw new AssertionError(response.asString());
            Map<String, Object> order = new LinkedHashMap<>(response.jsonPath().getMap("data"));
            order.put("id", order.get("order_id"));
            return new ControlledOrder(order, product);
        } catch (RuntimeException | AssertionError error) {
            products.clearCart(); products.deleteProduct(((Number) product.get("id")).intValue());
            throw error;
        }
    }

    private Response create(Map<String, Object> shipping, Map<String, Object> payment,
            Map<String, Object> financial) {
        return given().headers(headers()).contentType(ContentType.JSON)
                .body(Map.of("shipping", shipping, "payment", payment, "financial", financial))
                .post(Environment.BASE_URL + "/api/orders");
    }

    public Map<String, Object> get(int id) {
        Response response = given().headers(headers()).get(Environment.BASE_URL + "/api/orders/" + id);
        if (response.statusCode() != 200) throw new AssertionError(response.asString());
        return response.jsonPath().getMap("data");
    }

    public void cleanup(ControlledOrder controlled) {
        if (controlled == null) return;
        products.deleteOrder(controlled.orderId()); products.clearCart(); products.deleteProduct(controlled.productId());
    }
}
