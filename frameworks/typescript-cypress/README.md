# TypeScript Cypress Framework

This demonstration framework mirrors the same layers and teaching scenarios as the three main
frameworks. It is included for direct architectural comparison.

## Setup and run

```bash
cp .env.example .env
npm ci
npm test
npm run test:mobile
npm run report
```

Provide an existing QA Academy account. Registration is intentionally outside the framework.

## Reporting notes

- Spec bundling uses an explicit webpack preprocessor declared in `cypress.config.ts`. The
  preprocessor Cypress ships by default resolves its Babel presets from the Cypress binary
  cache instead of this project, which fails with
  `Cannot find module '@babel/preset-typescript'`.
- `helpers/report_error_guard.ts` sanitizes `error.actual` and `error.expected` before the
  reporter serializes them. Without it, an error carrying an object graph that reuses the
  same subtree makes the reporter throw `RangeError: Invalid string length`, and that error
  replaces the real failure in the report. It is imported before `allure-cypress` in
  `fixtures/support.ts` so it registers its `fail` listener first.
- Cleanup lives in `afterEach`, not in a step at the end of the test: Cypress aborts the
  command queue on the first failure, so an in-test teardown would not run.
