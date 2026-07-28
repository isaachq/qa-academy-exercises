import allure
import pytest

from helpers.api_response import expect_api_json
from helpers.steps import step
from services.api_client import ApiClient
from services.order_service import ControlledOrder, OrderService
from services.product_service import ProductService

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "Orders API"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-001 - Create and query order")
@allure.title("[API-ORDER-001] Create and read order preserves items shipping payment and totals")
def test_api_order_001_create_and_read(order_service: OrderService) -> None:
    controlled: ControlledOrder | None = None
    try:
        with step("Setup: create product cart and paid order"):
            controlled = order_service.create_controlled_order()
        with step("When: client reads the created order"):
            order = order_service.get(controlled.order["id"])
        with step("Then: order exposes reconciled domain details"):
            assert order["id"] == controlled.order["id"]
            assert order["status"] == "completed"
            assert order["payment_status"] == "paid"
            expected_total = (
                float(order["subtotal"]) + float(order["tax"]) + float(order["shipping"])
            )
            assert round(float(order["total"]), 2) == round(expected_total, 2)
            assert len(order["order_items"]) == 1
            assert order["order_shipping"]
    finally:
        with step("Teardown: delete order cart and product"):
            order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-002 - Change status")
@allure.title("[API-ORDER-002] Order status accepts idempotency and rejects invalid transition")
def test_api_order_002_change_status(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order()
        with step("When: client repeats the completed status"):
            same = api_client.patch(
                f"/api/orders/{controlled.order['id']}/status", json={"status": "completed"}
            )
        assert same.status_code == 200, same.text
        with step("When: client attempts completed to pending"):
            invalid = api_client.patch(
                f"/api/orders/{controlled.order['id']}/status", json={"status": "pending"}
            )
        with step("Then: invalid transition is rejected and status persists"):
            assert invalid.status_code == 400, invalid.text
            assert expect_api_json(invalid)["current_status"] == "completed"
            assert order_service.get(controlled.order["id"])["status"] == "completed"
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-003 - Change payment")
@allure.title("[API-ORDER-003] Payment status update persists on subsequent read")
def test_api_order_003_change_payment(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order()
        with step("When: client changes payment to pending"):
            response = api_client.patch(
                f"/api/orders/{controlled.order['id']}", json={"payment_status": "pending"}
            )
        assert response.status_code == 200, response.text
        assert expect_api_json(response)["data"]["payment_status"] == "pending"
        assert order_service.get(controlled.order["id"])["payment_status"] == "pending"
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-004 - Cancel and restore stock")
@allure.title("[API-ORDER-004] Cancelling a completed order is safely rejected without changing stock")
def test_api_order_004_cancel_and_restore_stock(
    api_client: ApiClient, order_service: OrderService, product_service: ProductService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order()
        after_purchase = product_service.get_product(controlled.product["id"])
        assert after_purchase["stock"] == controlled.product["stock"] - 1
        with step("When: client attempts to cancel the completed paid order"):
            first = api_client.post(f"/api/orders/{controlled.order['id']}/cancel")
        assert first.status_code == 400, first.text
        assert (
            product_service.get_product(controlled.product["id"])["stock"]
            == after_purchase["stock"]
        )
        with step("When: client safely repeats the rejected cancellation"):
            second = api_client.post(f"/api/orders/{controlled.order['id']}/cancel")
        assert second.status_code == 400, second.text
        assert (
            product_service.get_product(controlled.product["id"])["stock"]
            == after_purchase["stock"]
        )
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-005 - Delete and cleanup")
@allure.title("[API-ORDER-005] Deleting an order restores stock and removes the resource")
def test_api_order_005_delete_and_cleanup(
    api_client: ApiClient, order_service: OrderService, product_service: ProductService
) -> None:
    controlled: ControlledOrder | None = None
    deleted = False
    try:
        controlled = order_service.create_controlled_order()
        with step("When: client deletes the order"):
            response = api_client.delete(f"/api/orders/{controlled.order['id']}")
        assert response.status_code == 200, response.text
        deleted = True
        assert (
            product_service.get_product(controlled.product["id"])["stock"]
            == controlled.product["stock"]
        )
        missing = api_client.get(f"/api/orders/{controlled.order['id']}")
        assert missing.status_code == 404, missing.text
    finally:
        order_service.cleanup(controlled, deleted)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-006 - Search with summary")
@allure.title("[API-ORDER-006] Order search returns filtered summary counts and total amount")
def test_api_order_006_search_with_summary(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order()
        with step("When: client searches by controlled customer email"):
            response = api_client.get("/api/orders/search?search=framework.&page=1&limit=10")
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        assert any(order["id"] == controlled.order["id"] for order in payload["data"])
        assert payload["summary"]["total_orders"] >= 1
        assert float(payload["summary"]["total_amount"]) > 0
        assert float(payload["summary"]["average_order_value"]) > 0
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-007 - Relational filters before pagination")
@allure.title("[API-ORDER-007] Relational search is applied before pagination totals")
def test_api_order_007_relational_filters_before_pagination(
    api_client: ApiClient, order_service: OrderService
) -> None:
    controlled: list[ControlledOrder] = []
    try:
        controlled.append(order_service.create_controlled_order())
        controlled.append(order_service.create_controlled_order())
        product_id = controlled[0].product["id"]
        with step("When: client filters a product before a one-row page"):
            response = api_client.get(
                f"/api/orders/search?product_id={product_id}&page=1&limit=1"
            )
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        assert len(payload["data"]) == 1
        assert payload["pagination"]["total"] == 1
        assert payload["data"][0]["id"] == controlled[0].order["id"]
    finally:
        for item in controlled:
            order_service.cleanup(item)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-ORDER-008 - Isolation by user")
@allure.title("[API-ORDER-008] Order resources do not disclose foreign or invalid IDs")
def test_api_order_008_isolation_by_user(api_client: ApiClient) -> None:
    with step("When: client requests an ID outside its resource set"):
        response = api_client.get("/api/orders/2147483647")
    with step("Then: API returns not found without resource details"):
        assert response.status_code == 404, response.text
        payload = expect_api_json(response)
        assert payload["success"] is False
        assert "data" not in payload
