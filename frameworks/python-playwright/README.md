# Python Playwright Framework

This main framework uses pytest, Playwright and requests for UI and REST API automation. It
executes the same catalog as the TypeScript projects:

- three Book scenarios, plus the mobile run of the traceability scenario;
- 36 extended UI tests;
- 38 extended API executions (37 traceability IDs; `API-AUTH-004` runs twice).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
```

Provide an existing QA Academy account in `.env`. Registration is intentionally not automated.
`UI_PASSWORD` is used only by `UI-AUTH-001` and `API-AUTH-001`; the rest of the suite prepares an
authenticated browser from `API_KEY`.

## Public execution policy

The extended tests target an application hosted on Vercel with deployment and traffic protection.
Public learners must run **one test, or a maximum batch of three tests, per command**, selected by
traceability ID. Do not run the complete extended catalog, `pytest`, or `pytest -m extended`
against the public host, and do not work around the limit by launching consecutive batches as a
substitute for a full-suite run.

```bash
pytest --ids=API-AUTH-001
pytest --ids=UI-CART-001,UI-CART-002,UI-CART-003
```

`--ids` reads the traceability ID from each test's Allure title, so a case is selected without
knowing its file. An unknown ID fails before the first request, and a selection larger than three
without the maintainer bypass reports the policy as a warning. `TEST_IDS` in `.env` provides a
default selection.

The Book scenarios are exempt: they are a fixed, small batch and never use the internal bypass.

```bash
pytest tests/api/test_product_crud.py tests/ui/test_playground_flaky.py \
       tests/ui/test_product_purchase_traceability.py
```

## Internal maintainer validation

Only maintainers may execute the complete extended catalog. Internal validation reads
`VERCEL_AUTOMATION_BYPASS_SECRET` from an untracked local `.env` or from the CI secret store. When
present, `config/environment.py` adds `x-vercel-protection-bypass` and
`x-vercel-set-bypass-cookie: true` to every API request and to every browser context, so the XHRs
the application itself issues inherit the bypass.

The bypass value must never be committed, copied into examples, or distributed with the public
exercises. Raw internal Allure results may contain request metadata and must remain private.

```bash
pytest -m extended     # maintainers only
pytest -m "extended and api"
```

In GitHub Actions the extended step runs only when the repository secret
`VERCEL_AUTOMATION_BYPASS_SECRET` exists. Without it the step is reported as skipped while the Book
scenarios continue to run.

## Reports

```bash
allure generate --single-file allure-results --clean -o allure-report
allure open allure-report
```

## Python-specific notes

These are the places where the Python implementation of a shared scenario differs from the
TypeScript one. The assertions are the same; only the mechanism changes.

- **`helpers/api_response.py`** is the port of `helpers/api_response.ts`. `guarded_api` paces a
  request, retries only application throttling with the published `Retry-After`, attaches the
  incident ID and fails with an infrastructure message when `X-QA-Guard-Rule` is missing, so a
  challenge page is never mistaken for a contract failure.
- **`services/api_client.py`** dispatches the extended API catalog, including the native `QUERY`
  verb, which `requests` forwards as any other extension method.
- **Book services keep their own transport.** `services/product_service.py` paces, retries and
  annotates through `observed_api`, but does not assert the platform trace headers, so the Book
  scenarios keep the exact behavior they had before the extended catalog existed.
- **Native dialogs** (`UI-CART-003`, `UI-CART-004`) are handled with `page.once("dialog", ...)`.
  Playwright dismisses a dialog automatically when no handler is registered, and `expect_event`
  would deadlock the click that opened it.
- **Order pagination** (`UI-ORDER-003`) stubs the eleven orders the page must paginate with
  `page.route`, exactly as the Playwright project does.
- **`DEVICE_PROFILE=mobile`** runs the whole UI catalog on a Pixel 7 profile without duplicating a
  scenario. The three `UI-MOBILE-*` cases always assert the reference 390x844 viewport.

The traceability test is parameterized for desktop and mobile without duplicating the scenario.
