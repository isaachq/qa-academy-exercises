from typing import Iterator

import allure
import pytest

from data.test_data import PRODUCT
from helpers.api_response import expect_api_json
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.api_client import ApiClient
from services.product_service import ProductService

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "Cart API"


@pytest.fixture(autouse=True)
def empty_cart(product_service: ProductService) -> Iterator[None]:
    """The cart is a single shared resource per account, so every cart scenario
    starts and ends from the same empty state."""
    product_service.clear_cart()
    yield
    product_service.clear_cart()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-001 - Add and merge item")
@allure.title("[API-CART-001] Adding the same product merges quantity without duplicate items")
def test_api_cart_001_add_and_merge_item(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        with step("Setup: create a controlled in-stock product"):
            product = product_service.create_product(
                {"name": unique_product_name(), **PRODUCT}
            )
        for _ in range(2):
            with step("When: client adds one unit to the cart"):
                response = api_client.post(
                    "/api/cart", json={"product_id": product["id"], "quantity": 1}
                )
            assert response.status_code == 201, response.text
        with step("Then: client reads the merged cart"):
            cart = expect_api_json(api_client.get("/api/cart"))["data"]
            assert len(cart["items"]) == 1
            assert cart["items"][0]["product_id"] == product["id"]
            assert cart["items"][0]["quantity"] == 2
            assert cart["summary"]["item_count"] == 2
    finally:
        with step("Teardown: clear cart and delete product"):
            product_service.clear_cart()
            if product:
                product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-002 - Update and remove item")
@allure.title("[API-CART-002] Updating quantity persists and quantity zero removes the item")
def test_api_cart_002_update_and_remove_item(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        with step("Given: one controlled cart item"):
            added = api_client.post(
                "/api/cart", json={"product_id": product["id"], "quantity": 1}
            )
            item_id = expect_api_json(added)["data"]["id"]
        with step("When: client changes item quantity"):
            updated = api_client.patch(f"/api/cart/{item_id}", json={"quantity": 3})
        assert updated.status_code == 200, updated.text
        assert expect_api_json(updated)["data"]["quantity"] == 3
        with step("When: client changes quantity to zero"):
            removed = api_client.patch(f"/api/cart/{item_id}", json={"quantity": 0})
        assert removed.status_code == 200, removed.text
        cart = expect_api_json(api_client.get("/api/cart"))["data"]
        assert cart["items"] == []
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-003 - Bulk update")
@allure.title("[API-CART-003] Bulk update reports mixed updates deletes statistics and summary")
def test_api_cart_003_bulk_update(
    api_client: ApiClient, product_service: ProductService
) -> None:
    products: list[dict] = []
    try:
        for _ in range(2):
            products.append(
                product_service.create_product({"name": unique_product_name(), **PRODUCT})
            )
        item_ids = []
        for product in products:
            response = api_client.post(
                "/api/cart", json={"product_id": product["id"], "quantity": 1}
            )
            item_ids.append(expect_api_json(response)["data"]["id"])
        with step("When: client bulk-updates one item and deletes another"):
            response = api_client.patch(
                "/api/cart/bulk",
                json={
                    "updates": [
                        {"cart_item_id": item_ids[0], "quantity": 2},
                        {"cart_item_id": item_ids[1], "quantity": 0},
                    ]
                },
            )
        with step("Then: bulk response contains results statistics and refreshed summary"):
            assert response.status_code == 200, response.text
            body = expect_api_json(response)
            payload = body.get("data", body)
            assert len(payload["results"]) == 2
            assert payload.get("statistics") or payload.get("stats")
            assert payload["cart_summary"]
    finally:
        product_service.clear_cart()
        for product in products:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-004 - Summary")
@allure.title("[API-CART-004] Cart summary calculates subtotal tax shipping discount and readiness")
def test_api_cart_004_summary(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        api_client.post("/api/cart", json={"product_id": product["id"], "quantity": 2})
        with step("When: client requests a parameterized cart summary"):
            response = api_client.get(
                "/api/cart/summary?tax_rate=0.1&shipping_cost=5&discount=2"
            )
        with step("Then: monetary fields reconcile and cart is checkout-ready"):
            assert response.status_code == 200, response.text
            payload = expect_api_json(response)
            summary = payload["summary"]
            assert round(float(summary["subtotal"]), 2) == round(float(product["price"]) * 2, 2)
            expected_total = (
                float(summary["subtotal"])
                - float(summary["discount"])
                + float(summary["tax"])
                + float(summary["shipping_cost"])
            )
            assert round(float(summary["total"]), 2) == round(expected_total, 2)
            assert payload["can_checkout"] is True
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-005 - Insufficient stock")
@allure.title("[API-CART-005] Insufficient stock is rejected without corrupting the cart")
def test_api_cart_005_insufficient_stock(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        product = product_service.create_product(
            {"name": unique_product_name(), **PRODUCT, "stock": 1}
        )
        with step("When: client requests more units than stock"):
            response = api_client.post(
                "/api/cart", json={"product_id": product["id"], "quantity": 2}
            )
        assert response.status_code == 400, response.text
        cart = expect_api_json(api_client.get("/api/cart"))["data"]
        assert cart["items"] == []
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-CART-006 - Clear cart")
@allure.title("[API-CART-006] Clearing an already empty cart is idempotent")
def test_api_cart_006_clear_cart(api_client: ApiClient) -> None:
    for _ in range(2):
        with step("When: client clears the cart"):
            response = api_client.delete("/api/cart")
        assert response.status_code == 200, response.text
    cart = expect_api_json(api_client.get("/api/cart"))["data"]
    assert cart["items"] == []
