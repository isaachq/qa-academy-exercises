# QA Academy Exercises

Companion exercises and automation examples for QA Academy Platform (`https://qaacademyabc.xyz`).

## Repository Structure

- [`docs/`](docs/) — Architecture guidelines ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)), Allure step catalog ([docs/ch5_allure_step_catalog.md](docs/ch5_allure_step_catalog.md)), and complete UI/API test catalog ([docs/ch5_ui_api_test_catalog.md](docs/ch5_ui_api_test_catalog.md)).
- [`frameworks/`](frameworks/) — Four comparable, executable automation projects (`python-playwright`, `typescript-playwright`, `java-selenium-rest-assured`, `typescript-cypress`).

## Framework Architecture & Modular Bypass

All four framework projects implement an identical 8-layer architecture (`tests/ui`, `tests/api`, `pages`, `services`, `fixtures`, `helpers`, `data`, `config`).

The Vercel automation bypass headers (`x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie`) are handled **modularly**: they are dynamically injected when `VERCEL_AUTOMATION_BYPASS_SECRET` is set, and omitted when it is not.

> [!WARNING]
> **Public Execution Policy & Flakiness Awareness:**
> - The **4 Book Scenarios** can always be executed together without bypass headers.
> - Running all **73 extended scenarios** in hosted environments without `VERCEL_AUTOMATION_BYPASS_SECRET` triggers hosted traffic protection, creating a **false perception of flaky tests**.
> - Public users without the bypass secret must run extended tests **1 test at a time** (or max batch of 1-3 tests by ID). Full extended suite runs require `VERCEL_AUTOMATION_BYPASS_SECRET`.

For a full technical overview and Mermaid architecture diagram, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
