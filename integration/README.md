# actions-framework

Wikipedia page explorer built for Chapter 9 of Zero to SDET.

It searches a word on Wikipedia, takes the first three results, opens each one and
checks that it loads.

## Requirements

- Node.js 20 or newer
- Java 17 or newer (only for the Allure report)

## Install

    npm install
    npx playwright install chromium

## Run

    npx playwright test --project=chromium

Force a specific search term so a failed run can be reproduced:

    SEARCH_TERM=basalt npx playwright test --project=chromium

On Windows:

    set SEARCH_TERM=basalt
    npx playwright test --project=chromium

## Environment variables

| Name | Default | Meaning |
|---|---|---|
| `SEARCH_TERM` | random from the list | Word to search on Wikipedia |
| `BASE_URL` | `https://en.wikipedia.org` | Site under test |
| `RESULTS_TO_VISIT` | `3` | How many results to open |
| `LOAD_TIME_THRESHOLD_MS` | `4000` | Soft threshold for the load time warning |

## Report

    npx allure generate allure-results --clean -o allure-report
    npx allure open allure-report
