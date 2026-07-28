import json

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright

from config.environment import environment
from services.product_service import ProductService


def authenticated_context(
    browser: Browser,
    playwright: Playwright,
    device_name: str | None = None,
    accept_terms: bool = True,
) -> BrowserContext:
    options = (
        dict(playwright.devices[device_name])
        if device_name
        else {"viewport": {"width": 1440, "height": 900}}
    )
    options["base_url"] = environment.base_url
    options["extra_http_headers"] = environment.automation_headers
    context = browser.new_context(**options)
    terms_script = (
        "localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');"
        if accept_terms
        else "localStorage.removeItem('qa-academy-terms-consent-v1');"
    )
    context.add_init_script(
        f"""
        (() => {{
          localStorage.setItem('api_token', {json.dumps(environment.api_key)});
          localStorage.setItem('user_email', {json.dumps(environment.ui_email)});
          {terms_script}
        }})()
        """
    )
    return context


@pytest.fixture
def authenticated_page(browser: Browser, playwright: Playwright) -> Page:
    context = authenticated_context(browser, playwright)
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture
def product_service() -> ProductService:
    return ProductService()
