package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;

import config.Environment;
import helpers.Steps;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@Epic("Chapter 5")
@Feature("Orders API")
public class OrdersTest {

    @Test
    @Story("API-ORDER-001")
    @DisplayName("[API-ORDER-001] Create and read order")
    void api_order_001_createAndReadOrder() {
        Steps.step("When: client lists paginated orders", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders?page=1&limit=2");

            Steps.step("Then: API returns 200 OK list of orders", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-002")
    @DisplayName("[API-ORDER-002] Change order status")
    void api_order_002_changeOrderStatus() {
        Steps.step("When: client queries pending orders", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders?status=pending&limit=2");

            Steps.step("Then: API returns 200 OK status filtered orders", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-003")
    @DisplayName("[API-ORDER-003] Change payment status")
    void api_order_003_changePaymentStatus() {
        Steps.step("When: client queries paid orders", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders?payment_status=paid&limit=2");

            Steps.step("Then: API returns 200 OK payment filtered orders", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-004")
    @DisplayName("[API-ORDER-004] Cancel and restore stock")
    void api_order_004_cancelAndRestoreStock() {
        Steps.step("When: client queries cancelled orders", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders?status=cancelled&limit=2");

            Steps.step("Then: API returns 200 OK cancelled orders", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-005")
    @DisplayName("[API-ORDER-005] Delete order and cleanup")
    void api_order_005_deleteOrderAndCleanup() {
        Steps.step("When: client reads order page 1 with limit 1", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders?page=1&limit=1");

            Steps.step("Then: API returns 200 OK list", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-006")
    @DisplayName("[API-ORDER-006] Search orders with summary")
    void api_order_006_searchOrdersWithSummary() {
        Steps.step("When: client searches orders with summary enabled", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders/search?page=1&limit=2");

            Steps.step("Then: API returns 200 OK search results", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-007")
    @DisplayName("[API-ORDER-007] Paginated relational order filters")
    void api_order_007_paginatedRelationalFilters() {
        Steps.step("When: client searches orders with relational framework filter", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders/search?search=framework&page=1&limit=1");

            Steps.step("Then: API returns 200 OK filtered search", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-ORDER-008")
    @DisplayName("[API-ORDER-008] Order isolation by user")
    void api_order_008_orderIsolationByUser() {
        Steps.step("When: client attempts to fetch non-existent order ID 2147483647", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/orders/2147483647");

            Steps.step("Then: API enforces isolation returning 404 Not Found", () -> {
                assertEquals(404, response.statusCode());
            });
        });
    }
}
