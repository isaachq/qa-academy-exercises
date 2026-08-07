# integration

[![tests](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/isaachq/qa-academy-exercises/actions/workflows/tests.yml)

Wikipedia page explorer built for Chapter 9 of Zero to SDET.

It searches a word on Wikipedia, takes the first three results, opens each one and
checks that it loads.

The [Allure report](https://isaachq.github.io/qa-academy-exercises/) is published on
every run of the pipeline.

## Requirements

- Node.js 22 or newer
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

## Pipeline

The workflows live at the repository root, in `.github/workflows/`, because GitHub
only reads that path. They use `working-directory: integration` for every `run` step.

| Workflow | Trigger | What it does |
|---|---|---|
| `tests.yml` | push and pull request to `main` | Runs the suite in Chromium, Firefox and WebKit in parallel |
| `report.yml` | when `tests` completes | Builds the Allure report and publishes it to GitHub Pages |
