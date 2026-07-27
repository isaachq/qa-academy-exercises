import secrets
import time


def unique_product_name() -> str:
    return f"e2e-python-playwright-{time.time_ns()}-{secrets.token_hex(3)}"
