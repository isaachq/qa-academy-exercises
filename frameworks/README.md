# Chapter 5 Automation Frameworks

This directory contains four comparable automation projects for QA Academy Platform.

| Project | UI | API | Role |
|---|---|---|---|
| `python-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `typescript-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `java-selenium-rest-assured` | Selenium | REST Assured | Main framework |
| `typescript-cypress` | Cypress | `cy.request()` | Comparable demo |

Every project uses the same 8 responsibility layers:

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

See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for full architectural documentation and Mermaid diagrams.

Every project implements the core teaching scenarios (Book tests):

1. `BOOK-TEST-UI-001` — Product purchase traceability on desktop web.
2. `BOOK-TEST-UI-001-MOBILE` — Product purchase traceability on mobile web.
3. `BOOK-TEST-UI-002` — Reproducible Playground flakiness with a fixed seed.
4. `BOOK-TEST-API-001` — Product REST CRUD with guaranteed cleanup.

In addition, every project executes the complete extended catalog: 36 UI cases and 37 API cases.

## Shared Report Steps

The four projects use the same test titles and the same Allure step names, declared in each project's `helpers` layer (`helpers/steps.py`, `helpers/steps.ts`, `helpers/Steps.java`). Every navigation, action, and assertion is reported as its own step, and page objects and services emit nested steps so a failed run points at the exact step that failed instead of collapsing the scenario into a single block.

The catalog and the rules for changing it are documented in [`docs/ch5_allure_step_catalog.md`](../docs/ch5_allure_step_catalog.md).

All framework code, documentation, logs, test titles, and Allure evidence are written in English. Accounts are created manually. Copy each `.env.example` to `.env` and provide the existing account values before running live tests. `UI_PASSWORD` is used only by the dedicated valid-login cases; the rest of the UI suite prepares authenticated state from `API_KEY`.

## GitHub Actions Live Execution

The workflow compiles, verifies, and runs all four projects sequentially (`max-parallel: 1`):

1. Add `QA_ACADEMY_API_KEY`, `QA_ACADEMY_UI_EMAIL` and `QA_ACADEMY_UI_PASSWORD` as repository Actions secrets.
2. Push or update a same-repository pull request, or open **Actions → Frameworks CI → Run workflow**.
3. Open the run summary to download the generated self-contained Allure HTML report or its raw results.
4. Extract the report artifact and open `index.html` directly; no local web server is required.

All four frameworks execute sequentially so they cannot compete for the same cart, stock, or orders.
