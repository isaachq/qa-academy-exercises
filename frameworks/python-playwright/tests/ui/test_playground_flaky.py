import allure
import pytest
from playwright.sync_api import Page

from data.test_data import FLAKY_SEED
from pages.playground_page import PlaygroundPage


@allure.epic("Chapter 5")
@allure.feature("Playground")
@allure.story("Flaky test triage")
@pytest.mark.ui
def test_reproduces_a_controlled_scenario_with_a_fixed_seed(authenticated_page: Page) -> None:
    allure.dynamic.parameter("seed", FLAKY_SEED)
    playground = PlaygroundPage(authenticated_page)
    playground.open_with_seed(FLAKY_SEED)
    playground.run_fast_success()
