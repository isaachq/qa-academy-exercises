# TypeScript Playwright Framework

This main framework uses Playwright Test for UI and API automation.

## Setup

```bash
cp .env.example .env
npm ci
npx playwright install chromium
```

Provide an existing QA Academy account in `.env`. Registration is intentionally not automated.

## Run

```bash
npm test
npm run test:desktop
npm run test:mobile
npm run report
```

The traceability spec runs in desktop and mobile projects without duplicating the test. All tests
use stable `data-testid` selectors, redact secrets from evidence and clean mutable data in `finally`.
