import type { NodeApiRequest, NodeApiResponse } from './node_api_request';

const GUARD_RULE_HEADER = 'x-qa-guard-rule';
const INCIDENT_HEADER = 'x-qa-incident-id';

/** Verbs `cy.request` refuses to dispatch, so they travel through the Node task. */
const EXTENSION_METHODS = new Set(['QUERY']);

export type ApiResponse<T = any> = {
  status: number;
  headers: Record<string, string>;
  body: T;
};

export type ApiOptions = {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

const lower = (headers: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers ?? {}).map(([name, value]) => [
      name.toLowerCase(),
      Array.isArray(value) ? value.join(', ') : String(value),
    ]),
  );

/** False means an intermediary answered before the application. */
export const answeredByPlatform = (response: ApiResponse): boolean =>
  Boolean(response.headers[GUARD_RULE_HEADER]);

/**
 * Fails with the response origin instead of a bare parse error when the body is
 * not JSON, so an edge, WAF or proxy answer is never mistaken for the platform.
 */
export function expectApiJson<T = any>(response: ApiResponse): T {
  const contentType = response.headers['content-type'] ?? '<none>';
  if (!contentType.includes('json')) {
    const origin = answeredByPlatform(response)
      ? `application (rule=${response.headers[GUARD_RULE_HEADER]})`
      : 'an intermediary — no X-QA-Guard-Rule header, the request never reached the app';
    throw new Error([
      'Expected a JSON response',
      `status=${response.status} content-type=${contentType}`,
      `answered by: ${origin}`,
      `incident=${response.headers[INCIDENT_HEADER] ?? 'n/a'}`,
      `body: ${String(JSON.stringify(response.body)).slice(0, 200)}`,
    ].join('\n'));
  }
  return response.body as T;
}

/** Asserts the platform trace headers promised for every /api/* response. */
export function expectPlatformTrace(response: ApiResponse, url: string): void {
  if (!response.headers[GUARD_RULE_HEADER]) {
    throw new Error([
      'Infrastructure response: the request did not reach the application',
      `timestamp=${new Date().toISOString()}`,
      `status=${response.status} url=${url}`,
      `content-type=${response.headers['content-type'] ?? 'n/a'}`,
      `server=${response.headers.server ?? 'n/a'}`,
      `x-vercel-id=${response.headers['x-vercel-id'] ?? 'n/a'}`,
      `x-vercel-mitigated=${response.headers['x-vercel-mitigated'] ?? 'n/a'}`,
      'X-QA-Guard-Rule missing',
    ].join('\n'));
  }
  if (!response.headers[INCIDENT_HEADER]) {
    throw new Error(`Missing X-QA-Incident-Id for ${url}`);
  }
}

const send = (options: ApiOptions): Cypress.Chainable<ApiResponse> => {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = { ...options.headers };

  if (EXTENSION_METHODS.has(method)) {
    const request: NodeApiRequest = { method, url: options.url, headers, body: options.body };
    return cy
      .task<NodeApiResponse>('apiRequest', request, { log: false })
      .then((response) => ({
        status: response.status,
        headers: lower(response.headers),
        body: response.body,
      }));
  }

  return cy
    .request({
      method,
      url: options.url,
      headers,
      body: options.body as Cypress.RequestBody,
      failOnStatusCode: false,
    })
    .then((response) => ({
      status: response.status,
      headers: lower(response.headers as Record<string, unknown>),
      body: response.body,
    }));
};

/**
 * Retries only application throttling and honors the published Retry-After, so
 * a 429 from the traffic policy never fails a contract assertion by itself.
 */
const withRateLimitRetry = (
  options: ApiOptions,
  attemptsLeft: number,
): Cypress.Chainable<ApiResponse> =>
  send(options).then((response) => {
    if (response.status !== 429 || attemptsLeft <= 1) return cy.wrap(response, { log: false });
    const retryAfter = Number(response.headers['retry-after'] ?? 1);
    const waitSeconds = Math.min(Number.isFinite(retryAfter) ? retryAfter : 1, 60);
    return cy
      .wait(waitSeconds * 1_000, { log: false })
      .then(() => withRateLimitRetry(options, attemptsLeft - 1));
  }) as Cypress.Chainable<ApiResponse>;

/** Applies the traffic policy to one request before any contract assertion. */
export const guardedApi = <T = any>(options: ApiOptions): Cypress.Chainable<ApiResponse<T>> =>
  withRateLimitRetry(options, 3).then((response) => {
    expectPlatformTrace(response, options.url);
    return response as ApiResponse<T>;
  });

/** Guarded request that also fails when the body is not the documented JSON. */
export const guardedJson = <T = any>(options: ApiOptions): Cypress.Chainable<ApiResponse<T>> =>
  guardedApi<T>(options).then((response) => {
    expectApiJson(response);
    return response;
  });
