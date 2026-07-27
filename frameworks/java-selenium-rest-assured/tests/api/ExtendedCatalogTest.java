package tests.api;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import config.Environment;
import data.ExtendedCatalog;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

public class ExtendedCatalogTest {
    @TestFactory
    Stream<DynamicTest> extendedApiCatalog() {
        return ExtendedCatalog.API_CASES.stream().map(scenario ->
                DynamicTest.dynamicTest("[" + scenario.id() + "] " + scenario.title(),
                        () -> run(scenario)));
    }

    private void run(ExtendedCatalog.ApiCase scenario) {
        String body = scenario.body();
        if (scenario.id().equals("API-AUTH-001")) {
            String password = System.getenv("UI_PASSWORD");
            Assumptions.assumeTrue(password != null && !password.isBlank(),
                    "UI_PASSWORD is required for the valid login contract");
            body = "{\"email\":\"" + Environment.required("UI_EMAIL")
                    + "\",\"password\":\"" + password + "\"}";
        }

        RequestSpecification request = given().contentType(ContentType.JSON);
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
}
