export const uniqueProductName = (stack = 'typescript-cypress'): string =>
  `e2e-${stack}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
