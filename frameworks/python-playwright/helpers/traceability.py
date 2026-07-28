"""Reads the traceability ID a test declares in its Allure title.

Every test is titled `[UI-CART-001] ...` or `[BOOK-TEST-UI-001] ...`, so the ID
printed in the catalog, in the report and in the exercise text is also the value
used to select a test on the command line.
"""

import re

TITLE_ID = re.compile(r"^\[([A-Z0-9-]+)\]")
BOOK_PREFIX = "BOOK-TEST"

# The public host is protected against automated traffic, so learners run one
# test, or a batch of at most three, per command.
MAX_PUBLIC_BATCH = 3


def declared_title(function: object) -> str:
    """`@allure.title` stores the reported name on the test function."""
    return getattr(function, "__allure_display_name__", "") or ""


def traceability_id(function: object) -> str | None:
    match = TITLE_ID.match(declared_title(function))
    return match.group(1) if match else None


def is_book_case(case_id: str | None) -> bool:
    return bool(case_id) and case_id.startswith(BOOK_PREFIX)


def parse_ids(raw: str) -> list[str]:
    return [value.strip().upper() for value in re.split(r"[,\s|]+", raw or "") if value.strip()]
