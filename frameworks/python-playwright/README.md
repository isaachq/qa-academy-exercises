# Python Playwright Framework

This main framework uses pytest, Playwright and requests for UI and REST API automation.

## Setup and run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
pytest
allure generate allure-results --clean -o allure-report
```

The traceability test is parameterized for desktop and mobile without duplicating the scenario.
