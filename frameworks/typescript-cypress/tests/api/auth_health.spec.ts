import * as allure from 'allure-js-commons';
import { environment } from '../../config/environment';
import { guardedApi } from '../../helpers/api_response';
import { step } from '../../helpers/steps';

const labels = (story: string): void => {
  allure.epic('Chapter 5');
  allure.feature('Authentication and health API');
  allure.story(story);
};

const auth = () => ({
  Authorization: `Bearer ${environment.apiKey()}`,
  'Content-Type': 'application/json',
});

describe('Chapter 5 extended API catalog: authentication and health', () => {
  it('[API-AUTH-001] Login returns the expected user and usable tokens', () => {
    labels('API-AUTH-001 - Valid login');

    step('When: client logs in with the configured account', () => {
      guardedApi<any>({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { email: environment.uiEmail(), password: environment.uiPassword() },
      }).then((response) => {
        step('Then: login returns the configured account without reporting secrets', () => {
          expect(response.status, 'login status').to.eq(200);
          const data = response.body.data ?? response.body;
          expect(data.user?.email ?? data.email, 'authenticated email').to.eq(environment.uiEmail());
          expect(data.session_token, 'session token').to.be.a('string').and.not.be.empty;
          expect(data.api_token, 'api token').to.be.a('string').and.not.be.empty;
        });
      });
    });
  });

  it('[API-AUTH-002] Invalid credentials return a controlled unauthorized response', () => {
    labels('API-AUTH-002 - Invalid credentials');

    step('When: client submits fictional invalid credentials', () => {
      guardedApi<any>({
        method: 'POST',
        url: '/api/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'invalid-login@example.invalid', password: 'not-a-valid-password' },
      }).then((response) => {
        step('Then: authentication is rejected with a controlled error', () => {
          expect(response.status, 'login status').to.eq(401);
          expect(response.body.success, 'success flag').to.eq(false);
          expect(response.body.error, 'error message').to.be.a('string').and.not.be.empty;
        });
      });
    });
  });

  it('[API-AUTH-003] Authenticated profile belongs to the configured account', () => {
    labels('API-AUTH-003 - Authenticated profile');

    step('When: client requests the authenticated profile', () => {
      guardedApi<any>({ url: '/api/auth/me', headers: auth() }).then((response) => {
        step('Then: profile matches the configured account', () => {
          expect(response.status, 'profile status').to.eq(200);
          const profile = response.body.user ?? response.body.data ?? response.body;
          expect(profile.email, 'profile email').to.eq(environment.uiEmail());
        });
      });
    });
  });

  for (const credential of [
    { name: 'missing', header: undefined },
    { name: 'invalid', header: 'Bearer invalid-token' },
  ]) {
    it(`[API-AUTH-004] Protected profile rejects ${credential.name} Bearer`, () => {
      labels('API-AUTH-004 - Missing or invalid Bearer');
      allure.parameter('credential', credential.name);

      step('When: client requests a protected resource without valid authorization', () => {
        guardedApi<any>({
          url: '/api/auth/me',
          headers: credential.header ? { Authorization: credential.header } : {},
        }).then((response) => {
          step('Then: the protected resource returns unauthorized', () => {
            expect(response.status, 'profile status').to.eq(401);
            expect(response.body.success, 'success flag').to.eq(false);
          });
        });
      });
    });
  }

  it('[API-HEALTH-001] Authenticated health exposes known component checks', () => {
    labels('API-HEALTH-001 - Authenticated health');

    step('When: client requests authenticated platform health', () => {
      guardedApi<any>({ url: '/api/health', headers: auth() }).then((response) => {
        step('Then: health returns its documented status and structured checks', () => {
          expect([200, 503], 'health status').to.include(response.status);
          expect(response.body.status, 'reported status').to.match(/healthy|unhealthy|degraded/);
          expect(response.body.checks, 'component checks').to.include.all.keys(
            'database',
            'auth',
            'storage',
          );
        });
      });
    });
  });
});
