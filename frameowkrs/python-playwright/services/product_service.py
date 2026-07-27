from typing import Any

import allure
import requests

from config.environment import environment


class ProductService:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {"Authorization": f"Bearer {environment.api_key}", "Content-Type": "application/json"}
        )

    def clear_cart(self) -> None:
        self.session.delete(f"{environment.base_url}/api/cart", timeout=20)

    def create_product(self, product: dict[str, Any]) -> dict[str, Any]:
        response = self.session.post(
            f"{environment.base_url}/api/products", json=product, timeout=20
        )
        allure.attach(
            str({"request": product, "response_status": response.status_code}),
            "Create product",
            allure.attachment_type.JSON,
        )
        assert response.status_code == 201, response.text
        return response.json()["data"]

    def get_product(self, product_id: int) -> dict[str, Any]:
        response = self.session.get(
            f"{environment.base_url}/api/products/{product_id}", timeout=20
        )
        response.raise_for_status()
        return response.json()["data"]

    def update_product(self, product_id: int, changes: dict[str, Any]) -> dict[str, Any]:
        response = self.session.patch(
            f"{environment.base_url}/api/products/{product_id}", json=changes, timeout=20
        )
        response.raise_for_status()
        return response.json()["data"]

    def delete_order(self, order_id: int) -> None:
        response = self.session.delete(
            f"{environment.base_url}/api/orders/{order_id}", timeout=20
        )
        assert response.status_code in (200, 404), response.text

    def delete_product(self, product_id: int) -> None:
        response = self.session.delete(
            f"{environment.base_url}/api/products/{product_id}?force=true", timeout=20
        )
        assert response.status_code in (200, 404), response.text
