"""Builds the controlled order several extended scenarios need as a precondition.

Mirrors `services/order_service.ts`: a private product, one cart unit and one
order whose financial values are reconciled with the platform before the
assertions of the test start.
"""

from __future__ import annotations

import time
from typing import Any

from data.test_data import PRODUCT
from helpers.api_response import expect_api_json
from helpers.unique_name import unique_product_name
from services.api_client import ApiClient
from services.product_service import ProductService


class ControlledOrder:
    def __init__(self, order: dict[str, Any], product: dict[str, Any]) -> None:
        self.order = order
        self.product = product


class OrderService:
    def __init__(self, api: ApiClient, products: ProductService) -> None:
        self.api = api
        self.products = products

    def create_controlled_order(self, payment_status: str = "paid") -> ControlledOrder:
        self.products.clear_cart()
        product = self.products.create_product({"name": unique_product_name(), **PRODUCT})

        added = self.api.post(
            "/api/cart", json={"product_id": product["id"], "quantity": 1}
        )
        assert added.status_code == 201, added.text

        shipping = {
            "full_name": "Framework Test User",
            "email": f"framework.{time.time_ns()}@example.test",
            "address_line": "123 Main Street",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "country": "USA",
            "is_fake": True,
        }
        payment = {
            "card_number": "4242424242424242",
            "expiry_date": "12/25",
            "cvv": "123",
            "brand": "Visa",
            "payment_status": payment_status,
        }
        financial = {"tax": 0, "shipping": 0, "state": "NY", "country": "USA"}

        response = self.api.post(
            "/api/orders",
            json={"shipping": shipping, "payment": payment, "financial": financial},
        )
        if response.status_code == 400:
            # The platform recalculates tax and shipping and answers SYNC_ERROR
            # with the values it expects, so the order is retried once with them.
            mismatch = expect_api_json(response)
            assert mismatch.get("error") == "SYNC_ERROR", response.text
            financial = {
                "tax": mismatch["correct_values"]["tax"],
                "shipping": mismatch["correct_values"]["shipping_cost"],
                "state": "NY",
                "country": "USA",
            }
            response = self.api.post(
                "/api/orders",
                json={"shipping": shipping, "payment": payment, "financial": financial},
            )

        assert response.status_code == 201, response.text
        created = expect_api_json(response)["data"]
        order = {**created, "id": created["order_id"]}
        return ControlledOrder(order, product)

    def get(self, order_id: int) -> dict[str, Any]:
        response = self.api.get(f"/api/orders/{order_id}")
        assert response.status_code == 200, response.text
        return expect_api_json(response)["data"]

    def cleanup(
        self, controlled: ControlledOrder | None, order_already_deleted: bool = False
    ) -> None:
        if controlled is None:
            return
        if not order_already_deleted:
            self.products.delete_order(controlled.order["id"])
        self.products.clear_cart()
        self.products.delete_product(controlled.product["id"])
