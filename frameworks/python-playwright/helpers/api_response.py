"""Traffic policy and response contract shared with the TypeScript frameworks.

Mirrors `helpers/api_response.ts`: every extended API request is paced, retried
only when the application itself throttles, annotated with its incident ID and
checked for the trace headers the platform promises on every `/api/*` response.
"""

import json
import os
import time
from typing import Any, Callable

import allure
import requests

GUARD_RULE_HEADER = "x-qa-guard-rule"
INCIDENT_HEADER = "x-qa-incident-id"

Send = Callable[[], requests.Response]

_last_request_started_at = 0.0


def _pacing_seconds() -> float:
    try:
        configured = float(os.getenv("API_REQUEST_PACING_MS", "0"))
    except ValueError:
        return 0.0
    return min(max(configured, 0.0), 5_000.0) / 1_000.0


def _send_with_optional_pacing(send: Send) -> requests.Response:
    global _last_request_started_at
    pacing = _pacing_seconds()
    if pacing > 0:
        wait = max(0.0, _last_request_started_at + pacing - time.monotonic())
        if wait > 0:
            time.sleep(wait)
    _last_request_started_at = time.monotonic()
    return send()


def answered_by_platform(response: requests.Response) -> bool:
    """False means an intermediary answered before the application."""
    return bool(response.headers.get(GUARD_RULE_HEADER))


def expect_api_json(response: requests.Response) -> Any:
    """Parses only JSON responses and distinguishes an application response from
    an edge/WAF/proxy response that never reached the platform."""
    content_type = response.headers.get("content-type", "<none>")
    if "json" not in content_type:
        origin = (
            f"application (rule={response.headers.get(GUARD_RULE_HEADER)})"
            if answered_by_platform(response)
            else "an intermediary - no X-QA-Guard-Rule header, the request never reached the app"
        )
        raise AssertionError(
            "\n".join(
                [
                    f"Expected JSON from {response.url}",
                    f"status={response.status_code} content-type={content_type}",
                    f"answered by: {origin}",
                    f"incident={response.headers.get(INCIDENT_HEADER, 'n/a')}",
                    f"body: {response.text[:200]}",
                ]
            )
        )
    return response.json()


def with_rate_limit_retry(
    send: Send, max_attempts: int = 3, max_wait_seconds: float = 60.0
) -> requests.Response:
    """Retries only application throttling and honors the published Retry-After."""
    response = send()
    attempt = 1
    while attempt < max_attempts and response.status_code == 429:
        try:
            retry_after = float(response.headers.get("retry-after", "1"))
        except ValueError:
            retry_after = 1.0
        time.sleep(min(retry_after, max_wait_seconds))
        response = send()
        attempt += 1
    return response


def record_incident(response: requests.Response) -> None:
    """Makes a non-success correlation ID visible in the Allure report."""
    if response.ok:
        return
    incident = response.headers.get(INCIDENT_HEADER)
    if incident:
        allure.attach(
            f"{incident} - {response.status_code} {response.url}",
            "incident",
            allure.attachment_type.TEXT,
        )
        return
    allure.attach(
        " - ".join(
            [
                time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                f"{response.status_code} {response.url}",
                f"content-type={response.headers.get('content-type', 'n/a')}",
                f"server={response.headers.get('server', 'n/a')}",
                f"x-vercel-id={response.headers.get('x-vercel-id', 'n/a')}",
                f"x-vercel-mitigated={response.headers.get('x-vercel-mitigated', 'n/a')}",
                "X-QA-Guard-Rule missing",
            ]
        ),
        "infrastructure",
        allure.attachment_type.TEXT,
    )


def record_low_budget(response: requests.Response) -> None:
    try:
        limit = float(response.headers.get("x-ratelimit-limit", ""))
        remaining = float(response.headers.get("x-ratelimit-remaining", ""))
    except ValueError:
        return
    if limit > 0 and remaining / limit < 0.2:
        allure.attach(
            f"{remaining:.0f}/{limit:.0f} requests remaining",
            "traffic-budget",
            allure.attachment_type.TEXT,
        )


def expect_platform_trace(response: requests.Response) -> None:
    """Asserts the platform trace headers promised for every /api/* response."""
    if not response.headers.get(GUARD_RULE_HEADER):
        set_cookie = response.headers.get("set-cookie", "")
        challenge = "vercel" in set_cookie.lower() or "challenge" in set_cookie.lower()
        raise AssertionError(
            "\n".join(
                [
                    "Infrastructure response: the request did not reach the application",
                    f"timestamp={time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}",
                    f"status={response.status_code} url={response.url}",
                    f"content-type={response.headers.get('content-type', 'n/a')}",
                    f"server={response.headers.get('server', 'n/a')}",
                    f"x-vercel-id={response.headers.get('x-vercel-id', 'n/a')}",
                    f"x-vercel-mitigated={response.headers.get('x-vercel-mitigated', 'n/a')}",
                    f"challenge-cookie-present={challenge}",
                    "X-QA-Guard-Rule missing",
                ]
            )
        )
    if not response.headers.get(INCIDENT_HEADER):
        raise AssertionError(f"Missing X-QA-Incident-Id for {response.url}")


def guarded_api(send: Send) -> requests.Response:
    """Applies the traffic policy to one request before any contract assertion."""
    response = with_rate_limit_retry(lambda: _send_with_optional_pacing(send))
    record_incident(response)
    record_low_budget(response)
    expect_platform_trace(response)
    return response


def observed_api(send: Send) -> requests.Response:
    """Paces and retries a request and reports its incident without failing on
    missing trace headers. Used by the Book scenarios, whose contract is the
    application payload rather than the platform trace."""
    response = with_rate_limit_retry(lambda: _send_with_optional_pacing(send))
    record_incident(response)
    record_low_budget(response)
    return response


def attach_json(name: str, payload: Any) -> None:
    allure.attach(
        json.dumps(payload, indent=2, default=str), name, allure.attachment_type.JSON
    )
