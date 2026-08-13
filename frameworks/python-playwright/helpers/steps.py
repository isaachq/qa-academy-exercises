"""Canonical report vocabulary shared by the four teaching frameworks.

Any change here must be mirrored in the other three projects and in
docs/cap5_CATALOGO_pasos_allure.md.
"""

from typing import ContextManager

import allure


class Titles:
    """Canonical test titles."""

    PRODUCT_PURCHASE_TRACEABILITY = (
        "[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history"
    )
    PLAYGROUND_FLAKY = "[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed"
    PRODUCT_CRUD = "[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup"


class Steps:
    """Scenario level steps. One step per navigation, action or assertion block."""

    SETUP_CLEAR_CART = "Setup: clear the shopping cart"
    SETUP_CREATE_PRODUCT = "Setup: create the product through the API"
    OPEN_PRODUCT = "When: user opens the product in the store"
    ASSERT_INITIAL_INVENTORY = "Then: inventory shows full stock without reservations"
    ADD_TO_CART = "When: user adds the product to the cart"
    ASSERT_RESERVED_INVENTORY = "Then: inventory reserves the purchased quantity"
    OPEN_CART = "When: user opens the cart"
    ASSERT_CART_CONTENT = "Then: cart shows the product, quantity and subtotal"
    PROCEED_TO_CHECKOUT = "When: user proceeds to checkout"
    PLACE_ORDER = "When: user places the order"
    REOPEN_PRODUCT = "When: user reopens the product in the store"
    ASSERT_PURCHASED_INVENTORY = "Then: inventory reflects the confirmed purchase"
    OPEN_ORDER_HISTORY = "When: user opens the order history"
    ASSERT_ORDER_HISTORY = "Then: order history shows the paid order"
    ASSERT_MOBILE_MODAL = "Then: order history modal fits the mobile viewport"
    TEARDOWN_PURCHASE = "Teardown: delete the order, cart and product"

    OPEN_PLAYGROUND = "Given: playground is open with the fixed seed"
    ASSERT_SEED = "Then: seed display confirms the fixed seed"
    TRIGGER_FAST_SUCCESS = "When: user triggers the fast success scenario"
    ASSERT_INVOICE_MODAL = "Then: invoice modal confirms the seeded run"

    CREATE_PRODUCT = "When: client creates a product"
    ASSERT_CREATED_PRODUCT = "Then: created product exposes full permissions"
    READ_PRODUCT = "When: client reads the product by id"
    ASSERT_READ_PRODUCT = "Then: read product matches the created name"
    UPDATE_PRODUCT = "When: client updates price and stock"
    ASSERT_UPDATED_PRODUCT = "Then: updated product returns the new price and stock"
    TEARDOWN_PRODUCT = "Teardown: delete the product"


class Actions:
    """Nested steps emitted by page objects and services."""

    STORE_OPEN = "Store: open the store page"
    STORE_SEARCH = "Store: search for the product"
    STORE_READ_INVENTORY = "Store: read the inventory modal"
    STORE_ADD_TO_CART = "Store: click add to cart and wait for the cart response"
    STORE_VERIFY_RESERVED = "Store: verify the reserved badge"
    STORE_OPEN_ORDER_HISTORY = "Store: open the order history modal"
    STORE_VERIFY_ORDER_ROW = "Store: verify the order history row"
    STORE_VERIFY_MOBILE_MODAL = "Store: verify the modal fits the mobile viewport"

    CART_OPEN = "Cart: open the cart page"
    CART_VERIFY_ITEM = "Cart: verify item, quantity and subtotal"
    CART_CHECKOUT = "Cart: click proceed to checkout"

    CHECKOUT_FILL = "Checkout: fill the testing payment details"
    CHECKOUT_SUBMIT = "Checkout: submit the order and read the order id"

    PLAYGROUND_OPEN = "Playground: open the playground with a seeded run"
    PLAYGROUND_VERIFY_SEED = "Playground: verify the seed display"
    PLAYGROUND_TRIGGER = "Playground: trigger the fast success scenario"
    PLAYGROUND_VERIFY_INVOICE = "Playground: verify the invoice modal"

    API_CLEAR_CART = "API: DELETE /api/cart"
    API_CREATE_PRODUCT = "API: POST /api/products"
    API_GET_PRODUCT = "API: GET /api/products/{id}"
    API_UPDATE_PRODUCT = "API: PATCH /api/products/{id}"
    API_DELETE_PRODUCT = "API: DELETE /api/products/{id}"
    API_DELETE_ORDER = "API: DELETE /api/orders/{id}"


def step(name: str) -> ContextManager[None]:
    """Runs a block inside a reported step so Allure shows where a failure happened
    instead of collapsing the whole scenario into a single block."""
    return allure.step(name)
