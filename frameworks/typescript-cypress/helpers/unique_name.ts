export const uniqueProductName = (): string =>
  `e2e-typescript-cypress-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
