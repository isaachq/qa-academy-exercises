import type { APIResponse, TestInfo } from '@playwright/test';

const GUARD_RULE_HEADER = 'x-qa-guard-rule';
const INCIDENT_HEADER = 'x-qa-incident-id';

/** False means an intermediary answered before the application. */
export function answeredByPlatform(response: APIResponse): boolean {
  return Boolean(response.headers()[GUARD_RULE_HEADER]);
}

/**
 * Parses only JSON responses and distinguishes an application response from
 * an edge/WAF/proxy response that never reached the platform.
 */
export async function expectApiJson<T = unknown>(response: APIResponse): Promise<T> {
  const headers = response.headers();
  const contentType = headers['content-type'] ?? '<none>';
  if (!contentType.includes('json')) {
    const preview = (await response.text()).slice(0, 200);
    const origin = answeredByPlatform(response)
      ? `application (rule=${headers[GUARD_RULE_HEADER]})`
      : 'an intermediary — no X-QA-Guard-Rule header, the request never reached the app';
    throw new Error([
      `Expected JSON from ${response.url()}`,
      `status=${response.status()} content-type=${contentType}`,
      `answered by: ${origin}`,
      `incident=${headers[INCIDENT_HEADER] ?? 'n/a'}`,
      `body: ${preview}`,
    ].join('\n'));
  }
  return response.json() as Promise<T>;
}

/** Retries only application throttling and honors the published Retry-After. */
export async function withRateLimitRetry(
  send: () => Promise<APIResponse>,
  { maxAttempts = 3, maxWaitSeconds = 60 } = {},
): Promise<APIResponse> {
  let response = await send();
  for (let attempt = 1; attempt < maxAttempts && response.status() === 429; attempt += 1) {
    const retryAfter = Number(response.headers()['retry-after'] ?? 1);
    const waitSeconds = Math.min(Number.isFinite(retryAfter) ? retryAfter : 1, maxWaitSeconds);
    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1_000));
    response = await send();
  }
  return response;
}

/** Makes a non-success correlation ID visible in Playwright and Allure reports. */
export function recordIncident(testInfo: TestInfo, response: APIResponse): void {
  if (response.ok()) return;
  const headers = response.headers();
  const incident = headers[INCIDENT_HEADER];
  if (incident) {
    testInfo.annotations.push({
      type: 'incident',
      description: `${incident} · ${response.status()} ${response.url()}`,
    });
    return;
  }
  testInfo.annotations.push({
    type: 'infrastructure',
    description: [
      new Date().toISOString(),
      `${response.status()} ${response.url()}`,
      `content-type=${headers['content-type'] ?? 'n/a'}`,
      `server=${headers.server ?? 'n/a'}`,
      `x-vercel-id=${headers['x-vercel-id'] ?? 'n/a'}`,
      `x-vercel-mitigated=${headers['x-vercel-mitigated'] ?? 'n/a'}`,
      'X-QA-Guard-Rule missing',
    ].join(' · '),
  });
}

function recordLowBudget(testInfo: TestInfo, response: APIResponse): void {
  const headers = response.headers();
  const limit = Number(headers['x-ratelimit-limit']);
  const remaining = Number(headers['x-ratelimit-remaining']);
  if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining) && remaining / limit < 0.2) {
    testInfo.annotations.push({
      type: 'traffic-budget',
      description: `${remaining}/${limit} requests remaining`,
    });
  }
}

/** Asserts the platform trace headers promised for every /api/* response. */
export function expectPlatformTrace(response: APIResponse): void {
  const headers = response.headers();
  if (!headers[GUARD_RULE_HEADER]) {
    const challengeCookiePresent = /vercel|challenge/i.test(headers['set-cookie'] ?? '');
    throw new Error([
      'Infrastructure response: the request did not reach the application',
      `timestamp=${new Date().toISOString()}`,
      `status=${response.status()} url=${response.url()}`,
      `content-type=${headers['content-type'] ?? 'n/a'}`,
      `server=${headers.server ?? 'n/a'}`,
      `x-vercel-id=${headers['x-vercel-id'] ?? 'n/a'}`,
      `x-vercel-mitigated=${headers['x-vercel-mitigated'] ?? 'n/a'}`,
      `challenge-cookie-present=${challengeCookiePresent}`,
      'X-QA-Guard-Rule missing',
    ].join('\n'));
  }
  if (!headers[INCIDENT_HEADER]) {
    throw new Error(`Missing X-QA-Incident-Id for ${response.url()}`);
  }
}

/** Applies the traffic policy to one request before any contract assertion. */
export async function guardedApi(
  testInfo: TestInfo,
  send: () => Promise<APIResponse>,
): Promise<APIResponse> {
  const response = await withRateLimitRetry(send);
  recordIncident(testInfo, response);
  recordLowBudget(testInfo, response);
  expectPlatformTrace(response);
  return response;
}
