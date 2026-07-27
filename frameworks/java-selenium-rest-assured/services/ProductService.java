package services;

import static io.restassured.RestAssured.given;

import config.Environment;
import helpers.Steps;
import io.qameta.allure.Allure;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import java.util.LinkedHashMap;
import java.util.Map;

public final class ProductService {
    private Map<String, String> headers() {
        return Map.of("Authorization", "Bearer " + Environment.required("API_KEY"));
    }

    public void clearCart() {
        Steps.step(Steps.Actions.API_CLEAR_CART, () -> {
            given().headers(headers()).delete(Environment.BASE_URL + "/api/cart");
        });
    }

    public Map<String, Object> createProduct(Map<String, Object> product) {
        return Steps.stepReturning(Steps.Actions.API_CREATE_PRODUCT, () -> {
            Response response = given().headers(headers()).contentType(ContentType.JSON)
                    .body(product).post(Environment.BASE_URL + "/api/products");
            Allure.addAttachment("Create product", ContentType.JSON.toString(),
                    "{\"responseStatus\":" + response.statusCode() + "}", ".json");
            response.then().statusCode(201);
            return response.jsonPath().getMap("data");
        });
    }

    public Map<String, Object> getProduct(int id) {
        return Steps.stepReturning(Steps.Actions.API_GET_PRODUCT, () ->
                given().headers(headers()).get(Environment.BASE_URL + "/api/products/" + id)
                        .then().statusCode(200).extract().jsonPath().getMap("data"));
    }

    public Map<String, Object> updateProduct(int id, Map<String, Object> changes) {
        return Steps.stepReturning(Steps.Actions.API_UPDATE_PRODUCT, () ->
                given().headers(headers()).contentType(ContentType.JSON).body(changes)
                        .patch(Environment.BASE_URL + "/api/products/" + id)
                        .then().statusCode(200).extract().jsonPath().getMap("data"));
    }

    public void deleteOrder(int id) {
        Steps.step(Steps.Actions.API_DELETE_ORDER, () -> {
            int status = given().headers(headers())
                    .delete(Environment.BASE_URL + "/api/orders/" + id).statusCode();
            if (status != 200 && status != 404) {
                throw new AssertionError("Delete order returned " + status);
            }
        });
    }

    public void deleteProduct(int id) {
        Steps.step(Steps.Actions.API_DELETE_PRODUCT, () -> {
            int status = given().headers(headers())
                    .delete(Environment.BASE_URL + "/api/products/" + id + "?force=true")
                    .statusCode();
            if (status != 200 && status != 404) {
                throw new AssertionError("Delete product returned " + status);
            }
        });
    }

    public static Map<String, Object> newProduct(String name, Map<String, Object> defaults) {
        Map<String, Object> product = new LinkedHashMap<>(defaults);
        product.put("name", name);
        return product;
    }
}
