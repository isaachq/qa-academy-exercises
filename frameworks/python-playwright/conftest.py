import os
import warnings

import pytest

from config.environment import environment
from helpers.traceability import (
    MAX_PUBLIC_BATCH,
    is_book_case,
    parse_ids,
    traceability_id,
)

pytest_plugins = ["fixtures.conftest"]


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--ids",
        action="store",
        default=os.getenv("TEST_IDS", ""),
        help=(
            "Traceability IDs to run, for example --ids=API-AUTH-001,UI-CART-001. "
            "Public learners select one test, or a batch of at most three, per command."
        ),
    )


def pytest_collection_modifyitems(
    config: pytest.Config, items: list[pytest.Item]
) -> None:
    """Selects tests by the traceability ID printed in the catalog and the report."""
    requested = parse_ids(config.getoption("--ids"))

    if requested:
        selected, deselected = [], []
        for item in items:
            case_id = traceability_id(item.function)
            (selected if case_id in requested else deselected).append(item)
        if deselected:
            config.hook.pytest_deselected(items=deselected)
            items[:] = selected
        found = {traceability_id(item.function) for item in selected}
        unknown = [case for case in requested if case not in found]
        if unknown:
            raise pytest.UsageError(f"Unknown traceability IDs: {', '.join(unknown)}")

    extended = [
        item for item in items if not is_book_case(traceability_id(item.function))
    ]
    if len(extended) > MAX_PUBLIC_BATCH and not environment.has_automation_bypass:
        warnings.warn(
            f"Public execution policy: {len(extended)} extended tests were selected. "
            f"The public host is protected against automated traffic, so learners run at "
            f"most {MAX_PUBLIC_BATCH} extended tests per command, for example "
            f"`pytest --ids=API-AUTH-001`. Complete catalog runs are reserved for "
            f"maintainer validation with VERCEL_AUTOMATION_BYPASS_SECRET configured.",
            stacklevel=1,
        )
