from playwright.sync_api import Page, expect


class CartPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def open_and_verify(self, product_name: str, quantity: int, unit_price: float) -> None:
        self.page.goto("/cart")
        items = self.page.get_by_test_id("cart-items")
        expect(items).to_contain_text(product_name)
        expect(items).to_contain_text(str(quantity))
        expect(self.page.get_by_test_id("cart-subtotal")).to_contain_text(
            f"{quantity * unit_price:.2f}"
        )

    def proceed_to_checkout(self) -> None:
        self.page.get_by_test_id("cart-checkout").click()
