const required = (name: 'apiKey' | 'uiEmail'): string => {
  const value = Cypress.env(name) as string | undefined;
  if (!value?.trim()) throw new Error(`${name} is required. Copy .env.example to .env.`);
  return value;
};

export const environment = {
  apiKey: () => required('apiKey'),
  uiEmail: () => required('uiEmail'),
};
