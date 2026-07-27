# Chapter 5 Automation Frameworks

This directory contains four comparable automation projects for QA Academy Platform.

| Project | UI | API | Role |
|---|---|---|---|
| `python-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `typescript-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `java-selenium-rest-assured` | Selenium | REST Assured | Main framework |
| `typescript-cypress` | Cypress | `cy.request()` | Comparable demo |

Every project uses the same responsibility layers:

```text
tests/ui
tests/api
pages
services
fixtures
helpers
data
config
```

Every project implements the same three teaching scenarios:

1. Product purchase traceability on desktop and mobile web.
2. Reproducible Playground flakiness with a fixed seed.
3. Product REST CRUD with guaranteed cleanup.

All framework code, documentation, logs, test titles and Allure evidence are written in English.
Accounts are created manually. Copy each `.env.example` to `.env` and provide the existing account
values before running live tests.

## GitHub Actions live execution

The pull request workflow always compiles and collects all four projects. For branches in this
repository, all four frameworks run their real UI and API scenarios automatically.
Secrets are not exposed to pull requests from forks. A manual rerun remains available:

1. Add `QA_ACADEMY_API_KEY` and `QA_ACADEMY_UI_EMAIL` as repository Actions secrets.
2. Push or update a same-repository pull request, or open **Actions → Frameworks CI → Run workflow**.
3. For a manual run, select the framework branch and start it.
4. Open the run summary to download the generated self-contained Allure HTML report or its raw results.
5. Extract the report artifact and open `index.html` directly; no local web server is required.

All four frameworks execute sequentially so they cannot compete for the same cart, stock or orders.
Cypress runs the desktop suite plus the mobile traceability scenario.
