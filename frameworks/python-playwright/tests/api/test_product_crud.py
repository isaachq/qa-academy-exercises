import allure
import pytest

from data.test_data import PRODUCT
from helpers.steps import Steps, Titles, step
from helpers.unique_name import unique_product_name
from services.product_service import ProductService


@allure.epic("Chapter 5")
@allure.feature("REST API")
@allure.story("Product CRUD")
@allure.title(Titles.PRODUCT_CRUD)
@pytest.mark.api
def test_creates_reads_updates_and_deletes_a_product(product_service: ProductService) -> None:
    created = None
    try:
        with step(Steps.CREATE_PRODUCT):
            created = product_service.create_product({"name": unique_product_name(), **PRODUCT})

        with step(Steps.ASSERT_CREATED_PRODUCT):
            assert created["permissions"] == "ALL"

        with step(Steps.READ_PRODUCT):
            read = product_service.get_product(created["id"])

        with step(Steps.ASSERT_READ_PRODUCT):
            assert read["name"] == created["name"]

        with step(Steps.UPDATE_PRODUCT):
            updated = product_service.update_product(created["id"], {"price": 59.95, "stock": 12})

        with step(Steps.ASSERT_UPDATED_PRODUCT):
            assert float(updated["price"]) == 59.95
            assert updated["stock"] == 12
    finally:
        with step(Steps.TEARDOWN_PRODUCT):
            if created:
                product_service.delete_product(created["id"])
