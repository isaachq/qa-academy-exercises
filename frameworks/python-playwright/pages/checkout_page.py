import re

from playwright.sync_api import Page, expect


class CheckoutPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def place_order(self) -> int:
        self.page.get_by_test_id("checkout-use-fake-name-email").check()
        self.page.get_by_test_id("checkout-use-fake-address").check()
        self.page.get_by_test_id("checkout-use-testing-card").check()
        self.page.get_by_test_id("checkout-submit").click()
        expect(self.page).to_have_url(re.compile(r"/orders/\d+$"))
        match = re.search(r"/orders/(\d+)$", self.page.url)
        if not match:
            raise AssertionError("Order ID was not present in the order detail URL")
        return int(match.group(1))
