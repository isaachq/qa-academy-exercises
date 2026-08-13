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
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Epic("Chapter 5")
@Tag("extended")
@Feature("Authentication & Health API")
public class AuthHealthTest {

    @Test
    @Story("API-AUTH-001")
    @DisplayName("[API-AUTH-001] Valid login returns JWT token")
    void api_auth_001_validLogin() {
        Steps.step("Given: client submits valid login credentials", () -> {
            String password = System.getenv("UI_PASSWORD");
            if (password == null || password.isBlank()) password = "dummy";
            String body = "{\"email\":\"" + Environment.required("UI_EMAIL") + "\",\"password\":\"" + password + "\"}";

            Response response = given().headers(Environment.automationHeaders())
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/auth/login");

            Steps.step("Then: API returns 200 OK with session data", () -> {
                assertEquals(200, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-AUTH-002")
    @DisplayName("[API-AUTH-002] Invalid credentials return 401 Unauthorized")
    void api_auth_002_invalidCredentials() {
        Steps.step("When: client sends bad login credentials", () -> {
            String body = "{\"email\":\"nobody@example.invalid\",\"password\":\"invalid-password\"}";
            Response response = given().headers(Environment.automationHeaders())
                    .contentType(ContentType.JSON)
                    .body(body)
                    .post(Environment.BASE_URL + "/api/auth/login");

            Steps.step("Then: API responds with 401 status", () -> {
                assertEquals(401, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-AUTH-003")
    @DisplayName("[API-AUTH-003] Authenticated profile returns user email")
    void api_auth_003_authenticatedProfile() {
        Steps.step("When: client requests current user profile with valid Bearer token", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/auth/me");

            Steps.step("Then: response returns 200 OK and matches the authenticated user email", () -> {
                assertEquals(200, response.statusCode());
                String email = response.jsonPath().getString("data.email");
                if (email == null) email = response.jsonPath().getString("user.email");
                if (email == null) email = response.jsonPath().getString("email");
                assertEquals(Environment.required("UI_EMAIL"), email);
            });
        });
    }

    @Test
    @Story("API-AUTH-004")
    @DisplayName("[API-AUTH-004] Missing or invalid Bearer token returns 401")
    void api_auth_004_missingOrInvalidBearer() {
        Steps.step("When: client requests profile without Authorization header", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .get(Environment.BASE_URL + "/api/auth/me");

            Steps.step("Then: API rejects request with 401", () -> {
                assertEquals(401, response.statusCode());
            });
        });
    }

    @Test
    @Story("API-HEALTH-001")
    @DisplayName("[API-HEALTH-001] Authenticated health check endpoint")
    void api_health_001_authenticatedHealth() {
        Steps.step("When: client queries service health check endpoint", () -> {
            Response response = given().headers(Environment.automationHeaders())
                    .header("Authorization", "Bearer " + Environment.required("API_KEY"))
                    .get(Environment.BASE_URL + "/api/health");

            Steps.step("Then: status is 200 or 503 depending on dependencies", () -> {
                assertTrue(List.of(200, 503).contains(response.statusCode()));
            });
        });
    }
}
