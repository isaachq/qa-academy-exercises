# QA Academy Exercises

Companion exercises and automation examples for QA Academy Platform (`https://qaacademyabc.xyz`).

## Repository Structure

- [`docs/`](docs/) — Architecture guidelines ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)), Allure step catalog ([docs/ch5_allure_step_catalog.md](docs/ch5_allure_step_catalog.md)), and complete UI/API test catalog ([docs/ch5_ui_api_test_catalog.md](docs/ch5_ui_api_test_catalog.md)).
- [`frameworks/`](frameworks/) — Four comparable, executable automation projects (`python-playwright`, `typescript-playwright`, `java-selenium-rest-assured`, `typescript-cypress`).

## Framework Architecture

All four framework projects implement an identical 8-layer architecture:
`tests/ui`, `tests/api`, `pages`, `services`, `fixtures`, `helpers`, `data`, `config`.

For a full technical overview and Mermaid architecture diagram, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Sequential Execution in CI

GitHub Actions executes the four frameworks sequentially (`max-parallel: 1`) to ensure data isolation without resource contention.
