import json

from playwright.sync_api import Page, expect


class PlaygroundPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def open_with_seed(self, seed: int) -> None:
        self.page.add_init_script(
            f"localStorage.setItem('flaky_seed', {json.dumps(str(seed))})"
        )
        self.page.goto("/playground")
        expect(self.page.get_by_test_id("flaky-seed-display")).to_contain_text(str(seed))

    def run_fast_success(self) -> None:
        self.page.get_by_test_id("trigger-success-fast").click()
        expect(self.page.get_by_test_id("flaky-invoice-modal")).to_be_visible(timeout=8000)
        expect(self.page.get_by_test_id("flaky-invoice-status")).to_be_visible()
