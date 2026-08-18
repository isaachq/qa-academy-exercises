# QA Academy Exercises

[![tests](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml)

[Allure report](https://isaachq.github.io/qa-academy-exercises/) for the `integration/` suite, published on every run.

Companion repository for the book **Zero to SDET**, built on top of **QA Academy Platform**
(<https://qaacademyabc.xyz>).

Every exercise, framework and pipeline printed in the book lives here in its finished form.
The book builds them from scratch, file by file; this repository is what they look like when
they are done. Typing them yourself is still the exercise — this is the answer key, not a
substitute for it.

The platform is a real web application with a real database, deployed on a real host with
real traffic protection. Nothing here runs against a mock.

---

## Two editions, one repository

The book ships in two editions and this repository serves both.

| Edition | Exercise folder |
|---|---|
| **English** — *Zero to SDET: Real code, sound judgment, AI as an ally* | [`exercises/en/`](exercises/en/) |
| **Español** — *Zero to SDET: De Cero a Ingeniero de Automatización* | [`exercises/es/`](exercises/es/) |

The two exercise trees hold the same files. They are kept separate so that the
page numbers and folder paths printed in each edition resolve exactly as
printed. `frameworks/`, `integration/` and `docs/` are shared: that code was
written in English from the start and is identical for both editions.

---

## Where the book meets the repository

| Chapter | English folder | Español folder | What you will find |
|---|---|---|---|
| 1 — Python | [`exercises/en/chapter-1/`](exercises/en/chapter-1/) | [`exercises/es/chapter-1/`](exercises/es/chapter-1/) | The practice file, assembled |
| 2 — Java | [`exercises/en/chapter-2/`](exercises/en/chapter-2/) | [`exercises/es/chapter-2/`](exercises/es/chapter-2/) | The practice file, assembled |
| 5 — UI and API hands-on | [`frameworks/`](frameworks/) | [`frameworks/`](frameworks/) | Four comparable automation projects |
| 6 — PostgreSQL | [`exercises/en/chapter-6/`](exercises/en/chapter-6/) | [`exercises/es/chapter-6/`](exercises/es/chapter-6/es/) | `academy_shop_schema.sql` and `academy_shop_seed.sql` |
| 8 — Algorithmic complexity | [`exercises/en/chapter-8/`](exercises/en/chapter-8/) | [`exercises/es/chapter-8/`](exercises/es/chapter-8/) | 44 runnable Python files, standard library only |
| 9 — CI with GitHub Actions | [`integration/`](integration/) | [`integration/`](integration/) | The page explorer and its pipeline |

Supporting documentation lives in [`docs/`](docs/): the [architecture guide](docs/ARCHITECTURE.md)
with its Mermaid diagram, the [Allure step catalog](docs/ch5_allure_step_catalog.md), the
[full UI and API test catalog](docs/ch5_ui_api_test_catalog.md), and the
[API automation rules](docs/API_AUTOMATION_RULES.md) that govern testing against a protected host.

---

## Chapter 5 — Four frameworks, one catalog

| Project | UI | API | Runner |
|---|---|---|---|
| [`python-playwright`](frameworks/python-playwright/) | Playwright | Playwright `APIRequestContext` | pytest |
| [`typescript-playwright`](frameworks/typescript-playwright/) | Playwright | Playwright `request` | Playwright Test |
| [`java-selenium-rest-assured`](frameworks/java-selenium-rest-assured/) | Selenium WebDriver | REST Assured | JUnit 5 |
| [`typescript-cypress`](frameworks/typescript-cypress/) | Cypress | `cy.request()` | Cypress |

The four projects share the same 8 responsibility layers — `tests/ui`, `tests/api`, `pages`,
`services`, `fixtures`, `helpers`, `data`, `config` — and run the same catalog:

- **73 extended scenarios**: 36 UI and 37 API. The same 73 traceability IDs exist in all four projects.
- **4 Book executions** from 3 scenarios: `BOOK-TEST-UI-001` runs once on desktop and once on a
  Pixel 7 profile, plus `BOOK-TEST-UI-002` and `BOOK-TEST-API-001`.
- **77 executions per framework.**

Syntax and runner logic adapt to each language. Preconditions, assertions and teardown cleanup
do not. Where a scenario cannot be expressed identically, the difference is documented rather
than hidden — see the `UI-QUERY-004` note in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Public execution policy

> [!IMPORTANT]
> QA Academy Platform is a public host with anti-bot rules and rate limiting. The protection
> is what keeps the environment available for every reader.
>
> - The **4 Book executions** can always be run together, with no restrictions.
> - Running the **73 extended scenarios** in one go against the hosted platform trips that
>   protection. The failures look like flaky tests and are not: it is the platform defending
>   itself, not your code breaking.
> - Against a hosted environment, run extended tests **one at a time**, or in batches of two
>   or three selected by traceability ID.

Selecting by ID, per project:

```bash
# Python
pytest --ids=API-AUTH-001

# TypeScript with Playwright
npx playwright test --project=api --grep "API-AUTH-001"

# Cypress
npx cypress run --spec tests/api/cart.spec.ts --env ids=API-CART-001

# Java
mvn test -Dtest=AuthHealthTest#api_auth_001_validLogin
```

In Java the whole extended catalog is tagged `extended` and the Book scenarios `book`, so
`mvn test -Dgroups=book` runs the four Book executions on their own.

---

## Chapter 9 — The pipeline

[`integration/`](integration/) holds a small Playwright suite that explores Wikipedia article
pages. It exists to be run by CI, not to teach Playwright: the point is what happens when your
code runs on a machine that is not yours.

It runs on GitHub Actions across Chromium, Firefox and WebKit in parallel, uploads failure
evidence, and publishes an Allure report with history to GitHub Pages. The two workflows are
[`tests.yml`](.github/workflows/tests.yml) and [`report.yml`](.github/workflows/report.yml).
[`integration/chapter-steps/`](integration/chapter-steps/) keeps the intermediate versions of
the pipeline that the chapter builds step by step, so each one can be read whole.

---

## Getting started

Each project is self-contained and documents its own setup:

- [`frameworks/README.md`](frameworks/README.md) — the four Chapter 5 projects
- [`integration/README.md`](integration/README.md) — the Chapter 9 suite
- [`exercises/en/chapter-8/README.md`](exercises/en/chapter-8/README.md) — the Chapter 8 files (English edition)
- [`exercises/es/chapter-8/README.md`](exercises/es/chapter-8/README.md) — the Chapter 8 files (edición en español)

Live tests need credentials. Copy the project's `.env.example` to `.env` and fill in `BASE_URL`,
`API_KEY`, `UI_EMAIL` and `UI_PASSWORD`. No real credentials are committed anywhere in this
repository; in CI they come from GitHub Actions secrets.

---

## A note on the code

All code, test names, comments, step labels and configuration in `frameworks/` and
`integration/` are written in English, and are shared by both editions.

The exercise files themselves — variable names, function names, SQL identifiers — are in
English in both trees, because that is how the book teaches them. What differs between
`exercises/en/` and `exercises/es/` is the prose around the code: file headers, chapter
READMEs and explanatory comments follow the language of the edition you are reading.
