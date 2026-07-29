# Java Selenium and REST Assured Framework

This main framework uses JUnit 5, Selenium and REST Assured while retaining the same responsibility
layers and scenarios as the Playwright projects.

## Setup and run

```bash
export BASE_URL=https://qaacademyabc.xyz
export API_KEY=replace-me
export UI_EMAIL=replace-me@example.com
export UI_PASSWORD=replace-me
export DEVICE_PROFILE=desktop
mvn test
allure generate --single-file target/allure-results --clean -o allure-report
```

Chrome is resolved by Selenium Manager. The traceability test is parameterized for desktop and
mobile emulation.

The extended catalog is made up of 73 individually selectable JUnit tests (36 UI and 37 API),
tagged with `extended`. Run only that catalog with:

```bash
mvn test -Dgroups=extended
```

Every case has its own `@DisplayName` traceability ID and Allure story. The three `BOOK-TEST-*`
classes remain separate and unchanged.
