import re

from playwright.sync_api import Page, expect

from helpers.steps import Actions, step


class CheckoutPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def fill_testing_details(self) -> None:
        with step(Actions.CHECKOUT_FILL):
            self.page.get_by_test_id("checkout-use-fake-name-email").check()
            self.page.get_by_test_id("checkout-use-fake-address").check()
            self.page.get_by_test_id("checkout-use-testing-card").check()

    def submit_order(self) -> int:
        with step(Actions.CHECKOUT_SUBMIT):
            self.page.get_by_test_id("checkout-submit").click()
            expect(self.page).to_have_url(re.compile(r"/orders/\d+$"))
            match = re.search(r"/orders/(\d+)$", self.page.url)
            if not match:
                raise AssertionError("Order ID was not present in the order detail URL")
            return int(match.group(1))

    def place_order(self) -> int:
        self.fill_testing_details()
        return self.submit_order()
