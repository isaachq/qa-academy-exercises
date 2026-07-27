# Chapter 5 Automation Frameworks

This directory contains four comparable automation projects for QA Academy Platform.

| Project | UI | API | Role |
|---|---|---|---|
| `python-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `typescript-playwright` | Playwright | Playwright APIRequestContext | Main framework |
| `java-selenium-rest-assured` | Selenium | REST Assured | Main framework |
| `typescript-cypress` | Cypress | `cy.request()` | Comparable demo |

Every project uses the same responsibility layers:

```text
tests/ui
tests/api
pages
services
fixtures
helpers
data
config
```

Every project implements the same three teaching scenarios:

1. Product purchase traceability on desktop and mobile web.
2. Reproducible Playground flakiness with a fixed seed.
3. Product REST CRUD with guaranteed cleanup.

All framework code, documentation, logs, test titles and Allure evidence are written in English.
Accounts are created manually. Copy each `.env.example` to `.env` and provide the existing account
values before running live tests.
