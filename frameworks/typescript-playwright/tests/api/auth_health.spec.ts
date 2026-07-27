import { allure } from 'allure-playwright';
import { environment } from '../../config/environment.js';
import { test, expect } from '../../fixtures/test.js';
import { step } from '../../helpers/steps.js';
import { expectApiJson, guardedApi } from '../../helpers/api_response.js';

const labels = async (story: string) => {
  await allure.epic('Chapter 5');
  await allure.feature('Authentication and health API');
  await allure.story(story);
};

test('[API-AUTH-001] Login returns the expected user and usable tokens', async ({ request }, testInfo) => {
  await labels('API-AUTH-001 - Valid login');
  const response = await step('When: client logs in with the configured account', () =>
    guardedApi(testInfo, () => request.post('/api/auth/login', {
      data: { email: environment.uiEmail, password: environment.uiPassword },
    })));
  await step('Then: login returns the configured account without reporting secrets', async () => {
    expect(response.status()).toBe(200);
    const payload = await expectApiJson<any>(response);
    const data = payload.data ?? payload;
    expect(data.user?.email ?? data.email).toBe(environment.uiEmail);
    expect(data.session_token).toBeTruthy();
    expect(data.api_token).toBeTruthy();
  });
});

test('[API-AUTH-002] Invalid credentials return a controlled unauthorized response', async ({ request }, testInfo) => {
  await labels('API-AUTH-002 - Invalid credentials');
  const response = await step('When: client submits fictional invalid credentials', () =>
    guardedApi(testInfo, () => request.post('/api/auth/login', {
      data: { email: 'invalid-login@example.invalid', password: 'not-a-valid-password' },
    })));
  await step('Then: authentication is rejected with a controlled error', async () => {
    expect(response.status()).toBe(401);
    const payload = await expectApiJson<any>(response);
    expect(payload.success).toBe(false);
    expect(payload.error).toBeTruthy();
  });
});

test('[API-AUTH-003] Authenticated profile belongs to the configured account', async ({ request }, testInfo) => {
  await labels('API-AUTH-003 - Authenticated profile');
  const response = await step('When: client requests the authenticated profile', () =>
    guardedApi(testInfo, () => request.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${environment.apiKey}` },
    })));
  await step('Then: profile matches the configured account', async () => {
    expect(response.status()).toBe(200);
    const payload = await expectApiJson<any>(response);
    expect((payload.user ?? payload.data ?? payload).email).toBe(environment.uiEmail);
  });
});

for (const credential of [
  { name: 'missing', header: undefined },
  { name: 'invalid', header: 'Bearer invalid-token' },
]) {
  test(`[API-AUTH-004] Protected profile rejects ${credential.name} Bearer`, async ({ request }, testInfo) => {
    await labels('API-AUTH-004 - Missing or invalid Bearer');
    await allure.parameter('credential', credential.name);
    const response = await step('When: client requests a protected resource without valid authorization', () =>
      guardedApi(testInfo, () => request.get('/api/auth/me', {
        headers: credential.header ? { Authorization: credential.header } : {},
      })));
    await step('Then: the protected resource returns unauthorized', async () => {
      expect(response.status()).toBe(401);
      expect((await expectApiJson<{ success: boolean }>(response)).success).toBe(false);
    });
  });
}

test('[API-HEALTH-001] Authenticated health exposes known component checks', async ({ request }, testInfo) => {
  await labels('API-HEALTH-001 - Authenticated health');
  const response = await step('When: client requests authenticated platform health', () =>
    guardedApi(testInfo, () => request.get('/api/health', {
      headers: { Authorization: `Bearer ${environment.apiKey}` },
    })));
  await step('Then: health returns its documented status and structured checks', async () => {
    expect([200, 503]).toContain(response.status());
    const payload = await expectApiJson<any>(response);
    expect(payload.status).toMatch(/healthy|unhealthy|degraded/);
    expect(payload.checks).toEqual(expect.objectContaining({
      database: expect.any(Object),
      auth: expect.any(Object),
      storage: expect.any(Object),
    }));
  });
});
