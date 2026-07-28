"""Single HTTP entry point for the extended API catalog.

Every call goes through `guarded_api`, so a challenge page or a throttled
response is reported as an infrastructure problem instead of silently failing a
contract assertion. The client also dispatches the `QUERY` verb, which the
platform accepts natively on `/api/products/query` and `/api/orders/query`.
"""

from typing import Any

import requests

from config.environment import environment
from helpers.api_response import expect_api_json, guarded_api


class ApiClient:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {"Content-Type": "application/json", **environment.automation_headers}
        )

    def request(
        self,
        method: str,
        path: str,
        *,
        json: Any = None,
        headers: dict[str, str] | None = None,
        authenticated: bool = True,
        guarded: bool = True,
    ) -> requests.Response:
        merged = dict(environment.auth_headers) if authenticated else {}
        merged.update(headers or {})

        def send() -> requests.Response:
            try:
                return self.session.request(
                    method,
                    f"{environment.base_url}{path}",
                    headers=merged,
                    json=json,
                    timeout=30,
                )
            except requests.RequestException as error:
                raise RuntimeError(
                    f"{method} {path} failed with {type(error).__name__}; "
                    "credentials were redacted"
                ) from None

        return guarded_api(send) if guarded else send()

    def get(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("POST", path, **kwargs)

    def patch(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("PATCH", path, **kwargs)

    def delete(self, path: str, **kwargs: Any) -> requests.Response:
        return self.request("DELETE", path, **kwargs)

    def query(self, path: str, **kwargs: Any) -> requests.Response:
        """Native HTTP QUERY. `requests` forwards any valid extension method."""
        return self.request("QUERY", path, **kwargs)

    def graphql(
        self,
        query: str,
        variables: dict[str, Any] | None = None,
        operation_name: str | None = None,
    ) -> dict[str, Any]:
        response = self.post(
            "/api/graphql",
            json={
                "query": query,
                "variables": variables or {},
                "operationName": operation_name,
            },
        )
        assert response.status_code == 200, response.text
        return expect_api_json(response)
