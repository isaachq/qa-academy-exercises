import re

from playwright.sync_api import Page, expect


class StorePage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def open_product(self, product_id: int, product_name: str) -> None:
        self.page.goto("/store", wait_until="commit")
        self.page.get_by_test_id("store-search").fill(product_name)
        expect(self.page.get_by_test_id(f"product-add-to-cart-{product_id}")).to_be_visible()

    def read_inventory(self, product_id: int) -> dict[str, int]:
        self.page.get_by_test_id(f"product-stock-info-{product_id}").click()
        modal = self.page.get_by_test_id("stock-info-modal")
        expect(modal).to_be_visible()
        text = modal.inner_text()

        def value(label: str) -> int:
            match = re.search(rf"{re.escape(label)}:\s*(\d+)", text, re.IGNORECASE)
            if not match:
                raise AssertionError(f"Inventory value not found for {label}")
            return int(match.group(1))

        inventory = {
            "stock": value("Total Stock"),
            "reserved": value("Reserved in Your Cart"),
            "available": value("Available to Add"),
        }
        self.page.get_by_test_id("stock-info-close").click()
        return inventory

    def add_to_cart(self, product_id: int) -> None:
        self.page.get_by_test_id(f"product-add-to-cart-{product_id}").click()

    def open_order_history(self, product_id: int, order_id: int) -> None:
        self.page.get_by_test_id(f"product-order-history-{product_id}").click()
        expect(self.page.get_by_test_id("order-history-modal")).to_be_visible()
        expect(self.page.get_by_test_id(f"order-history-row-{order_id}")).to_be_visible()

    def assert_mobile_modal_contract(self) -> None:
        modal = self.page.get_by_test_id("order-history-modal")
        backdrop = modal.locator("..")
        box = modal.bounding_box()
        viewport = self.page.viewport_size
        assert box and viewport
        assert box["x"] >= 0 and box["y"] >= 0
        assert box["x"] + box["width"] <= viewport["width"]
        assert box["height"] <= viewport["height"]
        expect(backdrop).to_have_css("position", "fixed")
        expect(modal).to_have_css("overflow-y", "auto")
        assert backdrop.evaluate(
            "(element) => element.contains(document.elementFromPoint(1, 1))"
        )
        close = self.page.get_by_test_id("order-history-close")
        expect(close).to_be_visible()
        close.click()
        expect(modal).not_to_be_visible()
