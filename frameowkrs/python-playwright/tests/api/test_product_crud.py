import allure
import pytest

from data.test_data import PRODUCT
from helpers.unique_name import unique_product_name
from services.product_service import ProductService


@allure.epic("Chapter 5")
@allure.feature("REST API")
@allure.story("Product CRUD")
@pytest.mark.api
def test_creates_reads_updates_and_deletes_a_product(product_service: ProductService) -> None:
    product_id = None
    try:
        created = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        product_id = created["id"]
        assert created["permissions"] == "ALL"
        assert product_service.get_product(product_id)["name"] == created["name"]
        updated = product_service.update_product(product_id, {"price": 59.95, "stock": 12})
        assert float(updated["price"]) == 59.95
        assert updated["stock"] == 12
    finally:
        if product_id:
            product_service.delete_product(product_id)
