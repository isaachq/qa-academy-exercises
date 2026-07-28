import re
import time
from urllib.parse import parse_qs, urlparse

import allure
import pytest
from playwright.sync_api import Browser, Page, Playwright, expect

from config.environment import environment
from data.test_data import PRODUCT
from fixtures.conftest import authenticated_context
from helpers.steps import step
from helpers.unique_name import unique_product_name
from services.product_service import ProductService

pytestmark = [pytest.mark.ui, pytest.mark.extended]

ADD_TO_CART = re.compile(r"^product-add-to-cart-\d+$")
PRODUCT_ROW = re.compile(r"^product-row-\d+$")


@allure.epic("Chapter 5")
@allure.feature("Authentication UI")
@allure.story("UI-AUTH-001 - Valid login")
@allure.title("[UI-AUTH-001] Valid login preserves an authenticated session")
def test_ui_auth_001_valid_login(browser: Browser, playwright: Playwright) -> None:
    context = authenticated_context(browser, playwright, authenticate=False)
    page = context.new_page()
    try:
        with step("Given: login opens without a previous session"):
            page.goto("/login")
        with step("When: user validates the email and submits the valid password"):
            page.get_by_test_id("login-email").fill(environment.ui_email)
            page.get_by_test_id("login-continue").click()
            expect(page.get_by_test_id("login-password")).to_be_visible()
            page.get_by_test_id("login-password").fill(environment.ui_password)
            page.get_by_test_id("login-submit").click()
        with step("Then: the application opens an authenticated route and stores the token"):
            expect(page).not_to_have_url(re.compile(r"/login$"))
            assert page.evaluate("localStorage.getItem('api_token')")
    finally:
        context.close()


@allure.epic("Chapter 5")
@allure.feature("Authentication UI")
@allure.story("UI-AUTH-002 - Invalid login")
@allure.title("[UI-AUTH-002] Invalid login displays a traceable error")
def test_ui_auth_002_invalid_login(browser: Browser, playwright: Playwright) -> None:
    context = authenticated_context(browser, playwright, authenticate=False)
    page = context.new_page()
    try:
        page.goto("/login")
        with step("When: user attempts to continue with a nonexistent account"):
            page.get_by_test_id("login-email").fill(f"missing-{time.time_ns()}@example.invalid")
            page.get_by_test_id("login-continue").click()
        with step("Then: no session is created and an error is displayed"):
            expect(page.get_by_test_id("login-error")).to_be_visible()
            assert page.evaluate("localStorage.getItem('api_token')") is None
            expect(page).to_have_url(re.compile(r"/login$"))
    finally:
        context.close()


@allure.epic("Chapter 5")
@allure.feature("Application shell UI")
@allure.story("UI-SHELL-001 - Accept Terms Gate")
@allure.title("[UI-SHELL-001] Accepting the Terms Gate persists consent")
def test_ui_shell_001_accept_terms_gate(browser: Browser, playwright: Playwright) -> None:
    context = authenticated_context(browser, playwright, accept_terms=False)
    page = context.new_page()
    try:
        page.goto("/store")
        expect(page.get_by_test_id("terms-gate-dialog")).to_be_visible()
        with step("When: user accepts the terms"):
            page.get_by_test_id("terms-gate-accept").click()
        with step("Then: the dialog closes and consent remains persisted"):
            expect(page.get_by_test_id("terms-gate-dialog")).to_be_hidden()
            assert (
                page.evaluate("localStorage.getItem('qa-academy-terms-consent-v1')")
                == "accepted"
            )
    finally:
        context.close()


@allure.epic("Chapter 5")
@allure.feature("Application shell UI")
@allure.story("UI-SHELL-002 - Responsive navigation")
@allure.title("[UI-SHELL-002] Responsive navigation exposes the sidebar and drawer")
def test_ui_shell_002_responsive_navigation(authenticated_page: Page) -> None:
    page = authenticated_page
    page.goto("/store")
    with step("Then: desktop shows the sidebar and active route"):
        expect(page.get_by_test_id("primary-sidebar")).to_be_visible()
        expect(
            page.get_by_test_id("desktop-nav").get_by_role(
                "link", name=re.compile("store", re.IGNORECASE)
            )
        ).to_have_attribute("aria-current", "page")
    with step("When: viewport changes to mobile width"):
        page.set_viewport_size({"width": 390, "height": 844})
        expect(page.get_by_test_id("mobile-menu-open")).to_be_visible()
        page.get_by_test_id("mobile-menu-open").click()
    with step("Then: the mobile drawer can be opened and closed"):
        expect(page.get_by_test_id("mobile-nav")).to_be_visible()
        page.get_by_test_id("mobile-menu-close").click()
        expect(page.get_by_test_id("mobile-nav")).to_be_hidden()


@allure.epic("Chapter 5")
@allure.feature("Store UI")
@allure.story("UI-STORE-001 - Load Store")
@allure.title("[UI-STORE-001] Store loads its catalog and controls")
def test_ui_store_001_load_store(authenticated_page: Page) -> None:
    page = authenticated_page
    with step("When: user opens the Store"):
        page.goto("/store")
    with step("Then: catalog, search and filters are usable"):
        expect(page.get_by_test_id("store-search")).to_be_visible()
        expect(page.get_by_test_id("store-category-filter")).to_be_visible()
        expect(page.get_by_test_id("store-type-filter")).to_be_visible()
        expect(page.get_by_test_id(ADD_TO_CART).first).to_be_visible()


@allure.epic("Chapter 5")
@allure.feature("Store UI")
@allure.story("UI-STORE-002 - Search and filter")
@allure.title("[UI-STORE-002] Store searches and filters products")
def test_ui_store_002_search_and_filter(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = product_service.create_product(
            {"name": unique_product_name("ui-store-filter"), **PRODUCT, "category": "Office"}
        )
        page.goto("/store")
        with step("When: user searches by name and filters the category"):
            page.get_by_test_id("store-search").fill(product["name"])
            page.get_by_test_id("store-category-filter").get_by_role(
                "button", name="Office"
            ).click()
        with step("Then: only the controlled product remains visible"):
            expect(page.get_by_test_id(f"product-add-to-cart-{product['id']}")).to_be_visible()
            expect(page.get_by_test_id(ADD_TO_CART)).to_have_count(1)
    finally:
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Store UI")
@allure.story("UI-STORE-003 - Pagination")
@allure.title("[UI-STORE-003] Store paginates using the selected page size")
def test_ui_store_003_pagination(authenticated_page: Page) -> None:
    page = authenticated_page
    page.goto("/store")
    expect(page.get_by_test_id(ADD_TO_CART).first).to_be_visible()

    def is_paged_products(response) -> bool:
        url = urlparse(response.url)
        return (
            url.path == "/api/products"
            and parse_qs(url.query).get("limit") == ["5"]
            and response.request.method == "GET"
        )

    with step("When: user selects the smallest page size"):
        with page.expect_response(is_paged_products) as response_info:
            page.get_by_test_id("store-items-per-page").select_option("5")
        response = response_info.value
        assert response.status == 200
        assert len(response.json()["data"]) <= 5
    with step("Then: the catalog is limited and navigation changes page"):
        expect(page.get_by_test_id(ADD_TO_CART)).to_have_count(5)
        expect(page.get_by_test_id("store-page-indicator")).to_contain_text("Page 1")
        page.get_by_test_id("store-next").click()
        expect(page.get_by_test_id("store-page-indicator")).to_contain_text("Page 2")


@allure.epic("Chapter 5")
@allure.feature("Products UI")
@allure.story("UI-PRODUCT-001 - Create owned product")
@allure.title("[UI-PRODUCT-001] A newly created owned product is visible in administration")
def test_ui_product_001_create_owned_product(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        with step("Given: API creates controlled data because the UI has no create control"):
            product = product_service.create_product(
                {"name": unique_product_name(), **PRODUCT}
            )
        page.goto("/products")
        page.get_by_test_id("products-search").fill(product["name"])
        with step("Then: administration displays the product and its persistent ID"):
            expect(page.get_by_test_id(f"product-row-{product['id']}")).to_contain_text(
                product["name"]
            )
    finally:
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Products UI")
@allure.story("UI-PRODUCT-002 - Edit owned product")
@allure.title("[UI-PRODUCT-002] An edited owned product is updated in administration")
def test_ui_product_002_edit_owned_product(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = None
    try:
        product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
        edited_name = f"{product['name']}-edited"
        with step("When: API updates controlled data because the UI has no edit control"):
            updated = product_service.update_product(product["id"], {"name": edited_name})
            assert updated["name"] == edited_name
        page.goto("/products")
        page.get_by_test_id("products-search").fill(edited_name)
        expect(page.get_by_test_id(f"product-row-{product['id']}")).to_contain_text(edited_name)
    finally:
        if product:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Products UI")
@allure.story("UI-PRODUCT-003 - Delete owned product")
@allure.title("[UI-PRODUCT-003] An owned product is deleted from the UI")
def test_ui_product_003_delete_owned_product(
    authenticated_page: Page, product_service: ProductService
) -> None:
    page = authenticated_page
    product = product_service.create_product({"name": unique_product_name(), **PRODUCT})
    deleted = False
    try:
        page.goto("/products")
        page.get_by_test_id("products-search").fill(product["name"])
        with step("When: user deletes the persistent row from administration"):
            page.get_by_test_id(f"product-delete-{product['id']}").click()
        with step("Then: confirmation appears and the row disappears"):
            expect(page.get_by_test_id("products-success-toast")).to_be_visible()
            expect(page.get_by_test_id(f"product-row-{product['id']}")).to_have_count(0)
            deleted = True
    finally:
        if not deleted:
            product_service.delete_product(product["id"])


@allure.epic("Chapter 5")
@allure.feature("Products UI")
@allure.story("UI-PRODUCT-004 - Protected product")
@allure.title("[UI-PRODUCT-004] A non-deletable product keeps its row protected")
def test_ui_product_004_protected_product(authenticated_page: Page) -> None:
    page = authenticated_page
    page.goto("/products")
    expect(page.get_by_test_id("products-table")).to_be_visible()
    page.get_by_test_id("products-type-filter").get_by_role("button", name="Template").click()
    row = page.get_by_test_id(PRODUCT_ROW).first
    with step("When: user attempts to delete a protected template product"):
        expect(row).to_be_visible()
        product_id = row.get_attribute("data-testid").replace("product-row-", "")
        page.get_by_test_id(f"product-delete-{product_id}").click(force=True)
        expect(page.get_by_test_id("products-error-toast")).to_be_visible()
        expect(page.get_by_test_id(f"product-row-{product_id}")).to_be_visible()
