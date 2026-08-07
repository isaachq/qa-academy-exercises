# QA Academy Exercises

[![tests](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml)

[Allure report](https://isaachq.github.io/qa-academy-exercises/) for the `integration/` suite, published on every run.

Companion exercises and automation examples for QA Academy Platform (`https://qaacademyabc.xyz`).

## Repository Structure

- [`docs/`](docs/) — Architecture guidelines ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)), Allure step catalog ([docs/ch5_allure_step_catalog.md](docs/ch5_allure_step_catalog.md)), and complete UI/API test catalog ([docs/ch5_ui_api_test_catalog.md](docs/ch5_ui_api_test_catalog.md)).
- [`frameworks/`](frameworks/) — Four comparable, executable automation projects (`python-playwright`, `typescript-playwright`, `java-selenium-rest-assured`, `typescript-cypress`).
- [`integration/`](integration/) — Chapter 9 suite: a Playwright page explorer that runs on GitHub Actions in Chromium, Firefox and WebKit, and publishes an Allure report to GitHub Pages.

## Framework Architecture & Public Execution Policy

All four framework projects implement an identical 8-layer architecture (`tests/ui`, `tests/api`, `pages`, `services`, `fixtures`, `helpers`, `data`, `config`).

> [!NOTE]
> **Public Execution Policy:**
> - The **4 Book Scenarios** can always be executed together cleanly without restrictions.
> - Running all **73 extended scenarios** in hosted environments simultaneously will trigger hosted traffic protection and rate-limiting, which creates a **false perception of flaky tests**.
> - Public learners executing against hosted environments must run extended tests **1 test at a time** (or small batches of 1–3 tests filtered by Test ID).

For a full technical overview and Mermaid architecture diagram, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
