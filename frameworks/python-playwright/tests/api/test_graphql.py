import allure
import pytest

from config.environment import environment
from data.test_data import PRODUCT
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.api_client import ApiClient
from services.product_service import ProductService

pytestmark = [pytest.mark.api, pytest.mark.extended]

FEATURE = "GraphQL API"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-001 - Authenticated query")
@allure.title("[API-GQL-001] Authenticated query returns the current user")
def test_api_gql_001_authenticated_query(api_client: ApiClient) -> None:
    with step("When: client executes the named CurrentUser query"):
        payload = api_client.graphql(
            "query CurrentUser { me { id email } }", operation_name="CurrentUser"
        )
    with step("Then: GraphQL returns the authenticated profile without errors"):
        assert not payload.get("errors"), payload
        assert payload["data"]["me"]["id"]
        assert payload["data"]["me"]["email"] == environment.ui_email


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-002 - Error model")
@allure.title("[API-GQL-002] GraphQL validation errors use HTTP 200 and errors array")
def test_api_gql_002_error_model(api_client: ApiClient) -> None:
    with step("When: client requests a field absent from the schema"):
        response = api_client.post(
            "/api/graphql",
            json={"query": "query InvalidField { me { field_that_does_not_exist } }"},
        )
    with step("Then: transport succeeds and the GraphQL error is explicit"):
        assert response.status_code == 200, response.text
        payload = response.json()
        assert payload.get("data") is None
        assert "field_that_does_not_exist" in payload["errors"][0]["message"]


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-003 - Paginated products")
@allure.title("[API-GQL-003] Products query honors variables and pagination metadata")
def test_api_gql_003_paginated_products(api_client: ApiClient) -> None:
    with step("When: client queries a two-row product page with variables"):
        payload = api_client.graphql(
            """query ProductInventory($page: Int!, $limit: Int!) {
                products(page: $page, limit: $limit) {
                  products { id name price stock }
                  pagination { page limit total total_pages }
                }
              }""",
            {"page": 1, "limit": 2},
            "ProductInventory",
        )
    assert not payload.get("errors"), payload
    result = payload["data"]["products"]
    assert len(result["products"]) <= 2
    assert result["pagination"]["page"] == 1
    assert result["pagination"]["limit"] == 2


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-004 - Product mutation with cleanup")
@allure.title("[API-GQL-004] Product mutation creates updates and deletes controlled data")
def test_api_gql_004_product_mutation_with_cleanup(api_client: ApiClient) -> None:
    product_id = None
    try:
        with step("Given: client creates a uniquely named GraphQL product"):
            created = api_client.graphql(
                """mutation CreateProduct($name: String!) {
                    createProduct(
                      name: $name
                      description: "GraphQL traceability"
                      price: 19.95
                      stock: 7
                      category: "Office"
                    ) { id name permissions }
                  }""",
                {"name": unique_product_name()},
                "CreateProduct",
            )
        assert not created.get("errors"), created
        product_id = created["data"]["createProduct"]["id"]
        assert created["data"]["createProduct"]["permissions"] == "ALL"

        with step("When: owner updates the controlled product"):
            updated = api_client.graphql(
                """mutation UpdateProduct($id: ID!) {
                    updateProduct(id: $id, price: 24.5, stock: 9) { id price stock }
                  }""",
                {"id": product_id},
                "UpdateProduct",
            )
        assert not updated.get("errors"), updated
        assert updated["data"]["updateProduct"]["id"] == product_id
        assert float(updated["data"]["updateProduct"]["price"]) == 24.5
        assert updated["data"]["updateProduct"]["stock"] == 9
    finally:
        if product_id:
            deleted = api_client.graphql(
                "mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }",
                {"id": product_id},
                "DeleteProduct",
            )
            assert not deleted.get("errors"), deleted
            assert deleted["data"]["deleteProduct"] is True


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-005 - Cart")
@allure.title("[API-GQL-005] Cart mutations add update remove and clear items")
def test_api_gql_005_cart(api_client: ApiClient) -> None:
    api_client.graphql("mutation { clearCart }")
    inventory = api_client.graphql(
        "query { products(page: 1, limit: 100) { products { id stock } } }"
    )
    product = next(
        (
            item
            for item in inventory["data"]["products"]["products"]
            if item["stock"] >= 3
        ),
        None,
    )
    assert product, "A product with at least three units is required"

    try:
        with step("Given: client adds an available product to the cart"):
            added = api_client.graphql(
                """mutation Add($productId: Int!) {
                    addToCart(product_id: $productId, quantity: 1) { id product_id quantity }
                  }""",
                {"productId": int(product["id"])},
                "Add",
            )
        cart_item_id = added["data"]["addToCart"]["id"]
        assert added["data"]["addToCart"]["quantity"] == 1

        with step("When: client changes the persistent cart item quantity"):
            updated = api_client.graphql(
                """mutation UpdateCart($id: ID!) {
                    updateCartItem(id: $id, quantity: 3) { id quantity }
                  }""",
                {"id": cart_item_id},
                "UpdateCart",
            )
        assert updated["data"]["updateCartItem"]["quantity"] == 3

        with step("Then: client removes that exact cart item"):
            removed = api_client.graphql(
                "mutation RemoveCart($id: ID!) { removeFromCart(id: $id) }",
                {"id": cart_item_id},
                "RemoveCart",
            )
        assert removed["data"]["removeFromCart"] is True
        cart = api_client.graphql("query { cart { items { id } item_count } }")
        assert cart["data"]["cart"]["item_count"] == 0
    finally:
        api_client.graphql("mutation { clearCart }")


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-006 - Order")
@allure.title("[API-GQL-006] Order mutation persists the cart and computed financial values")
def test_api_gql_006_order(
    api_client: ApiClient, product_service: ProductService
) -> None:
    api_client.graphql("mutation { clearCart }")
    order_id = None
    product_id = None
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        product_id = product["id"]
        api_client.graphql(
            "mutation Add($id: Int!) { addToCart(product_id: $id, quantity: 1) { id } }",
            {"id": product["id"]},
            "Add",
        )
        preview = api_client.graphql(
            "query { cartSummary(tax_rate: 0.095, shipping_cost: 12) "
            "{ summary { subtotal tax shipping_cost total } } }"
        )
        summary = preview["data"]["cartSummary"]["summary"]
        rounded_tax = round(float(summary["tax"]), 2)

        with step("When: client creates an order from its current cart"):
            created = api_client.graphql(
                """mutation CreateOrder($financial: FinancialInput!) {
                    createOrder(
                      shipping: {
                        full_name: "GraphQL Automation"
                        email: "graphql@example.com"
                        address_line: "1 Test Street"
                        city: "Test City"
                        state: "CA"
                        zip_code: "90210"
                        country: "USA"
                        is_fake: true
                      }
                      payment: {
                        card_number: "4242424242424242"
                        expiry_date: "12/25"
                        cvv: "123"
                        brand: "Visa"
                        payment_status: "pending"
                      }
                      financial: $financial
                    ) { id total status items { id quantity } }
                  }""",
                {
                    "financial": {
                        "tax": rounded_tax,
                        "shipping": summary["shipping_cost"],
                        "tax_rate": 0.095,
                        "state": "CA",
                        "country": "USA",
                    }
                },
                "CreateOrder",
            )
        assert not created.get("errors"), created
        order_id = created["data"]["createOrder"]["id"]
        expected_total = float(summary["subtotal"]) + rounded_tax + float(summary["shipping_cost"])
        assert round(float(created["data"]["createOrder"]["total"]), 2) == round(expected_total, 2)
        assert len(created["data"]["createOrder"]["items"]) == 1

        queried = api_client.graphql(
            "query Order($id: ID!) { order(id: $id) { id status } }",
            {"id": order_id},
            "Order",
        )
        assert queried["data"]["order"]["id"] == order_id
    finally:
        api_client.graphql("mutation { clearCart }")
        if order_id:
            cleanup = api_client.delete(f"/api/orders/{order_id}?force=true")
            assert cleanup.status_code in (200, 404), cleanup.text
        if product_id:
            product_service.delete_product(product_id)


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("API-GQL-007 - Search orders")
@allure.title("[API-GQL-007] Order search returns filters summary and pagination")
def test_api_gql_007_search_orders(api_client: ApiClient) -> None:
    with step("When: client searches its orders with pagination"):
        payload = api_client.graphql(
            """query SearchOrders($filters: OrderSearchFiltersInput, $page: Int!, $limit: Int!) {
                searchOrders(filters: $filters, page: $page, limit: $limit) {
                  success
                  data { id total }
                  pagination { page limit total }
                  filters_applied { min_total }
                  summary { total_orders total_amount }
                }
              }""",
            {"filters": {"min_total": 0}, "page": 1, "limit": 2},
            "SearchOrders",
        )
    assert not payload.get("errors"), payload
    result = payload["data"]["searchOrders"]
    assert result["success"] is True
    assert result["pagination"]["page"] == 1
    assert result["pagination"]["limit"] == 2
    assert result["filters_applied"]["min_total"] == 0
    assert result["summary"]["total_orders"] == len(result["data"])
    assert len(result["data"]) <= 2
