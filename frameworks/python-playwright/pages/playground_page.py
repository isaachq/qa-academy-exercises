import json
import re
from urllib.parse import urlparse

from playwright.sync_api import Page, expect

from helpers.steps import Actions, step

SECTION_IDS = [
    "section-text-inputs",
    "section-buttons",
    "section-radio",
    "section-checkbox",
    "section-dropdown",
    "section-other-inputs",
    "section-modals",
    "section-table",
    "section-tabs",
    "section-accordion",
    "section-links",
    "section-loading",
    "section-badges",
    "section-contact-form",
    "section-order-form",
    "section-advanced-datatable",
    "section-basic-auth",
    "section-iframe",
    "section-geolocation",
    "section-hover",
    "section-new-tab",
    "section-download-upload",
    "section-flakiness",
    "section-shadow-dom",
]


class PlaygroundPage:
    def __init__(self, page: Page) -> None:
        self.page = page

    # Book scenario -------------------------------------------------------

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

    # Extended catalog ----------------------------------------------------

    def open(self) -> None:
        with step("Playground: open a fresh page"):
            self.page.goto("/playground")
            expect(self.page.get_by_test_id("section-text-inputs")).to_be_visible()

    def expect_complete_section_contract(self) -> None:
        with step("Playground: verify all 24 unique sections"):
            for section_id in SECTION_IDS:
                expect(self.page.get_by_test_id(section_id)).to_have_count(1)
            duplicates = self.page.evaluate(
                """() => {
                  const values = [...document.querySelectorAll('[data-testid]')]
                    .map((element) => element.getAttribute('data-testid'))
                    .filter(Boolean);
                  return values.filter((value, index) => values.indexOf(value) !== index);
                }"""
            )
            assert duplicates == [], f"Duplicated data-testid values: {duplicates}"

    def expect_contact_form_validation_and_boundaries(self) -> None:
        with step("Playground: submit an empty contact form"):
            self.page.get_by_test_id("open-contact-modal").click()
            self.page.get_by_test_id("contact-submit").click()
            expect(self.page.get_by_test_id("contact-name-error")).to_be_visible()
            expect(self.page.get_by_test_id("contact-email-error")).to_be_visible()
            expect(self.page.get_by_test_id("contact-message-error")).to_be_visible()
        with step("Playground: submit valid boundary values"):
            self.page.get_by_test_id("contact-name").fill("Boundary User")
            self.page.get_by_test_id("contact-email").fill("boundary@example.test")
            self.page.get_by_test_id("contact-message").fill("A" * 500)
            self.page.get_by_test_id("contact-submit").click()
            expect(self.page.get_by_test_id("contact-success-close")).to_be_visible()
            self.page.get_by_test_id("contact-success-close").click()

    def expect_modal_tabs_and_accordion(self) -> None:
        with step("Playground: open and close the modal"):
            self.page.get_by_test_id("button-show-modal").click()
            expect(self.page.get_by_test_id("modal-content")).to_be_visible()
            self.page.get_by_test_id("modal-cancel").click()
            expect(self.page.get_by_test_id("modal-content")).to_be_hidden()
        with step("Playground: change the active tab"):
            self.page.get_by_test_id("tab-button-2").click()
            expect(self.page.get_by_test_id("tab-panel-2")).to_be_visible()
            expect(self.page.get_by_test_id("tab-panel-1")).to_have_count(0)
        with step("Playground: expand and collapse an accordion item"):
            button = self.page.get_by_test_id("accordion-button-1")
            button.click()
            expect(self.page.get_by_test_id("accordion-content-1")).to_be_visible()
            button.click()
            expect(self.page.get_by_test_id("accordion-content-1")).to_be_hidden()

    def expect_datatable_contract(self) -> None:
        rows = self.page.locator('[data-testid^="datatable-row-"]')
        with step("Playground: open the 100-row DataTable"):
            self.page.get_by_test_id("open-datatable").click()
            expect(self.page.get_by_test_id("datatable-modal")).to_be_visible()
            expect(rows).to_have_count(100)
        with step("Playground: search and sort without invented pagination"):
            self.page.get_by_test_id("datatable-search").fill("Alice")
            expect(rows).not_to_have_count(0)
            assert rows.count() < 100
            self.page.get_by_test_id("datatable-search").fill("")
            self.page.get_by_test_id("sort-name").click()
            expect(self.page.get_by_test_id("sort-name")).to_contain_text("↑")
            expect(
                self.page.get_by_test_id("datatable-modal").get_by_text(
                    re.compile("next", re.IGNORECASE)
                )
            ).to_have_count(0)
            self.page.get_by_test_id("datatable-close").click()

    def expect_iframe_hover_and_new_tab(self) -> None:
        with step("Playground: enter and return from the iframe"):
            frame = self.page.frame_locator('[data-testid="example-iframe"]')
            expect(frame.locator("body")).not_to_be_empty()
            expect(self.page.get_by_test_id("section-iframe")).to_be_visible()
        with step("Playground: reveal hover-only content"):
            self.page.get_by_test_id("hover-button-1").hover()
            expect(self.page.get_by_test_id("hover-span")).to_be_visible()
        with step("Playground: open and close a controlled new tab"):
            with self.page.expect_popup() as popup_info:
                self.page.get_by_test_id("open-new-tab-form").click()
            popup = popup_info.value
            popup.wait_for_load_state("domcontentloaded")
            assert "/playground/second-form" in urlparse(popup.url).path
            popup.close()
            expect(self.page.get_by_test_id("section-new-tab")).to_be_visible()

    def expect_download_and_upload(self) -> None:
        with step("Playground: download the CSV artifact"):
            with self.page.expect_download() as download_info:
                self.page.get_by_test_id("download-csv").click()
            download = download_info.value
            assert download.suggested_filename.endswith(".csv"), download.suggested_filename
            assert download.failure() is None
        with step("Playground: upload a simulated text file"):
            self.page.get_by_test_id("file-upload-input").set_input_files(
                files=[
                    {
                        "name": "playground-upload.txt",
                        "mimeType": "text/plain",
                        "buffer": b"traceable playground upload",
                    }
                ]
            )
            expect(self.page.get_by_test_id("uploading-state")).to_be_visible()
            expect(self.page.get_by_test_id("upload-success")).to_be_visible(timeout=8000)

    def expect_open_shadow_dom(self) -> None:
        with step("Playground: interact through the open shadow root"):
            expect(self.page.get_by_test_id("shadow-host")).to_be_visible()
            self.page.get_by_test_id("shadow-input").fill("traceable automation")
            self.page.get_by_test_id("shadow-submit").click()
            expect(self.page.get_by_test_id("shadow-result")).to_have_text(
                "Shadow DOM received: traceable automation"
            )
