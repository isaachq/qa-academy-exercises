from __future__ import annotations

from typing import Any

import allure
import pytest

from data.test_data import PRODUCT
from helpers.api_response import expect_api_json
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.api_client import ApiClient
from services.order_service import ControlledOrder, OrderService
from services.product_service import ProductService

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "HTTP QUERY API"


def product_document(search: str = "") -> dict[str, Any]:
    return {
        "filters": {"search": search},
        "sort": {"field": "price", "direction": "asc"},
        "fields": ["id", "name", "price", "stock"],
        "pagination": {"page": 1, "limit": 2},
    }


def order_document(product_ids: list[int] | None = None) -> dict[str, Any]:
    return {
        "filters": {"product_ids": product_ids or []},
        "sort": {"field": "total", "direction": "asc"},
        "pagination": {"page": 1, "limit": 1},
    }


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-001 - Native products QUERY")
@allure.title("[API-QUERY-001] Native QUERY products applies fields filters sort and pagination")
def test_api_query_001_native_products_query(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        with step("When: client sends a native QUERY document"):
            response = api_client.query(
                "/api/products/query", json=product_document(product["name"])
            )
        with step("Then: response reflects native transport and controlled filter"):
            assert response.status_code == 200, response.text
            payload = expect_api_json(response)
            assert payload["meta"]["transport"] == "QUERY"
            assert len(payload["data"]) == 1
            assert payload["data"][0]["id"] == product["id"]
            assert "category" not in payload["data"][0]
            assert payload["pagination"]["page"] == 1
            assert payload["pagination"]["limit"] == 2
            assert payload["pagination"]["total"] == 1
    finally:
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-002 - POST override")
@allure.title("[API-QUERY-002] POST override reports POST_OVERRIDE transport")
def test_api_query_002_post_override(api_client: ApiClient) -> None:
    with step("When: client tunnels QUERY through POST override"):
        response = api_client.post(
            "/api/products/query",
            headers={"X-HTTP-Method-Override": "QUERY"},
            json=product_document(),
        )
    assert response.status_code == 200, response.text
    assert expect_api_json(response)["meta"]["transport"] == "POST_OVERRIDE"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-003 - Plain POST")
@allure.title("[API-QUERY-003] Plain POST query reports POST transport")
def test_api_query_003_plain_post(api_client: ApiClient) -> None:
    with step("When: client posts a query document without override"):
        response = api_client.post("/api/products/query", json=product_document())
    assert response.status_code == 200, response.text
    assert expect_api_json(response)["meta"]["transport"] == "POST"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-004 - GET rejected")
@allure.title("[API-QUERY-004] GET query is rejected with the documented Allow header")
def test_api_query_004_get_rejected(api_client: ApiClient) -> None:
    with step("When: client sends unsupported GET transport"):
        response = api_client.get("/api/products/query")
    assert response.status_code == 405, response.text
    assert response.headers.get("allow") == "QUERY, POST, OPTIONS"
    assert expect_api_json(response)["success"] is False


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-005 - Orders QUERY")
@allure.title("[API-QUERY-005] Native QUERY orders sorts persisted total and reports pagination separately")
def test_api_query_005_orders_query(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        with step("Given: client creates the order that will be queried"):
            controlled = order_service.create_controlled_order()
        with step("When: client sends native orders QUERY sorted by total"):
            response = api_client.query(
                "/api/orders/query", json=order_document([controlled.product["id"]])
            )
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        assert payload["meta"]["transport"] == "QUERY"
        assert len(payload["data"]) == 1
        assert payload["data"][0]["id"] == controlled.order["id"]
        assert round(float(payload["data"][0]["total"]), 2) == round(
            float(controlled.order["total"]), 2
        )
        assert payload["pagination"]["page"] == 1
        assert payload["pagination"]["limit"] == 1
        assert payload["pagination"]["total"] == 1
        assert payload["meta"]["sorted_by"] == "total asc"
    finally:
        with step("Teardown: delete the controlled order and product"):
            order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-006 - Relation before pagination")
@allure.title("[API-QUERY-006] Order relations are filtered before total and pagination")
def test_api_query_006_relation_before_pagination(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        with step("Given: client creates an isolated order and product relation"):
            controlled = order_service.create_controlled_order()
        with step("When: client filters the controlled relation with a one-row page"):
            response = api_client.post(
                "/api/orders/query", json=order_document([controlled.product["id"]])
            )
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        assert len(payload["data"]) == 1
        assert payload["data"][0]["id"] == controlled.order["id"]
        assert payload["pagination"]["total"] == 1
        assert payload["pagination"]["limit"] == 1
    finally:
        with step("Teardown: delete the controlled order and product"):
            order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-QUERY-007 - Validation")
@allure.title("[API-QUERY-007] QUERY rejects invalid ranges fields sort dates IDs and limits")
def test_api_query_007_validation(api_client: ApiClient) -> None:
    invalid_documents = [
        {"filters": {"price": {"min": 10, "max": 1}}},
        {"sort": {"field": "not_a_field", "direction": "asc"}},
        {"fields": ["password"]},
        {"pagination": {"page": 0, "limit": 10}},
        {"pagination": {"page": 1, "limit": 101}},
    ]
    for document in invalid_documents:
        with step("When: client submits one invalid QUERY document"):
            response = api_client.post("/api/products/query", json=document)
        assert response.status_code == 400, response.text
        assert expect_api_json(response)["success"] is False
