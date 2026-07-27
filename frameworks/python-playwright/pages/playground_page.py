import json

from playwright.sync_api import Page, expect

from helpers.steps import Actions, step


class PlaygroundPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def open_with_seed(self, seed: int) -> None:
        with step(Actions.PLAYGROUND_OPEN):
            self.page.add_init_script(
                f"localStorage.setItem('flaky_seed', {json.dumps(str(seed))})"
            )
            self.page.goto("/playground", wait_until="commit")

    def expect_seed(self, seed: int) -> None:
        with step(Actions.PLAYGROUND_VERIFY_SEED):
            expect(self.page.get_by_test_id("flaky-seed-display")).to_contain_text(str(seed))

    def trigger_fast_success(self) -> None:
        with step(Actions.PLAYGROUND_TRIGGER):
            self.page.get_by_test_id("trigger-success-fast").click()

    def expect_invoice_modal(self, seed: int) -> None:
        with step(Actions.PLAYGROUND_VERIFY_INVOICE):
            expect(self.page.get_by_test_id("flaky-invoice-modal")).to_be_visible(timeout=8000)
            expect(self.page.get_by_test_id("flaky-invoice-status")).to_be_visible()
            expect(self.page.get_by_test_id("flaky-seed-display")).to_contain_text(str(seed))
