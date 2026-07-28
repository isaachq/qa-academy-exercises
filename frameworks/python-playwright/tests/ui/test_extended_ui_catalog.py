import pytest
from playwright.sync_api import Browser, Page, Playwright, expect

from data.extended_catalog import UI_CASES
from data.test_data import PRODUCT
from fixtures.conftest import authenticated_context
from helpers.unique_name import unique_product_name
from services.product_service import ProductService


SECTION_IDS = [
    "section-text-inputs", "section-buttons", "section-radio", "section-checkbox",
    "section-dropdown", "section-other-inputs", "section-modals", "section-table",
    "section-tabs", "section-accordion", "section-links", "section-loading",
    "section-badges", "section-contact-form", "section-order-form",
    "section-advanced-datatable", "section-basic-auth", "section-iframe",
    "section-geolocation", "section-hover", "section-new-tab",
    "section-download-upload", "section-flakiness", "section-shadow-dom",
]


@pytest.mark.parametrize(
    "case_id,title,route,selectors,mobile",
    UI_CASES,
    ids=[case[0] for case in UI_CASES],
)
def test_extended_ui_catalog(
    authenticated_page: Page,
    case_id: str,
    title: str,
    route: str,
    selectors: list[str],
    mobile: bool,
    browser: Browser,
    playwright: Playwright,
    product_service: ProductService,
) -> None:
    page = authenticated_page
    if mobile:
        page.set_viewport_size({"width": 412, "height": 915})

    if case_id == "UI-SHELL-001":
        terms_context = authenticated_context(browser, playwright, accept_terms=False)
        try:
            terms_page = terms_context.new_page()
            terms_page.goto(route)
            expect(terms_page.get_by_test_id("terms-gate-dialog")).to_be_visible()
            terms_page.get_by_test_id("terms-gate-accept").click()
            assert terms_page.evaluate(
                "localStorage.getItem('qa-academy-terms-consent-v1')"
            ) == "accepted"
        finally:
            terms_context.close()
        return

    product = None
    try:
        if case_id.startswith("UI-CHECKOUT-"):
            product_service.clear_cart()
            product = product_service.create_product(
                {"name": unique_product_name(), **PRODUCT}
            )
            product_service.add_to_cart(product["id"])

        page.goto(route, wait_until="commit")
        if case_id == "UI-SHELL-002":
            page.get_by_test_id("mobile-menu-open").click()
        if case_id == "UI-PLAY-001":
            for selector in SECTION_IDS:
                expect(page.get_by_test_id(selector)).to_have_count(1)
            return
        for selector in selectors:
            expect(page.get_by_test_id(selector)).to_be_attached()
    finally:
        if product:
            product_service.clear_cart()
            product_service.delete_product(product["id"])
