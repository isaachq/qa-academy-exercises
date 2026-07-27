import json

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright

from config.environment import environment
from services.product_service import ProductService


def authenticated_context(
    browser: Browser, playwright: Playwright, device_name: str | None = None
) -> BrowserContext:
    options = (
        dict(playwright.devices[device_name])
        if device_name
        else {"viewport": {"width": 1440, "height": 900}}
    )
    options["base_url"] = environment.base_url
    context = browser.new_context(**options)
    context.add_init_script(
        f"""
        (() => {{
          localStorage.setItem('api_token', {json.dumps(environment.api_key)});
          localStorage.setItem('user_email', {json.dumps(environment.ui_email)});
          localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
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
