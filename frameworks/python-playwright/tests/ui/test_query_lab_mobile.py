import re
import time
from urllib.parse import urlparse

import allure
import pytest
from playwright.sync_api import Page, Route, expect

from data.test_data import PRODUCT
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.order_service import ControlledOrder, OrderService
from services.product_service import ProductService

pytestmark = [pytest.mark.ui, pytest.mark.extended]

ADD_TO_CART = re.compile(r"^product-add-to-cart-\d+$")


def open_lab(page: Page) -> None:
    page.goto("/query-lab")
    expect(page.get_by_test_id("query-lab-page")).to_be_visible()


def run_lab(page: Page) -> None:
    page.get_by_test_id("query-lab-run").click()
    expect(page.get_by_test_id("query-lab-loading")).to_be_hidden()


def document_scroll_width(page: Page) -> int:
    return page.evaluate("document.documentElement.scrollWidth")


@allure.epic("Chapter 5")
@allure.feature("Query Lab UI")
@allure.story("UI-QUERY-001 - Query products")
@allure.title("[UI-QUERY-001] Query Lab queries products with a visible document")
def test_ui_query_001_query_products(authenticated_page: Page) -> None:
    page = authenticated_page
    open_lab(page)
    with step("When: user configures filters and runs a product QUERY"):
        page.get_by_test_id("query-lab-search").fill("a")
        page.get_by_test_id("query-lab-sort-field").select_option("price")
        page.get_by_test_id("query-lab-sort-direction").select_option("asc")
        run_lab(page)
    with step("Then: preview, transport, table and metadata are consistent"):
        expect(page.get_by_test_id("query-lab-preview-code")).to_contain_text("QUERY")
        expect(page.get_by_test_id("query-lab-status-badge")).to_contain_text("200")
        expect(page.get_by_test_id("query-lab-transport-badge")).to_contain_text("QUERY")
        expect(page.get_by_test_id("query-lab-table")).to_be_visible()


@allure.epic("Chapter 5")
@allure.feature("Query Lab UI")
@allure.story("UI-QUERY-002 - Query orders")
@allure.title("[UI-QUERY-002] Query Lab queries orders and uses the total field")
def test_ui_query_002_query_orders(
    authenticated_page: Page, order_service: OrderService
) -> None:
    page = authenticated_page
    controlled: ControlledOrder | None = None
    try:
        with step("Given: a controlled order exists for the query result"):
            controlled = order_service.create_controlled_order()
        open_lab(page)
        with step("When: user switches to orders and sorts by total"):
            page.get_by_test_id("query-lab-resource-orders").click()
            page.get_by_test_id("query-lab-sort-field").select_option("total")
            run_lab(page)
        with step("Then: results and header use total rather than total_amount"):
            expect(page.get_by_test_id("query-lab-transport-badge")).to_contain_text("QUERY")
            expect(page.get_by_test_id("query-lab-th-total")).to_be_visible()
            expect(page.get_by_test_id("query-lab-results")).to_contain_text(
                str(controlled.order["id"])
            )
            expect(page.get_by_test_id("query-lab-results")).not_to_contain_text("total_amount")
    finally:
        with step("Teardown: delete the controlled order and product"):
            order_service.cleanup(controlled)


@allure.epic("Chapter 5")
@allure.feature("Query Lab UI")
@allure.story("UI-QUERY-003 - Change transport")
@allure.title("[UI-QUERY-003] Query Lab switches to POST override transport")
def test_ui_query_003_change_transport(authenticated_page: Page) -> None:
    page = authenticated_page
    open_lab(page)
    with step("When: user selects POST with X-HTTP-Method-Override"):
        page.get_by_test_id("query-lab-transport-override").click()
        expect(page.get_by_test_id("query-lab-preview-code")).to_contain_text(
            "X-HTTP-Method-Override: QUERY"
        )
        run_lab(page)
    with step("Then: the response identifies POST_OVERRIDE"):
        expect(page.get_by_test_id("query-lab-transport-badge")).to_contain_text("POST_OVERRIDE")


@allure.epic("Chapter 5")
@allure.feature("Query Lab UI")
@allure.story("UI-QUERY-004 - Loading empty error cooldown")
@allure.title("[UI-QUERY-004] Query Lab exposes loading empty error and cooldown states")
def test_ui_query_004_states_and_cooldown(authenticated_page: Page) -> None:
    page = authenticated_page
    open_lab(page)
    state = {"delayed": False}

    def delay_first_query(route: Route) -> None:
        # The loading state only exists while a real query is in flight, so the
        # first response is held back instead of being replaced by a stub.
        if not state["delayed"]:
            state["delayed"] = True
            time.sleep(0.4)
        route.continue_()

    page.route("**/api/products/query", delay_first_query)
    with step("When: a real query remains in flight"):
        page.get_by_test_id("query-lab-run").click()
        expect(page.get_by_test_id("query-lab-loading")).to_be_visible()
        expect(page.get_by_test_id("query-lab-loading")).to_be_hidden()
    with step("Then: the accessible cooldown starts"):
        expect(page.get_by_test_id("query-lab-cooldown-toast")).to_be_visible()
        expect(page.get_by_test_id("query-lab-run")).to_be_disabled()
        expect(page.get_by_test_id("query-lab-run")).to_be_enabled(timeout=5000)
    with step("When: a search has no matches, the empty state appears"):
        page.get_by_test_id("query-lab-search").fill(f"no-result-{time.time_ns()}")
        run_lab(page)
        expect(page.get_by_test_id("query-lab-no-results")).to_be_visible()
        expect(page.get_by_test_id("query-lab-run")).to_be_enabled(timeout=5000)
    with step("When: the range is invalid, the server error is visible"):
        page.get_by_test_id("query-lab-search").fill("")
        page.get_by_test_id("query-lab-price-min").fill("100")
        page.get_by_test_id("query-lab-price-max").fill("1")
        run_lab(page)
        expect(page.get_by_test_id("query-lab-error")).to_be_visible()


@allure.epic("Chapter 5")
@allure.feature("Mobile UI")
@allure.story("UI-MOBILE-001 - Responsive Store")
@allure.title("[UI-MOBILE-001] Store adapts to a mobile viewport without overflow")
def test_ui_mobile_001_responsive_store(mobile_page: Page) -> None:
    page = mobile_page
    page.goto("/store")
    with step("Then: primary controls and cards fit inside the viewport"):
        expect(page.get_by_test_id("mobile-menu-open")).to_be_visible()
        expect(page.get_by_test_id("store-search")).to_be_visible()
        expect(page.get_by_test_id(ADD_TO_CART).first).to_be_visible()
        assert document_scroll_width(page) <= 390


@allure.epic("Chapter 5")
@allure.feature("Mobile UI")
@allure.story("UI-MOBILE-002 - Responsive cart and modal")
@allure.title("[UI-MOBILE-002] Cart and modal preserve the responsive contract")
def test_ui_mobile_002_responsive_cart_and_modal(
    mobile_page: Page, product_service: ProductService
) -> None:
    page = mobile_page
    product = None
    try:
        product_service.clear_cart()
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        page.goto("/store")
        page.get_by_test_id("store-search").fill(product["name"])
        with page.expect_response(
            lambda response: urlparse(response.url).path == "/api/cart"
            and response.request.method == "POST"
        ) as response_info:
            page.get_by_test_id(f"product-add-to-cart-{product['id']}").click()
        assert response_info.value.status == 201
        page.get_by_test_id(f"product-stock-info-{product['id']}").click()
        modal = page.get_by_test_id("stock-info-modal")
        expect(modal).to_be_visible()
        box = modal.bounding_box()
        assert box is not None
        assert box["x"] + box["width"] <= 390
        assert box["height"] <= 844
        page.get_by_test_id("stock-info-close").click()
        page.goto("/cart")
        expect(page.get_by_test_id("cart-items")).to_contain_text(product["name"])
        assert document_scroll_width(page) <= 390
    finally:
        product_service.clear_cart()
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Mobile UI")
@allure.story("UI-MOBILE-003 - Responsive Playground")
@allure.title("[UI-MOBILE-003] Playground keeps its sections usable on mobile")
def test_ui_mobile_003_responsive_playground(mobile_page: Page) -> None:
    page = mobile_page
    page.goto("/playground")
    with step("Then: initial controls, table and Shadow DOM do not cause global overflow"):
        expect(page.get_by_test_id("section-text-inputs")).to_be_visible()
        expect(page.get_by_test_id("section-advanced-datatable")).to_be_visible()
        expect(page.get_by_test_id("section-shadow-dom")).to_be_visible()
        assert document_scroll_width(page) <= 390
