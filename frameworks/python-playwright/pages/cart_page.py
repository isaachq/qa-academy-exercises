from playwright.sync_api import Page, expect

from helpers.steps import Actions, step


class CartPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def open(self) -> None:
        with step(Actions.CART_OPEN):
            self.page.goto("/cart", wait_until="commit")

    def expect_item(self, product_name: str, quantity: int, unit_price: float) -> None:
        with step(Actions.CART_VERIFY_ITEM):
            items = self.page.get_by_test_id("cart-items")
            expect(items).to_contain_text(product_name)
            expect(items).to_contain_text(str(quantity))
            expect(self.page.get_by_test_id("cart-subtotal")).to_contain_text(
                f"{quantity * unit_price:.2f}"
            )

    def proceed_to_checkout(self) -> None:
        with step(Actions.CART_CHECKOUT):
            self.page.get_by_test_id("cart-checkout").click()
