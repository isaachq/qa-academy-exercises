import json
import re

import allure
import pytest

from data.test_data import PRODUCT
from helpers.api_response import expect_api_json
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.api_client import ApiClient
from services.product_service import ProductService

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "Products API"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-PRODUCT-001 - List and paginate products")
@allure.title("[API-PRODUCT-001] Product listing honors pagination metadata and limit")
def test_api_product_001_list_and_paginate(api_client: ApiClient) -> None:
    with step("When: client requests the first two products"):
        response = api_client.get("/api/products?page=1&limit=2")
    with step("Then: data and pagination describe the requested page"):
        assert response.status_code == 200, response.text
        payload = expect_api_json(response)
        assert len(payload["data"]) <= 2
        pagination = payload["pagination"]
        assert pagination["page"] == 1
        assert pagination["limit"] == 2
        assert isinstance(pagination["total"], int)
        assert isinstance(pagination["total_pages"], int)
        assert pagination["total"] >= len(payload["data"])


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-PRODUCT-003 - Validation and limits")
@allure.title("[API-PRODUCT-003] Product creation rejects required-field and numeric boundaries")
def test_api_product_003_validation_and_limits(api_client: ApiClient) -> None:
    invalid_bodies = [
        {"name": "", "price": 10, "stock": 1},
        {"name": "Negative price", "price": -0.01, "stock": 1},
        {"name": "Negative stock", "price": 1, "stock": -1},
        {"name": "Fractional stock", "price": 1, "stock": 1.5},
    ]
    for body in invalid_bodies:
        with step("When: client submits one invalid product boundary"):
            response = api_client.post("/api/products", json=body)
        with step("Then: product validation rejects the request without creating data"):
            assert response.status_code == 400, response.text
            assert expect_api_json(response)["success"] is False


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-PRODUCT-004 - Permissions")
@allure.title("[API-PRODUCT-004] Template product permissions allow reads and prevent deletion")
def test_api_product_004_permissions(api_client: ApiClient) -> None:
    with step("Given: client finds a non-deletable template product"):
        listing = api_client.get("/api/products?permission=N_DELETE&limit=1")
        products = expect_api_json(listing)["data"]
        assert products, "The account must have a provisioned N_DELETE product"
        product = products[0]
    with step("When: client reads the template product"):
        read = api_client.get(f"/api/products/{product['id']}")
    with step("When: client attempts to delete the template product"):
        deletion = api_client.delete(f"/api/products/{product['id']}")
    with step("Then: read succeeds and deletion is forbidden"):
        assert read.status_code == 200, read.text
        assert deletion.status_code == 403, deletion.text
        assert expect_api_json(deletion)["success"] is False


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-PRODUCT-005 - Categories and stock")
@allure.title("[API-PRODUCT-005] Categories and stock aggregates are consistent for an owned product")
def test_api_product_005_categories_and_stock(
    api_client: ApiClient, product_service: ProductService
) -> None:
    product = None
    try:
        with step("Setup: create a controlled product"):
            product = product_service.create_product(
                {"name": unique_product_name(), **PRODUCT}
            )
        with step("When: client requests category aggregates"):
            categories = api_client.get("/api/products/categories")
        with step("When: client requests product availability"):
            stock = api_client.get(f"/api/products/{product['id']}/stock")
        with step("Then: category and stock data match the controlled product"):
            assert categories.status_code == 200, categories.text
            assert product["category"] in json.dumps(expect_api_json(categories))
            assert stock.status_code == 200, stock.text
            values = expect_api_json(stock)
            assert values["stock"] == product["stock"]
            assert values["available"] is (product["stock"] > 0)
            assert re.fullmatch(r"in_stock|low_stock|out_of_stock", values["stock_status"])
    finally:
        with step("Teardown: delete the controlled product"):
            if product:
                product_service.delete_product(product["id"])
