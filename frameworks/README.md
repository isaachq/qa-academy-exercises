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

1. `BOOK-TEST-UI-001` — Product purchase traceability on desktop and mobile web.
2. `BOOK-TEST-UI-002` — Reproducible Playground flakiness with a fixed seed.
3. `BOOK-TEST-API-001` — Product REST CRUD with guaranteed cleanup.

In addition, every project now executes the complete extended Chapter 5 catalog: 36 pending UI
cases and 37 pending API cases. `typescript-playwright` and `typescript-cypress` implement that
catalog as real, runnable tests with one test per traceability ID, so the same contracts can be
compared assertion by assertion in both runners.

## Shared report steps

The four projects use the same test titles and the same Allure step names, declared in each
project's `helpers` layer (`helpers/steps.py`, `helpers/steps.ts`, `helpers/Steps.java`).
Every navigation, action and assertion is reported as its own step, and page objects and
services emit nested steps, so a failed run points at the exact step that failed instead of
collapsing the scenario into a single block.

The catalog and the rules for changing it are in
[`docs/cap5_CATALOGO_pasos_allure.md`](../docs/cap5_CATALOGO_pasos_allure.md).
`npm run validate:frameworks` fails when a project stops declaring any catalog entry.

All framework code, documentation, logs, test titles and Allure evidence are written in English.
Accounts are created manually. Copy each `.env.example` to `.env` and provide the existing account
values before running live tests. `UI_PASSWORD` is used only by the dedicated valid-login cases;
the rest of the UI suite prepares authenticated state from `API_KEY`.

## GitHub Actions live execution

The pull request workflow always compiles and collects all four projects. For branches in this
repository, all four frameworks run their real UI and API scenarios automatically.
Secrets are not exposed to pull requests from forks. A manual rerun remains available:

1. Add `QA_ACADEMY_API_KEY`, `QA_ACADEMY_UI_EMAIL` and `QA_ACADEMY_UI_PASSWORD` as repository
   Actions secrets.
2. Push or update a same-repository pull request, or open **Actions → Frameworks CI → Run workflow**.
3. For a manual run, select the framework branch and start it.
4. Open the run summary to download the generated self-contained Allure HTML report or its raw results.
5. Extract the report artifact and open `index.html` directly; no local web server is required.

All four frameworks execute sequentially so they cannot compete for the same cart, stock or orders.
Cypress runs the desktop suite plus the mobile traceability scenario, and its extended specs run
one spec per Cypress invocation to keep the request rate under the hosted traffic protection.

## Public execution policy

The extended catalog targets a Vercel-hosted environment with deployment and traffic protection.
Public learners must run one test, or a maximum batch of three tests, per command, selected by
traceability ID. Complete extended suites are reserved for internal maintainer validation with
`VERCEL_AUTOMATION_BYPASS_SECRET`. See the
[Playwright](typescript-playwright/README.md#public-execution-policy) and
[Cypress](typescript-cypress/README.md#public-execution-policy) execution policies.
