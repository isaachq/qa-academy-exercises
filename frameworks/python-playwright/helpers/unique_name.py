from __future__ import annotations

import secrets
import time


def unique_product_name(prefix: str = "") -> str:
    sub = f"-{prefix}" if prefix else ""
    return f"e2e-python-playwright{sub}-{time.time_ns()}-{secrets.token_hex(3)}"
