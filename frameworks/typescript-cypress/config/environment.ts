const required = (name: 'apiKey' | 'uiEmail' | 'uiPassword'): string => {
  const value = Cypress.env(name) as string | undefined;
  if (!value?.trim()) throw new Error(`${name} is required. Copy .env.example to .env.`);
  return value;
};

const optional = (name: string): string => ((Cypress.env(name) as string | undefined) ?? '').trim();

export const environment = {
  apiKey: () => required('apiKey'),
  uiEmail: () => required('uiEmail'),
  uiPassword: () => required('uiPassword'),
  deviceProfile: () => optional('deviceProfile') || 'desktop',
  isMobile: () => optional('deviceProfile') === 'mobile',
};

/**
 * Maintainer-only deployment protection bypass. `cypress.config.ts` reads the
 * secret from the untracked local environment and republishes it for the
 * browser, so specs never inline the value themselves.
 */
export const hasAutomationBypass = (): boolean => Boolean(optional('vercelBypassSecret'));

/**
 * Headers that let a maintainer run against the protected deployment. Public
 * learners get an empty object, which is what the four Book scenarios always use.
 */
export function vercelAutomationHeaders(): Record<string, string> {
  const secret = optional('vercelBypassSecret');
  if (!secret) return {};
  return {
    'x-vercel-protection-bypass': secret,
    'x-vercel-set-bypass-cookie': 'true',
  };
}
