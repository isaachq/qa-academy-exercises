const requireValue = (name: 'API_KEY' | 'UI_EMAIL' | 'UI_PASSWORD'): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required. Copy .env.example to .env.`);
  return value;
};

export const environment = {
  baseUrl: (process.env.BASE_URL ?? 'https://qaacademyabc.xyz').replace(/\/$/, ''),
  get apiKey() {
    return requireValue('API_KEY');
  },
  get uiEmail() {
    return requireValue('UI_EMAIL');
  },
  get uiPassword() {
    return requireValue('UI_PASSWORD');
  },
};
