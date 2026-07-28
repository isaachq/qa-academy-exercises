import os

import pytest
import requests

from config.environment import environment
from data.extended_catalog import API_CASES
from data.test_data import PRODUCT
from helpers.unique_name import unique_product_name
from services.product_service import ProductService


@pytest.mark.parametrize(
    "case_id,title,method,path,expected,configured_body,public_request,override",
    API_CASES,
    ids=[case[0] for case in API_CASES],
)
def test_extended_api_catalog(
    case_id: str,
    title: str,
    method: str,
    path: str,
    expected: list[int],
    configured_body: object,
    public_request: bool,
    override: bool,
    product_service: ProductService,
) -> None:
    if case_id == "API-CART-002":
        product = None
        product_service.clear_cart()
        try:
            product = product_service.create_product(
                {"name": unique_product_name(), **PRODUCT}
            )
            cart_item = product_service.add_to_cart(product["id"])["data"]
            updated = product_service.update_cart_item(cart_item["id"], 2)
            assert updated.status_code == 200, updated.text
            assert updated.json()["data"]["quantity"] == 2
            removed = product_service.update_cart_item(cart_item["id"], 0)
            assert removed.status_code == 200, removed.text
            missing = product_service.request("GET", f"/api/cart/{cart_item['id']}")
            assert missing.status_code == 404, missing.text
        finally:
            product_service.clear_cart()
            if product:
                product_service.delete_product(product["id"])
        return

    body = configured_body
    if case_id == "API-AUTH-001":
        password = os.getenv("UI_PASSWORD")
        if not password:
            pytest.skip("UI_PASSWORD is required for the valid login contract")
        body = {"email": environment.ui_email, "password": password}

    headers = {"Content-Type": "application/json", **environment.automation_headers}
    if not public_request:
        headers["Authorization"] = f"Bearer {environment.api_key}"
    if override:
        headers["X-HTTP-Method-Override"] = "QUERY"

    response = requests.request(
        method,
        f"{environment.base_url}{path}",
        headers=headers,
        json=body,
        timeout=30,
    )
    assert response.status_code in expected, response.text
    if case_id == "API-AUTH-003":
        payload = response.json()
        actual = payload.get("data", {}).get("email") or payload.get("user", {}).get("email") or payload.get("email")
        assert actual == environment.ui_email
    if case_id == "API-QUERY-004":
        assert "QUERY" in response.headers.get("Allow", "")
    if case_id == "API-GQL-002":
        assert response.json().get("errors")
