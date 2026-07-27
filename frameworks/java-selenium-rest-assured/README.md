# Java Selenium and REST Assured Framework

This main framework uses JUnit 5, Selenium and REST Assured while retaining the same responsibility
layers and scenarios as the Playwright projects.

## Setup and run

```bash
export BASE_URL=https://qaacademyabc.xyz
export API_KEY=replace-me
export UI_EMAIL=replace-me@example.com
mvn test
allure generate target/allure-results --clean -o allure-report
```

Chrome is resolved by Selenium Manager. The traceability test is parameterized for desktop and
mobile emulation.
