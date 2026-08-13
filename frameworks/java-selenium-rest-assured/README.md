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

The three `BOOK-TEST-*` classes are tagged with `book` instead, and run on their own with:

```bash
mvn test -Dgroups=book
```

Those three classes produce four executions: `BOOK-TEST-UI-001` is a `@ParameterizedTest` that runs
once on desktop and once on mobile emulation. Extended catalog plus Book scenarios is 77 executions.

Every case has its own `@DisplayName` traceability ID and Allure story.
