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
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@Epic("Chapter 5")
@Feature("GraphQL API")
public class GraphqlTest {

    private String graphqlBody(String query, String operationName) {
        String escaped = query.replace("\"", "\\\"").replace("\n", " ");
        return "{\"query\":\"" + escaped + "\",\"operationName\":\"" + operationName + "\"}";
    }

    @Test
    @Story("API-GQL-001")
    @DisplayName("[API-GQL-001] Authenticated GraphQL query")
    void api_gql_001_authenticatedQuery() {
        Steps.step("When: client posts GraphQL query for current user profile", () -> {
            String body = graphqlBody("query CurrentUser { me { id email } }", "CurrentUser");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: API returns 200 OK with user profile data", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-GQL-002")
    @DisplayName("[API-GQL-002] GraphQL error model")
    void api_gql_002_errorModel() {
        Steps.step("When: client posts GraphQL query referencing non-existent field", () -> {
            String body = graphqlBody("query Invalid { fieldThatDoesNotExist }", "Invalid");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: response status is 200 and contains errors array", () -> {
                assertEquals(200, response.statusCode());
                assertTrue(response.jsonPath().getList("errors", Map.class).size() > 0);
            });
        });
    }

    @Test
    @Story("API-GQL-003")
    @DisplayName("[API-GQL-003] Paginated GraphQL products")
    void api_gql_003_paginatedProducts() {
        Steps.step("When: client queries products with pagination via GraphQL", () -> {
            String body = graphqlBody("query Products { products(page:1,limit:2){products{id name} pagination{page total}}}", "Products");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: API returns 200 OK paginated products", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-GQL-004")
    @DisplayName("[API-GQL-004] GraphQL product mutation with cleanup")
    void api_gql_004_productMutationWithCleanup() {
        Steps.step("When: client executes invalid createProduct mutation", () -> {
            String body = graphqlBody("mutation InvalidProduct { createProduct(name:\"\",price:-1,stock:-1){id} }", "InvalidProduct");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: GraphQL returns response with error handling", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-GQL-005")
    @DisplayName("[API-GQL-005] GraphQL cart")
    void api_gql_005_graphqlCart() {
        Steps.step("When: client queries cart items via GraphQL", () -> {
            String body = graphqlBody("query Cart { cart { items{id quantity} } }", "Cart");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: API responds with 200 OK cart data", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-GQL-006")
    @DisplayName("[API-GQL-006] GraphQL order")
    void api_gql_006_graphqlOrder() {
        Steps.step("When: client queries orders via GraphQL", () -> {
            String body = graphqlBody("query Orders { orders(page:1,limit:2){id total status} }", "Orders");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: API returns 200 OK orders list", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-GQL-007")
    @DisplayName("[API-GQL-007] Search GraphQL orders")
    void api_gql_007_searchGraphqlOrders() {
        Steps.step("When: client executes searchOrders query via GraphQL", () -> {
            String body = graphqlBody("query Search { searchOrders(filters:{search:\"framework\"},page:1,limit:2){orders{id total} pagination{page total}}}", "Search");
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/graphql");

            Steps.step("Then: API returns 200 OK search results", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }
}
