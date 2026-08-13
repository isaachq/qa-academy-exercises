package tests.ui;

import fixtures.AuthenticatedBrowser;
import helpers.Steps;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import pages.PlaygroundPage;

@Epic("Chapter 5")
@Tag("extended")
@Feature("Playground Component Catalog UI")
public class PlaygroundCatalogTest {

    @Test
    @Story("UI-PLAY-001")
    @DisplayName("[UI-PLAY-001] Smoke all 24 Playground sections")
    void ui_play_001_smokeAll24Sections() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("Then: all 24 section components are rendered without duplicates", playground::expectCompleteSectionContract);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-002")
    @DisplayName("[UI-PLAY-002] Playground form boundaries")
    void ui_play_002_formBoundaries() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user submits contact form with empty and boundary inputs", playground::expectContactFormValidationAndBoundaries);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-003")
    @DisplayName("[UI-PLAY-003] Playground modal tabs and accordion")
    void ui_play_003_modalTabsAccordion() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user interacts with modals, tabs, and accordions", playground::expectModalTabsAndAccordion);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-004")
    @DisplayName("[UI-PLAY-004] Playground DataTable")
    void ui_play_004_dataTable() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user opens and filters advanced DataTable", playground::expectDataTableContract);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-005")
    @DisplayName("[UI-PLAY-005] Playground iframe hover and new tab")
    void ui_play_005_iframeHoverNewTab() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user tests iframe, hover state, and popup tab creation", playground::expectIframeHoverAndNewTab);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-006")
    @DisplayName("[UI-PLAY-006] Playground download and upload")
    void ui_play_006_downloadAndUpload() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user downloads sample CSV and uploads a file", playground::expectDownloadAndUpload);
        } finally {
            driver.quit();
        }
    }

    @Test
    @Story("UI-PLAY-008")
    @DisplayName("[UI-PLAY-008] Playground open Shadow DOM")
    void ui_play_008_openShadowDom() {
        WebDriver driver = AuthenticatedBrowser.create(false, true);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            Steps.step("Given: playground page is open", playground::open);
            Steps.step("When: user accesses open Shadow DOM root and inputs text", playground::expectOpenShadowDom);
        } finally {
            driver.quit();
        }
    }
}
