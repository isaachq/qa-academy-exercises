from __future__ import annotations

import allure
import pytest
from playwright.sync_api import Browser, Playwright

from data.test_data import PRODUCT, PURCHASE_QUANTITY
from fixtures.conftest import authenticated_context
from helpers.steps import Steps, Titles, step
from helpers.unique_name import unique_product_name
from pages.cart_page import CartPage
from pages.checkout_page import CheckoutPage
from pages.store_page import StorePage
from services.product_service import ProductService


@allure.epic("Chapter 5")
@allure.feature("UI automation")
@allure.story("BOOK-TEST-UI-001 - Product purchase traceability")
@allure.title(Titles.PRODUCT_PURCHASE_TRACEABILITY)
@pytest.mark.ui
@pytest.mark.parametrize("device_name", [None, "Pixel 7"], ids=["desktop", "mobile"])
def test_traces_stock_through_cart_and_order_history(
    browser: Browser,
    playwright: Playwright,
    product_service: ProductService,
    device_name: str | None,
) -> None:
    context = authenticated_context(browser, playwright, device_name)
    page = context.new_page()
    store, cart, checkout = StorePage(page), CartPage(page), CheckoutPage(page)
    product = None
    order_id = None

    with step(Steps.SETUP_CLEAR_CART):
        product_service.clear_cart()
    try:
        with step(Steps.SETUP_CREATE_PRODUCT):
            product = product_service.create_product({"name": unique_product_name(), **PRODUCT})

        with step(Steps.OPEN_PRODUCT):
            store.open_product(product["id"], product["name"])

        with step(Steps.ASSERT_INITIAL_INVENTORY):
            before = store.read_inventory(product["id"])
            assert before == {
                "stock": product["stock"],
                "reserved": 0,
                "available": product["stock"],
            }

        with step(Steps.ADD_TO_CART):
            store.add_to_cart(product["id"])

        with step(Steps.ASSERT_RESERVED_INVENTORY):
            store.expect_reserved(product["id"], PURCHASE_QUANTITY)
            reserved = store.read_inventory(product["id"])
            assert reserved == {
                "stock": before["stock"],
                "reserved": PURCHASE_QUANTITY,
                "available": before["stock"] - PURCHASE_QUANTITY,
            }

        with step(Steps.OPEN_CART):
            cart.open()

        with step(Steps.ASSERT_CART_CONTENT):
            cart.expect_item(product["name"], PURCHASE_QUANTITY, float(product["price"]))

        with step(Steps.PROCEED_TO_CHECKOUT):
            cart.proceed_to_checkout()

        with step(Steps.PLACE_ORDER):
            order_id = checkout.place_order()

        with step(Steps.REOPEN_PRODUCT):
            store.open_product(product["id"], product["name"])

        with step(Steps.ASSERT_PURCHASED_INVENTORY):
            purchased = store.read_inventory(product["id"])
            assert purchased == {
                "stock": before["stock"] - PURCHASE_QUANTITY,
                "reserved": 0,
                "available": before["stock"] - PURCHASE_QUANTITY,
            }

        with step(Steps.OPEN_ORDER_HISTORY):
            store.open_order_history(product["id"])

        with step(Steps.ASSERT_ORDER_HISTORY):
            store.expect_order_row(order_id, PURCHASE_QUANTITY, "paid")

        if device_name:
            with step(Steps.ASSERT_MOBILE_MODAL):
                store.expect_mobile_modal_contract()
    finally:
        with step(Steps.TEARDOWN_PURCHASE):
            if order_id:
                product_service.delete_order(order_id)
            product_service.clear_cart()
            if product:
                product_service.delete_product(product["id"])
            context.close()
