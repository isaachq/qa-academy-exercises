package tests.ui;

import data.TestData;
import fixtures.AuthenticatedBrowser;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import pages.PlaygroundPage;

@Epic("Chapter 5")
@Feature("Playground")
@Story("Flaky test triage")
class PlaygroundFlakyTest {
    @Test
    void reproducesAControlledScenarioWithAFixedSeed() {
        WebDriver driver = AuthenticatedBrowser.create(false);
        try {
            PlaygroundPage playground = new PlaygroundPage(driver);
            playground.openWithSeed(TestData.FLAKY_SEED);
            playground.runFastSuccess();
        } finally {
            driver.quit();
        }
    }
}
