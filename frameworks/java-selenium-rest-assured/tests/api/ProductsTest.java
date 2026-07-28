package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;

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
@Feature("Products API")
public class ProductsTest {

    @Test
    @Story("API-PRODUCT-001")
    @DisplayName("[API-PRODUCT-001] List and paginate products")
    void api_product_001_listAndPaginateProducts() {
        Steps.step("When: client requests page 1 of products with limit 2", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/products?page=1&limit=2");

            Steps.step("Then: response returns 200 OK with paginated list", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-PRODUCT-003")
    @DisplayName("[API-PRODUCT-003] Product validation and limits")
    void api_product_003_validationAndLimits() {
        Steps.step("When: client posts invalid empty product payload", () -> {
            String body = "{\"name\":\"\",\"price\":-1,\"stock\":-1}";
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/products");

            Steps.step("Then: API responds with 400 Bad Request", () -> {
                assertEquals(400, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-PRODUCT-004")
    @DisplayName("[API-PRODUCT-004] Product permissions")
    void api_product_004_permissions() {
        Steps.step("When: client filters products by non-deletable permission N_DELETE", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/products?permission=N_DELETE&limit=1");

            Steps.step("Then: API returns 200 OK filtered list", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-PRODUCT-005")
    @DisplayName("[API-PRODUCT-005] Product categories and stock")
    void api_product_005_categoriesAndStock() {
        Steps.step("When: client queries product categories list", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/products/categories");

            Steps.step("Then: API responds with 200 OK category list", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }
}
