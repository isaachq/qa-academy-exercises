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

