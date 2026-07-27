package fixtures;

import config.Environment;
import java.util.Map;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public final class AuthenticatedBrowser {
    private AuthenticatedBrowser() {}

    public static WebDriver create(boolean mobile) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
        if (mobile) {
            options.setExperimentalOption("mobileEmulation", Map.of(
                    "deviceMetrics", Map.of("width", 412, "height", 915, "pixelRatio", 2.625),
                    "userAgent", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 "
                            + "(KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36"));
        } else {
            options.addArguments("--window-size=1440,900");
        }
        WebDriver driver = new ChromeDriver(options);
        driver.get(Environment.BASE_URL);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript(
                "localStorage.setItem('api_token', arguments[0]);"
                        + "localStorage.setItem('user_email', arguments[1]);"
                        + "localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');",
                Environment.required("API_KEY"), Environment.required("UI_EMAIL"));
        return driver;
    }
}
