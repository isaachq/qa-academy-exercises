import json
import math
import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import parse_qs, urlparse

import allure
import pytest
from playwright.sync_api import Page, Route, expect

from data.test_data import PRODUCT
from helpers.steps import step
from helpers.unique_name import unique_product_name
from pages.checkout_page import CheckoutPage
from services.order_service import ControlledOrder, OrderService
from services.product_service import ProductService

pytestmark = [pytest.mark.ui, pytest.mark.extended]

CART_ITEM = re.compile(r"^cart-item-\d+$")
ORDER_ROW = re.compile(r"^order-row-id-\d+$")


def create_cart_product(page: Page, product_service: ProductService) -> dict[str, Any]:
    """Creates a controlled product and puts exactly one unit in an empty cart."""
    product_service.clear_cart()
    product = product_service.create_product(
        {"name": unique_product_name(), **PRODUCT, "stock": 10}
    )
    page.goto("/store")
    page.get_by_test_id("store-search").fill(product["name"])
    with page.expect_response(
        lambda response: urlparse(response.url).path == "/api/cart"
        and response.request.method == "POST"
    ) as response_info:
        page.get_by_test_id(f"product-add-to-cart-{product['id']}").click()
    assert response_info.value.status == 201
    return product


def cart_item_id(page: Page, product_name: str) -> str:
    item = page.get_by_test_id(CART_ITEM).filter(has_text=product_name)
    expect(item).to_be_visible()
    return item.get_attribute("data-testid").replace("cart-item-", "")


@allure.epic("Chapter 5")
@allure.feature("Cart UI")
@allure.story("UI-CART-001 - Add product")
@allure.title("[UI-CART-001] Adding a product updates the cart and badge")
def test_ui_cart_001_add_product(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        with step("Given: a controlled product exists and the cart is empty"):
            product = create_cart_product(page, product_service)
        with step("Then: the badge and cart show the same unit"):
            expect(page.get_by_test_id("header-cart-count")).to_have_text("1")
            page.goto("/cart")
            item = page.get_by_test_id(CART_ITEM).filter(has_text=product["name"])
            expect(item).to_be_visible()
            expect(item.get_by_test_id(re.compile(r"^cart-quantity-\d+$"))).to_have_text("1")
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Cart UI")
@allure.story("UI-CART-002 - Change quantity")
@allure.title("[UI-CART-002] Changing quantity recalculates the subtotal")
def test_ui_cart_002_change_quantity(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/cart")
        item_id = cart_item_id(page, product["name"])
        with step("When: user increases the persistent item quantity"):
            page.get_by_test_id(f"cart-increase-{item_id}").click()
        with step("Then: quantity and subtotal are recalculated"):
            expect(page.get_by_test_id(f"cart-quantity-{item_id}")).to_have_text("2")
            expect(page.get_by_test_id("cart-subtotal")).to_contain_text(
                f"{float(product['price']) * 2:.2f}"
            )
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Cart UI")
@allure.story("UI-CART-003 - Native delete dialog")
@allure.title("[UI-CART-003] Removing an item uses a native dialog and deletes the confirmed item")
def test_ui_cart_003_native_delete_dialog(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/cart")
        item_id = cart_item_id(page, product["name"])
        dialogs: list[tuple[str, str]] = []

        def accept(dialog) -> None:
            dialogs.append((dialog.type, dialog.message))
            dialog.accept()

        page.once("dialog", accept)
        page.get_by_test_id(f"cart-remove-{item_id}").click()
        with step("Then: the dialog contains the expected contract and is accepted"):
            expect(page.get_by_test_id(f"cart-item-{item_id}")).to_have_count(0)
            assert dialogs, "The application did not open the native confirmation"
            assert dialogs[0][0] == "confirm"
            assert "Remove this item from cart?" in dialogs[0][1]
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Cart UI")
@allure.story("UI-CART-004 - Clear cart")
@allure.title("[UI-CART-004] Clearing the cart confirms and displays the empty state")
def test_ui_cart_004_clear_cart(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/cart")
        dialogs: list[tuple[str, str]] = []

        def accept(dialog) -> None:
            dialogs.append((dialog.type, dialog.message))
            dialog.accept()

        page.once("dialog", accept)
        with step("When: user confirms the native clear-cart dialog"):
            page.get_by_test_id("cart-clear").click()
            assert dialogs, "The application did not open the native confirmation"
            assert dialogs[0][0] == "confirm"
            assert "Clear entire cart?" in dialogs[0][1]
        with step("Then: the empty state appears and the badge disappears"):
            expect(page.get_by_test_id("cart-empty-state")).to_be_visible()
            expect(page.get_by_test_id("header-cart-count")).to_have_count(0)
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Checkout UI")
@allure.story("UI-CHECKOUT-001 - Required validation")
@allure.title("[UI-CHECKOUT-001] Checkout displays all required validations")
def test_ui_checkout_001_required_validation(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/checkout")
        with step("Then: empty fields expose errors and disable submission"):
            for key in [
                "fullname", "email", "address", "city", "state",
                "zip", "card", "expiry", "cvv",
            ]:
                expect(page.get_by_test_id(f"checkout-{key}-error")).to_be_visible()
            expect(page.get_by_test_id("checkout-submit")).to_be_disabled()
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Checkout UI")
@allure.story("UI-CHECKOUT-002 - Boundaries and negatives")
@allure.title("[UI-CHECKOUT-002] Checkout rejects boundary and invalid values")
def test_ui_checkout_002_boundaries_and_negatives(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/checkout")
        with step("When: user enters invalid characters, formats and boundaries"):
            page.get_by_test_id("checkout-fullname").fill("Invalid@Name")
            page.get_by_test_id("checkout-email").fill("not-an-email")
            page.get_by_test_id("checkout-zip").fill("-1")
            page.get_by_test_id("checkout-card-number").fill("123")
            page.get_by_test_id("checkout-expiry").fill("1399")
            page.get_by_test_id("checkout-cvv").fill("1")
        with step("Then: each boundary produces a specific error"):
            expect(page.get_by_test_id("checkout-fullname-error")).to_contain_text("only")
            expect(page.get_by_test_id("checkout-email-error")).to_contain_text("invalid")
            expect(page.get_by_test_id("checkout-zip")).to_have_value("1")
            expect(page.get_by_test_id("checkout-zip-error")).to_have_count(0)
            expect(page.get_by_test_id("checkout-card-error")).to_contain_text("15-16")
            expect(page.get_by_test_id("checkout-expiry-error")).to_contain_text("month")
            expect(page.get_by_test_id("checkout-cvv-error")).to_contain_text("3-4")
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Checkout UI")
@allure.story("UI-CHECKOUT-003 - Create order")
@allure.title("[UI-CHECKOUT-003] Checkout creates an order and opens its details")
def test_ui_checkout_003_create_order(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    order_id = None
    try:
        product = create_cart_product(page, product_service)
        page.goto("/checkout")
        with step("When: testing details are completed and the order is submitted"):
            order_id = CheckoutPage(page).place_order()
        with step("Then: detail displays the persisted ID, total and item"):
            expect(page.get_by_test_id("order-detail-id")).to_contain_text(str(order_id))
            expect(page.get_by_test_id("order-detail-items")).to_contain_text(product["name"])
            expect(page.get_by_test_id("order-detail-total")).to_be_visible()
    finally:
        if order_id:
            product_service.delete_order(order_id)
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Checkout UI")
@allure.story("UI-CHECKOUT-004 - Responsive modal")
@allure.title("[UI-CHECKOUT-004] Tax modal remains inside the responsive viewport")
def test_ui_checkout_004_responsive_modal(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = create_cart_product(page, product_service)
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto("/checkout")
        page.get_by_test_id("checkout-more-about-shipping-taxes").click()
        modal = page.get_by_test_id("tax-shipping-dialog")
        expect(modal).to_be_visible()
        box = modal.bounding_box()
        assert box is not None
        assert box["x"] >= 0
        assert box["x"] + box["width"] <= 390
        assert box["height"] <= 844
        page.get_by_test_id("tax-shipping-close").click()
        expect(modal).to_be_hidden()
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Orders UI")
@allure.story("UI-ORDER-001 - Open detail")
@allure.title("[UI-ORDER-001] Opening details shows content and full-page navigation")
def test_ui_order_001_open_detail(
    authenticated_page: Page, order_service: OrderService
) -> None:
    page = authenticated_page
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order()
        order_id = controlled.order["id"]
        page.goto("/orders")
        page.get_by_test_id("orders-search").fill(str(order_id))
        page.get_by_test_id(f"order-view-{order_id}").click()
        with step("Then: the modal matches the order and opens the full page"):
            expect(page.get_by_test_id("order-modal")).to_be_visible()
            expect(page.get_by_test_id("order-modal")).to_contain_text(str(order_id))
            page.get_by_test_id("order-modal-open-page").click()
            expect(page).to_have_url(re.compile(rf"/orders/{order_id}$"))
            expect(page.get_by_test_id("order-detail-id")).to_contain_text(str(order_id))
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature("Orders UI")
@allure.story("UI-ORDER-002 - Search and filter")
@allure.title("[UI-ORDER-002] History searches and filters a controlled order")
def test_ui_order_002_search_and_filter(
    authenticated_page: Page, order_service: OrderService
) -> None:
    page = authenticated_page
    controlled: ControlledOrder | None = None
    try:
        controlled = order_service.create_controlled_order("paid")
        order_id = controlled.order["id"]
        page.goto("/orders")
        with step("When: user searches the ID and filters by status"):
            page.get_by_test_id("orders-search").fill(str(order_id))
            page.get_by_test_id("orders-status-filter").select_option(
                controlled.order["payment_status"]
            )
        with step("Then: only the controlled order is displayed"):
            expect(page.get_by_test_id(f"order-row-id-{order_id}")).to_be_visible()
            expect(page.get_by_test_id(ORDER_ROW)).to_have_count(1)
    finally:
        order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature("Orders UI")
@allure.story("UI-ORDER-003 - Paginate history")
@allure.title("[UI-ORDER-003] History paginates consistently")
def test_ui_order_003_paginate_history(authenticated_page: Page) -> None:
    page = authenticated_page
    # Pagination is a presentation contract, so the eleven rows it must split
    # are stubbed instead of creating eleven real orders on the shared account.
    controlled_orders = [
        {
            "id": 910_000 + index,
            "total": 20 + index,
            "status": "completed",
            "payment_status": "paid",
            "payment_brand": "Visa",
            "payment_last4": "4242",
            "created_at": datetime(2026, 1, index + 1, tzinfo=timezone.utc).isoformat(),
            "order_items": [],
            "order_shipping": None,
        }
        for index in range(11)
    ]

    def fulfill(route: Route) -> None:
        query = parse_qs(urlparse(route.request.url).query)
        requested_page = int(query.get("page", ["1"])[0])
        limit = int(query.get("limit", ["10"])[0])
        start = (requested_page - 1) * limit
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(
                {
                    "success": True,
                    "data": controlled_orders[start : start + limit],
                    "pagination": {
                        "page": requested_page,
                        "limit": limit,
                        "total": len(controlled_orders),
                        "total_pages": math.ceil(len(controlled_orders) / limit),
                    },
                }
            ),
        )

    page.route("**/api/orders?*", fulfill)
    page.goto("/orders")
    page.get_by_test_id("orders-items-per-page").select_option("10")
    with step("Then: the first page honors the limit"):
        expect(page.get_by_test_id(ORDER_ROW)).to_have_count(10)
        expect(page.get_by_test_id("orders-page-indicator")).to_contain_text("Page 1")
    with step("When: user advances and returns, the indicator tracks the page"):
        page.get_by_test_id("orders-next").click()
        expect(page.get_by_test_id("orders-page-indicator")).to_contain_text("Page 2")
        expect(page.get_by_test_id(ORDER_ROW)).to_have_count(1)
        page.get_by_test_id("orders-prev").click()
        expect(page.get_by_test_id("orders-page-indicator")).to_contain_text("Page 1")
        expect(page.get_by_test_id(ORDER_ROW)).to_have_count(10)
