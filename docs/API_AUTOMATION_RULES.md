# API Automation Rules

This briefing governs API tests in `qa-academy-exercises`. The platform-side reference is
`docs/api-traffic-policy.md`.

## Platform contract

1. Automated clients are first-class clients. Tests must not spoof a browser user agent.
2. Every `/api/*` response is JSON, never HTML.
3. Throttling returns `429`; `403` represents an authorization decision.
4. The traffic budget is 600 requests per 60 seconds per identity.
5. Every `/api/*` response contains:
   - `X-QA-Incident-Id`
   - `X-QA-Guard-Rule`
   - `X-QA-Guard-Policy`
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`

`X-QA-Guard-Rule` determines whether the application answered. A response without this header came
from an intermediary and must be reported as an infrastructure incident.

| Observation | Verdict | Test behavior |
|---|---|---|
| JSON with `X-QA-Guard-Rule` | Application response | Assert the endpoint contract |
| `403` HTML without `X-QA-Guard-Rule` | Edge/WAF block | Fail explicitly; do not retry |
| `403` HTML from every client on one machine | Source address is flagged | Report environment state; changing client does not help |
| `429` JSON with `api-traffic-window` | Application throttle | Honor `Retry-After`; retry at most 2–3 times |
| `502` JSON with `UPSTREAM_NON_JSON` | Internal intermediary | Report incident ID; retry at most once |

## Required endpoint assertions

| Request | Expected result |
|---|---|
| `POST /api/graphql` | `200` JSON with `data` and/or `errors` |
| Native product `QUERY` | `200`, `meta.transport === "QUERY"` |
| Product POST override | `200`, `meta.transport === "POST_OVERRIDE"` |
| Plain product POST query | `200`, `meta.transport === "POST"` |
| Invalid query document | `400` JSON with `success: false` and a specific error |
| GET on a query endpoint | `405` JSON and `Allow: QUERY, POST, OPTIONS` |
| OPTIONS on a query endpoint | `204` and matching `Access-Control-Allow-Methods` |
| Missing or invalid protected-route credentials | `401` JSON |
| Exceeded request budget | `429` JSON with `Retry-After` and rate-limit headers |

The same query transport rules apply to `/api/orders/query`.

## Suite rules

- The complete API command lists 39 executions: 38 extended executions and one Book execution.
  The extended cases are public teaching examples, not a public load suite. Against the hosted
  Vercel environment, public users must select one test or a maximum batch of three tests by
  traceability ID. Full-catalog execution is reserved for maintainers with the automation bypass.
- Assert the media type before parsing JSON.
- Capture `X-QA-Incident-Id` on every non-2xx response and attach it to the test report.
- Retry only `429`, honoring `Retry-After` and using a bounded attempt count.
- Watch `X-RateLimit-Remaining`; reduce workers before the shared budget falls below 20%.
- Assert specific negative statuses rather than a generic non-2xx result.
- Never inspect or assert an HTML block page.
- Never hardcode incident IDs.
- Never blanket-retry 4xx responses.
- Never add global sleeps or request that the traffic guard be disabled.
- Diagnostic pacing may be enabled temporarily with `API_REQUEST_PACING_MS` to test whether an edge
  challenge correlates with request bursts. Its default must remain `0`; it is evidence gathering,
  not a substitute for the documented platform budget or provider-side configuration.
- Do not infer client classification from sequential probes. Edge mitigation is stateful by source
  address; compare two clients while the address is in the same state, then verify from another
  network.
- On edge responses, record `X-Vercel-Mitigated`, `X-Vercel-Id`, and whether a challenge cookie is
  present.
- The Vercel automation bypass is maintainer-only. Load `VERCEL_AUTOMATION_BYPASS_SECRET` from an
  untracked local environment or the CI secret store; never hardcode, log, commit, or publish it.
- Internal non-Book Playwright projects send `x-vercel-protection-bypass` and
  `x-vercel-set-bypass-cookie: true`. Book projects must never receive either header.

## TypeScript Playwright support

The implementation is centralized in
`frameworks/typescript-playwright/helpers/api_response.ts`:

- `answeredByPlatform`
- `expectApiJson`
- `withRateLimitRetry`
- `recordIncident`
- `expectPlatformTrace`
- `guardedApi`

Every API request must pass through this support before its endpoint-specific assertions.

## Reporting a platform incident

Include:

1. `X-QA-Incident-Id`, when present.
2. Timestamp with timezone, method and full path.
3. HTTP status and `Content-Type`.
4. Presence and value of `X-QA-Guard-Rule`.
5. `X-RateLimit-Remaining`.
6. Whether the same call succeeds from the browser app with the same credentials.
7. `X-Vercel-Mitigated`, `X-Vercel-Id`, and challenge-cookie presence when Vercel answered.
