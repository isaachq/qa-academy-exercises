# TypeScript Playwright Framework

This framework uses Playwright Test for UI and API automation. It contains:

- four Book executions intended to run together;
- 36 extended UI tests;
- 39 executions in the complete API command: 38 extended executions and one Book API execution.

## Setup

```bash
cp .env.example .env
npm ci
npx playwright install chromium
```

Provide an existing QA Academy account in `.env`. Registration is intentionally not automated.

## Public execution policy

The public extended tests target an application hosted on Vercel with deployment and traffic
protection. Public learners must run only one test, or a maximum batch of three tests, per command.
Do not run the complete 36-test UI catalog, the complete 39-execution API command, `npm test`,
`npm run test:api`, or `npm run test:desktop` against the public host. Do not work around this
limit by launching consecutive batches as a substitute for a full-suite run.

Run one extended test by its traceability ID:

```bash
npx playwright test --project=api --grep "API-AUTH-001"
```

Run no more than three extended tests in one command:

```bash
npx playwright test --project=desktop-chromium --grep "UI-CART-001|UI-CART-002|UI-CART-003"
```

The four Book executions may always run together:

```bash
npm run test:book
```


## Reports

```bash
npm run report
npm run report:open
```

The traceability spec runs in desktop and mobile projects without duplicating the test. All tests
use stable `data-testid` selectors, avoid exposing secrets in assertions and log messages, and
clean mutable data in `finally`.
