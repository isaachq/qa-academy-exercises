import re

import allure
import pytest

from config.environment import environment
from helpers.api_response import expect_api_json
from helpers.steps import step
from services.api_client import ApiClient

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "Authentication and health API"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-AUTH-001 - Valid login")
@allure.title("[API-AUTH-001] Login returns the expected user and usable tokens")
def test_api_auth_001_valid_login(api_client: ApiClient) -> None:
    with step("When: client logs in with the configured account"):
        response = api_client.post(
            "/api/auth/login",
            json={"email": environment.ui_email, "password": environment.ui_password},
            authenticated=False,
        )
    with step("Then: login returns the configured account without reporting secrets"):
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        data = payload.get("data") or payload
        assert (data.get("user") or {}).get("email", data.get("email")) == environment.ui_email
        assert data.get("session_token")
        assert data.get("api_token")


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-AUTH-002 - Invalid credentials")
@allure.title("[API-AUTH-002] Invalid credentials return a controlled unauthorized response")
def test_api_auth_002_invalid_credentials(api_client: ApiClient) -> None:
    with step("When: client submits fictional invalid credentials"):
        response = api_client.post(
            "/api/auth/login",
            json={
                "email": "invalid-login@example.invalid",
                "password": "not-a-valid-password",
            },
            authenticated=False,
        )
    with step("Then: authentication is rejected with a controlled error"):
        assert response.status_code == 401, response.text
        payload = expect_api_json(response)
        assert payload["success"] is False
        assert payload.get("error")


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-AUTH-003 - Authenticated profile")
@allure.title("[API-AUTH-003] Authenticated profile belongs to the configured account")
def test_api_auth_003_authenticated_profile(api_client: ApiClient) -> None:
    with step("When: client requests the authenticated profile"):
        response = api_client.get("/api/auth/me")
    with step("Then: profile matches the configured account"):
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        profile = payload.get("user") or payload.get("data") or payload
        assert profile["email"] == environment.ui_email


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-AUTH-004 - Missing or invalid Bearer")
@allure.title("[API-AUTH-004] Protected profile rejects a {credential} Bearer")
@pytest.mark.parametrize(
    "credential,header",
    [("missing", None), ("invalid", "Bearer invalid-token")],
    ids=["missing", "invalid"],
)
def test_api_auth_004_missing_or_invalid_bearer(
    api_client: ApiClient, credential: str, header: str | None
) -> None:
    allure.dynamic.parameter("credential", credential)
    with step("When: client requests a protected resource without valid authorization"):
        response = api_client.get(
            "/api/auth/me",
            authenticated=False,
            headers={"Authorization": header} if header else None,
        )
    with step("Then: the protected resource returns unauthorized"):
        assert response.status_code == 401, response.text
        assert expect_api_json(response)["success"] is False


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-HEALTH-001 - Authenticated health")
@allure.title("[API-HEALTH-001] Authenticated health exposes known component checks")
def test_api_health_001_authenticated_health(api_client: ApiClient) -> None:
    with step("When: client requests authenticated platform health"):
        response = api_client.get("/api/health")
    with step("Then: health returns its documented status and structured checks"):
        assert response.status_code in (200, 503), response.text
        payload = expect_api_json(response)
        assert re.fullmatch(r"healthy|unhealthy|degraded", payload["status"]), payload["status"]
        for component in ("database", "auth", "storage"):
            assert isinstance(payload["checks"][component], dict)
