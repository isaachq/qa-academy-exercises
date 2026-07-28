import allure
import pytest
from playwright.sync_api import Page

from helpers.steps import step
from pages.playground_page import PlaygroundPage

pytestmark = [pytest.mark.ui, pytest.mark.extended]

FEATURE = "Playground"


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-001 - Playground section smoke")
@allure.title("[UI-PLAY-001] Playground exposes all 24 unique automation sections")
def test_ui_play_001_section_smoke(authenticated_page: Page) -> None:
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("Then: every documented section exists exactly once"):
        playground.expect_complete_section_contract()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-002 - Form validation and boundaries")
@allure.title("[UI-PLAY-002] Playground contact form validates required and boundary values")
def test_ui_play_002_form_validation_and_boundaries(authenticated_page: Page) -> None:
    allure.dynamic.parameter("messageBoundary", 500)
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("When: user submits invalid and boundary form values"):
        playground.expect_contact_form_validation_and_boundaries()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-003 - Modal tabs and accordion")
@allure.title("[UI-PLAY-003] Playground modal tabs and accordion change deterministic state")
def test_ui_play_003_modal_tabs_and_accordion(authenticated_page: Page) -> None:
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("When: user operates the modal tabs and accordion"):
        playground.expect_modal_tabs_and_accordion()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-004 - DataTable")
@allure.title("[UI-PLAY-004] Playground DataTable has 100 searchable sortable rows and no pagination")
def test_ui_play_004_datatable(authenticated_page: Page) -> None:
    allure.dynamic.parameter("baseRows", 100)
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("Then: DataTable search and sort preserve its contract"):
        playground.expect_datatable_contract()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-005 - Browser contexts")
@allure.title("[UI-PLAY-005] Playground controls iframe hover and new-tab contexts")
def test_ui_play_005_browser_contexts(authenticated_page: Page) -> None:
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("When: user changes and restores browser contexts"):
        playground.expect_iframe_hover_and_new_tab()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-006 - Download and upload")
@allure.title("[UI-PLAY-006] Playground verifies downloaded and uploaded files")
def test_ui_play_006_download_and_upload(authenticated_page: Page) -> None:
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("When: user downloads and uploads controlled artifacts"):
        playground.expect_download_and_upload()


@allure.epic("Chapter 5")
@allure.feature(FEATURE)
@allure.story("UI-PLAY-008 - Open Shadow DOM")
@allure.title("[UI-PLAY-008] Playground open Shadow DOM accepts and returns input")
def test_ui_play_008_open_shadow_dom(authenticated_page: Page) -> None:
    playground = PlaygroundPage(authenticated_page)
    with step("Given: a fresh Playground page"):
        playground.open()
    with step("Then: open Shadow DOM interaction returns the submitted value"):
        playground.expect_open_shadow_dom()
