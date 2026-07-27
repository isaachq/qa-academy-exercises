import allure
import pytest
from playwright.sync_api import Page

from data.test_data import FLAKY_SEED
from helpers.steps import Steps, Titles, step
from pages.playground_page import PlaygroundPage


@allure.epic("Chapter 5")
@allure.feature("Playground")
@allure.story("BOOK-TEST-UI-002 - Flaky test triage")
@allure.title(Titles.PLAYGROUND_FLAKY)
@pytest.mark.ui
def test_reproduces_a_controlled_scenario_with_a_fixed_seed(authenticated_page: Page) -> None:
    allure.dynamic.parameter("seed", FLAKY_SEED)
    playground = PlaygroundPage(authenticated_page)

    with step(Steps.OPEN_PLAYGROUND):
        playground.open_with_seed(FLAKY_SEED)

    with step(Steps.ASSERT_SEED):
        playground.expect_seed(FLAKY_SEED)

    with step(Steps.TRIGGER_FAST_SUCCESS):
        playground.trigger_fast_success()

    with step(Steps.ASSERT_INVOICE_MODAL):
        playground.expect_invoice_modal(FLAKY_SEED)
