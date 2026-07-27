export const uniqueProductName = (stack: string): string =>
  `e2e-${stack}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
