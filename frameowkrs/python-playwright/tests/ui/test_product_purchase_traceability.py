import allure
import pytest
from playwright.sync_api import Browser, Playwright, expect

from data.test_data import PRODUCT, PURCHASE_QUANTITY
from fixtures.conftest import authenticated_context
from helpers.unique_name import unique_product_name
from pages.cart_page import CartPage
from pages.checkout_page import CheckoutPage
from pages.store_page import StorePage
from services.product_service import ProductService


@allure.epic("Chapter 5")
@allure.feature("UI automation")
@allure.story("Product purchase traceability")
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
    product_id = order_id = None
    product_service.clear_cart()
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        product_id = product["id"]
        store.open_product(product_id, product["name"])
        before = store.read_inventory(product_id)
        assert before == {"stock": product["stock"], "reserved": 0, "available": product["stock"]}
        store.add_to_cart(product_id)
        reserved = store.read_inventory(product_id)
        assert reserved == {
            "stock": before["stock"],
            "reserved": PURCHASE_QUANTITY,
            "available": before["stock"] - PURCHASE_QUANTITY,
        }
        cart.open_and_verify(product["name"], PURCHASE_QUANTITY, float(product["price"]))
        cart.proceed_to_checkout()
        order_id = checkout.place_order()
        store.open_product(product_id, product["name"])
        purchased = store.read_inventory(product_id)
        assert purchased == {
            "stock": before["stock"] - PURCHASE_QUANTITY,
            "reserved": 0,
            "available": before["stock"] - PURCHASE_QUANTITY,
        }
        store.open_order_history(product_id, order_id)
        row = page.get_by_test_id(f"order-history-row-{order_id}")
        expect(row).to_contain_text(str(PURCHASE_QUANTITY))
        expect(row).to_contain_text("paid")
        if device_name:
            store.assert_mobile_modal_contract()
    finally:
        if order_id:
            product_service.delete_order(order_id)
        product_service.clear_cart()
        if product_id:
            product_service.delete_product(product_id)
        context.close()
