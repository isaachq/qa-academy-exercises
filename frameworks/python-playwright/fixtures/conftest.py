import json
from typing import Iterator

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, expect

from config.environment import environment
from services.api_client import ApiClient
from services.order_service import OrderService
from services.product_service import ProductService

MOBILE_VIEWPORT = {"width": 390, "height": 844}
DESKTOP_VIEWPORT = {"width": 1440, "height": 900}

# The TypeScript projects give every web-first assertion a ten second budget.
# The four Allure reports only compare when the same assertion has the same budget.
expect.set_options(timeout=10_000)


def authenticated_context(
    browser: Browser,
    playwright: Playwright,
    device_name: str | None = None,
    accept_terms: bool = True,
    authenticate: bool = True,
) -> BrowserContext:
    options = (
        dict(playwright.devices[device_name])
        if device_name
        else {"viewport": dict(DESKTOP_VIEWPORT)}
    )
    options["base_url"] = environment.base_url
    options["extra_http_headers"] = environment.automation_headers
    context = browser.new_context(**options)
    terms_script = (
        "localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');"
        if accept_terms
        else "localStorage.removeItem('qa-academy-terms-consent-v1');"
    )
    session_script = (
        f"""
          localStorage.setItem('api_token', {json.dumps(environment.api_key)});
          localStorage.setItem('user_email', {json.dumps(environment.ui_email)});
        """
        if authenticate
        else """
          localStorage.removeItem('api_token');
          localStorage.removeItem('user_email');
        """
    )
    context.add_init_script(
        f"""
        (() => {{
          {session_script}
          {terms_script}
        }})()
        """
    )
    return context


@pytest.fixture
def authenticated_page(browser: Browser, playwright: Playwright) -> Iterator[Page]:
    """Browser already carrying the token and the accepted Terms Gate.

    `DEVICE_PROFILE=mobile` runs the same catalog on a mobile device without
    duplicating any scenario, exactly as the Cypress project does.
    """
    device = "Pixel 7" if environment.device_profile == "mobile" else None
    context = authenticated_context(browser, playwright, device)
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture
def mobile_page(authenticated_page: Page) -> Page:
    """Authenticated page resized to the reference mobile viewport."""
    authenticated_page.set_viewport_size(dict(MOBILE_VIEWPORT))
    return authenticated_page


@pytest.fixture
def product_service() -> ProductService:
    return ProductService()


@pytest.fixture
def api_client() -> ApiClient:
    return ApiClient()


@pytest.fixture
def order_service(
    api_client: ApiClient, product_service: ProductService
) -> OrderService:
    return OrderService(api_client, product_service)
