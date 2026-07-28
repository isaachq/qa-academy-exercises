# Chapter 5: Framework Strategy and Architectural Plan

> Master strategy document for the four automation projects in `qa-academy-exercises`.
> Target Platform: `https://qaacademyabc.xyz`

## 1. Chapter Purpose

This repository houses four comparable end-to-end automation frameworks built against the QA Academy Platform:
1. `python-playwright`
2. `typescript-playwright`
3. `java-selenium-rest-assured`
4. `typescript-cypress`

The primary objective is to demonstrate modular, scalable multi-layer test automation architecture across popular modern stacks while maintaining 100% functional, assertion, and reporting parity.

## 2. Common Architectural Design

Every framework implements the same **8 Responsibility Layers**:

```text
tests/ui/     -> UI test scenarios (desktop & mobile emulation)
tests/api/    -> API test scenarios (REST, GraphQL, HTTP QUERY)
pages/        -> Page Object Model (encapsulates UI selectors and element actions)
services/     -> Service Objects (encapsulates REST/GraphQL client calls and DTOs)
fixtures/     -> Lifecycle management (authentication, browser context, setup/teardown)
helpers/      -> Utility functions (step reporting, unique data generators, incident loggers)
data/         -> Test data builders and static constants
config/       -> Environment settings, URLs, timeout values, and execution flags
```

## 3. Technology Stack Breakdown

| Language / Stack | UI Automation | API Automation | Test Runner | Reporting |
|---|---|---|---|---|
| **Python** | Playwright | Playwright `APIRequestContext` | `pytest` | `allure-pytest` |
| **TypeScript (Playwright)** | Playwright | Playwright `APIRequestContext` | `@playwright/test` | `allure-playwright` |
| **Java** | Selenium WebDriver | REST Assured | JUnit 5 / Maven | `allure-junit5` |
| **TypeScript (Cypress)** | Cypress | `cy.request()` | Cypress Runner | `allure-cypress` |

## 4. Key Automation Standards

### Authentication
- REST and GraphQL requests supply `Authorization: Bearer <API_KEY>`.
- UI tests skip manual form login (except dedicated auth tests) and inject pre-authenticated credentials directly into `localStorage`:
  - `localStorage.api_token`
  - `localStorage.user_email`
  - `localStorage['qa-academy-terms-consent-v1'] = 'accepted'`

### Data Isolation & Cleanup
- Every mutable test entity (products, orders, cart items) is created with a unique timestamped name: `e2e-<framework>-<timestamp>-<uuid>`.
- Teardown blocks (`finally` in TS/Python/Java, `afterEach` in Cypress) execute cleanup calls to delete created entities regardless of test pass/fail state.

### Reporting Consistency
- All four frameworks use Allure step reporting (`allure.step`).
- Test titles and step labels are strictly identical across frameworks.
- Secrets (`API_KEY`, `UI_PASSWORD`) are sanitized from all report attachments.
