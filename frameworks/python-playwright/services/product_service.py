from __future__ import annotations

from typing import Any

import allure
import requests

from config.environment import environment
from helpers.api_response import observed_api
from helpers.steps import Actions, step


class ProductService:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {environment.api_key}",
                "Content-Type": "application/json",
                **environment.automation_headers,
            }
        )

    def request(self, method: str, path: str, **kwargs: Any) -> requests.Response:
        def send() -> requests.Response:
            try:
                return self.session.request(
                    method,
                    f"{environment.base_url}{path}",
                    timeout=20,
                    **kwargs,
                )
            except requests.RequestException as error:
                raise RuntimeError(
                    f"{method} {path} failed with {type(error).__name__}; "
                    "credentials were redacted"
                ) from None

        # Setup and teardown traffic is paced, retried on application throttling
        # and annotated with its incident ID. Contract assertions stay in the tests.
        return observed_api(send)

    def clear_cart(self) -> None:
        with step(Actions.API_CLEAR_CART):
            self.request("DELETE", "/api/cart")

    def add_to_cart(self, product_id: int, quantity: int = 1) -> dict[str, Any]:
        response = self.request(
            "POST", "/api/cart", json={"product_id": product_id, "quantity": quantity}
        )
        assert response.status_code in (200, 201), response.text
        return response.json()

    def update_cart_item(self, product_id: int, quantity: int) -> requests.Response:
        return self.request(
            "PATCH", f"/api/cart/{product_id}", json={"quantity": quantity}
        )

    def create_product(self, product: dict[str, Any]) -> dict[str, Any]:
        with step(Actions.API_CREATE_PRODUCT):
            response = self.request("POST", "/api/products", json=product)
            allure.attach(
                str({"request": product, "response_status": response.status_code}),
                "Create product",
                allure.attachment_type.JSON,
            )
            assert response.status_code == 201, response.text
            return response.json()["data"]

    def get_product(self, product_id: int) -> dict[str, Any]:
        with step(Actions.API_GET_PRODUCT):
            response = self.request("GET", f"/api/products/{product_id}")
            response.raise_for_status()
            return response.json()["data"]

    def update_product(self, product_id: int, changes: dict[str, Any]) -> dict[str, Any]:
        with step(Actions.API_UPDATE_PRODUCT):
            response = self.request("PATCH", f"/api/products/{product_id}", json=changes)
            response.raise_for_status()
            return response.json()["data"]

    def delete_order(self, order_id: int) -> None:
        with step(Actions.API_DELETE_ORDER):
            response = self.request("DELETE", f"/api/orders/{order_id}")
            assert response.status_code in (200, 404), response.text

    def delete_product(self, product_id: int) -> None:
        with step(Actions.API_DELETE_PRODUCT):
            response = self.request("DELETE", f"/api/products/{product_id}?force=true")
            assert response.status_code in (200, 404), response.text
