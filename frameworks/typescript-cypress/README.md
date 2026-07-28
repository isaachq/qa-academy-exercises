# TypeScript Cypress Framework

This framework uses Cypress for UI automation and `cy.request()` for API automation. It mirrors the
layers, test titles and Allure step catalog of the three main frameworks, and it now executes the
same catalog:

- three Book executions, plus the mobile run of the traceability scenario;
- 36 extended UI tests;
- 38 extended API executions.

## Setup

```bash
cp .env.example .env
npm ci
npm run verify
```

Provide an existing QA Academy account in `.env`. Registration is intentionally not automated.
`UI_PASSWORD` is used only by `UI-AUTH-001` and `API-AUTH-001`; the rest of the suite prepares an
authenticated browser from `API_KEY`.

## Public execution policy

The extended tests target an application hosted on Vercel with deployment and traffic protection.
Running the whole catalog trips that protection, and the platform starts answering
human-verification pages instead of the application, which makes every later assertion meaningless.

Public learners must therefore select extended tests by traceability ID, **one test, or a maximum
batch of three tests, per command**:

```bash
npx cypress run --spec tests/api/auth_health.spec.ts --env ids=API-AUTH-001
npx cypress run --spec tests/ui/cart_checkout_orders.spec.ts --env ids=UI-CART-001,UI-CART-002,UI-CART-003
```

Tests outside the selection are skipped, and a selection larger than three is rejected before the
first request. Running an extended spec **without** `--env ids=...` fails immediately with the
policy message instead of starting an unbounded run. Do not work around the limit by launching
consecutive batches as a substitute for a full-suite run.

`npm test`, `npm run test:api`, `npm run test:ui` and `npm run test:desktop` are full-catalog
commands and are reserved for internal maintainer validation.

The Book executions are exempt: they are a fixed, small batch and never use the internal bypass.

```bash
npm run test:book
npm run test:mobile
```

## Internal maintainer validation

Only maintainers may execute the complete extended catalogs. Internal validation reads
`VERCEL_AUTOMATION_BYPASS_SECRET` from an untracked local `.env` or from the CI secret store. When
present:

- `helpers/api_response.ts` adds `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie: true`
  to every API request;
- the overwritten `cy.visit` in `fixtures/support.ts` adds the same headers to every page load;
- each test primes the bypass cookie once, so the XHRs the application itself issues inherit it.

The bypass value must never be committed, copied into examples, or distributed with the public
exercises. Raw internal results and video directories may contain request metadata and must remain
private.

Maintainer-only full-catalog commands:

```bash
npm run test:api
npm run test:ui
```

Even with the bypass, run one spec file per Cypress invocation rather than the whole catalog in a
single run. Cypress restarts the browser between specs, which spaces the requests out enough that
the traffic protection keeps answering with the application instead of a `403` challenge page. The
CI job does exactly that. `UI-QUERY-004` issues several real queries plus a cooldown, so it is
worth running on its own.

In GitHub Actions, the extended Cypress steps run only when the repository secret
`VERCEL_AUTOMATION_BYPASS_SECRET` exists. Without it, the extended step is marked as skipped while
the Book executions continue to run.

## Reports

```bash
npm run report
npm run report:open
```

## Cypress-specific notes

These are the places where the Cypress implementation of a shared scenario had to differ from the
Playwright one. The assertions are the same; only the mechanism changes.

- **Spec bundling** uses an explicit webpack preprocessor declared in `cypress.config.ts`. The
  preprocessor Cypress ships by default resolves its Babel presets from the Cypress binary cache
  instead of this project, which fails with `Cannot find module '@babel/preset-typescript'`.
- **Cleanup lives in `afterEach`**, not at the end of the test: Cypress aborts the command queue on
  the first failure, so an in-test teardown would not run.
- **`helpers/report_error_guard.ts`** sanitizes `error.actual` and `error.expected` before the
  reporter serializes them. Without it, an error carrying an object graph that reuses the same
  subtree makes the reporter throw `RangeError: Invalid string length`, and that error replaces the
  real failure in the report. It is imported before `allure-cypress` in `fixtures/support.ts` so it
  registers its `fail` listener first.
- **`helpers/node_api_request.ts`** dispatches the `QUERY` verb from Cypress's Node process.
  `cy.request` rejects non-standard verbs before dispatch; `node:http` accepts valid extension
  methods. `helpers/api_response.ts` routes only those verbs through the task.
- **New tabs** (`UI-PLAY-005`): Cypress drives a single tab, so the control's `target` is removed and
  `window.open` is stubbed, covering both the anchor and the scripted variant.
- **Downloads** (`UI-PLAY-006`): Cypress writes downloads to `cypress/downloads` instead of raising a
  download event, so the spec reads the folder through a Node task.
- **Order pagination** (`UI-ORDER-003`): the eleven orders the page must paginate are stubbed with
  `cy.intercept`, exactly as the Playwright project stubs them with `page.route`.
  .
