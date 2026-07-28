# QA Academy Exercises

Companion exercises and automation examples for QA Academy Platform.

## Repository areas

- [`docs/`](docs/) contains the Chapter 5 planning, scenario catalog, the shared Allure step
  catalog and editorial guidance.
- [`frameworks/`](frameworks/) contains four comparable, executable automation projects.

The framework implementations combine the teaching scope in this repository with the current
[platform selector and API contracts](https://github.com/isaachq/qa-academy-platform/tree/main/docs).
The directory name `frameworks` is preserved as requested for this edition.

## Hosted test execution

The extended public tests target a Vercel-hosted environment with traffic protection. Public users
must run one test, or a maximum batch of three tests, by traceability ID. Complete extended suites
are reserved for internal maintainer validation. See the
[TypeScript Playwright execution policy](frameworks/typescript-playwright/README.md#public-execution-policy).
