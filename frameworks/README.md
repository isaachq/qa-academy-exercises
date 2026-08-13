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
2. `BOOK-TEST-UI-001` on mobile — the same scenario and the same ID, run again on a Pixel 7 profile.
3. `BOOK-TEST-UI-002` — Reproducible Playground flakiness with a fixed seed.
4. `BOOK-TEST-API-001` — Product REST CRUD with guaranteed cleanup.

Three scenarios, four executions. Each project wires the mobile run differently: a `mobile-chromium` project in Playwright, the `test:mobile` script in Cypress, `@pytest.mark.parametrize` in Python, and `@ParameterizedTest` in Java.

In addition, every project executes the complete extended catalog: 36 UI cases and 37 API cases, so 73 extended plus 4 Book executions is **77 executions per framework**. The 73 traceability IDs are the same in all four projects.

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
