package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import helpers.Steps;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@Epic("Chapter 5")
@Feature("HTTP QUERY API")
public class QueryTest {

    private static final String PRODUCT_QUERY =
            "{\"filters\":{},\"sort\":{\"field\":\"id\",\"direction\":\"asc\"},\"pagination\":{\"page\":1,\"limit\":2}}";
    private static final String ORDER_QUERY =
            "{\"filters\":{},\"sort\":{\"field\":\"total\",\"direction\":\"asc\"},\"pagination\":{\"page\":1,\"limit\":2}}";

    @Test
    @Story("API-QUERY-001")
    @DisplayName("[API-QUERY-001] Native QUERY products")
    void api_query_001_nativeQueryProducts() {
        Steps.step("When: client sends native QUERY method to /api/products/query", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(PRODUCT_QUERY)
                    .request("QUERY", Environment.BASE_URL + "/api/products/query");

            Steps.step("Then: API responds with 200 OK query payload", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-QUERY-002")
    @DisplayName("[API-QUERY-002] POST override QUERY")
    void api_query_002_postOverrideQuery() {
        Steps.step("When: client sends POST with X-HTTP-Method-Override: QUERY header", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .header("X-HTTP-Method-Override", "QUERY")
                    .contentType(ContentType.JSON)
                    .body(PRODUCT_QUERY)
                    .post(Environment.BASE_URL + "/api/products/query");

            Steps.step("Then: API overrides method and responds with 200 OK", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-QUERY-003")
    @DisplayName("[API-QUERY-003] Plain POST query")
    void api_query_003_plainPostQuery() {
        Steps.step("When: client sends standard POST to /api/products/query", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(PRODUCT_QUERY)
                    .post(Environment.BASE_URL + "/api/products/query");

            Steps.step("Then: API processes query and responds with 200 OK", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-QUERY-004")
    @DisplayName("[API-QUERY-004] Reject GET query")
    void api_query_004_rejectGetQuery() {
        Steps.step("When: client attempts HTTP GET on /api/products/query", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/products/query");

            Steps.step("Then: API rejects request with 405 Method Not Allowed and Allow header contains QUERY", () -> {
                assertEquals(405, response.statusCode());
                assertTrue(response.header("Allow").contains("QUERY"));
            });
        });
    }

    @Test
    @Story("API-QUERY-005")
    @DisplayName("[API-QUERY-005] Native QUERY orders")
    void api_query_005_nativeQueryOrders() {
        Steps.step("When: client sends native QUERY request to /api/orders/query", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(ORDER_QUERY)
                    .request("QUERY", Environment.BASE_URL + "/api/orders/query");

            Steps.step("Then: API responds with 200 OK orders query payload", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-QUERY-006")
    @DisplayName("[API-QUERY-006] Order relation before pagination")
    void api_query_006_orderRelationBeforePagination() {
        Steps.step("When: client sends POST query to /api/orders/query", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(ORDER_QUERY)
                    .post(Environment.BASE_URL + "/api/orders/query");

            Steps.step("Then: API resolves relations before applying pagination returning 200 OK", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-QUERY-007")
    @DisplayName("[API-QUERY-007] QUERY validation")
    void api_query_007_queryValidation() {
        Steps.step("When: client sends out-of-bounds pagination values in query body", () -> {
            String invalidQuery = "{\"pagination\":{\"page\":0,\"limit\":101}}";
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(invalidQuery)
                    .post(Environment.BASE_URL + "/api/products/query");

            Steps.step("Then: API responds with 400 Bad Request", () -> {
                assertEquals(400, response.statusCode());
            });
        });
    }
}
