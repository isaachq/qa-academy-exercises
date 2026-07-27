package tests.ui;

import data.TestData;
import fixtures.AuthenticatedBrowser;
import helpers.Steps;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import pages.PlaygroundPage;

@Epic("Chapter 5")
@Feature("Playground")
@Story("Flaky test triage")
class PlaygroundFlakyTest {
    @Test
    @DisplayName(Steps.Titles.PLAYGROUND_FLAKY)
    void reproducesAControlledScenarioWithAFixedSeed() {
        WebDriver driver = AuthenticatedBrowser.create(false);
        PlaygroundPage playground = new PlaygroundPage(driver);
        long seed = TestData.FLAKY_SEED;
        try {
            Steps.step(Steps.Scenario.OPEN_PLAYGROUND, () -> playground.openWithSeed(seed));
            Steps.step(Steps.Scenario.ASSERT_SEED, () -> playground.expectSeed(seed));
            Steps.step(Steps.Scenario.TRIGGER_FAST_SUCCESS, playground::triggerFastSuccess);
            Steps.step(Steps.Scenario.ASSERT_INVOICE_MODAL,
                    () -> playground.expectInvoiceModal(seed));
        } finally {
            driver.quit();
        }
    }
}
