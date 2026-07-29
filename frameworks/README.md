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

In addition, every project executes the complete extended catalog: 36 UI cases and 37 API cases (74 extended tests / 78 total in Playwright and Cypress; 77 extended tests / 81 total in Java due to JUnit 5 test method granularity for deterministic Selenium browser tests without network interception mocks).

## Public Execution Policy

> [!NOTE]
> **Public Execution Policy:**
> - The **4 Book Scenarios** can always be executed together cleanly without restrictions.
> - Running all **73 extended scenarios** in a public/hosted environment simultaneously will trigger hosted traffic protection challenges, causing requests to fail or be throttled, creating a **false perception that tests are flaky**.
> - Public learners executing against hosted environments must run extended tests **1 test at a time** (or a maximum batch of 1–3 tests by ID).

## Credentials Security

No real credentials are checked in or stored in repository files. Accounts are created manually or managed via GitHub Actions secrets. Copy `.env.example` to `.env` and supply `BASE_URL`, `API_KEY`, `UI_EMAIL`, and `UI_PASSWORD` locally before running live tests.

## Shared Report Steps

The four projects use the same test titles and Allure step names declared in each project's `helpers` layer (`helpers/steps.py`, `helpers/steps.ts`, `helpers/Steps.java`). The step catalog is documented in [`docs/ch5_allure_step_catalog.md`](../docs/ch5_allure_step_catalog.md).

## GitHub Actions Live Execution

The workflow compiles and runs all four projects sequentially (`max-parallel: 1`):

1. Secrets (`QA_ACADEMY_API_KEY`, `QA_ACADEMY_UI_EMAIL`, `QA_ACADEMY_UI_PASSWORD`) are injected via GitHub Actions secrets.
2. Push or update a pull request, or open **Actions → Frameworks CI → Run workflow**.
3. Open the run summary to download the Allure report artifact.
