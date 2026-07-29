/**
 * The public host sits behind deployment and traffic protection. A full
 * extended catalog run trips that protection and the platform starts answering
 * human-verification pages instead of the application, which turns every
 * remaining assertion into noise.
 *
 * Public learners therefore select the extended tests they want by traceability
 * ID, at most three per command:
 *
 *   npx cypress run --spec tests/api/cart.spec.ts --env ids=API-CART-001
 *
 * The four Book scenarios are exempt: they are a fixed, small batch and may always run together.
 */
export const MAX_PUBLIC_BATCH = 3;

const BOOK_PREFIX = '[BOOK-TEST';

export const isBookTest = (title: string): boolean => title.startsWith(BOOK_PREFIX);

/** Traceability IDs requested with `--env ids=...`. Empty means "no selection". */
export function selectedIds(): string[] {
  const raw = (Cypress.env('ids') as string | undefined) ?? '';
  return raw
    .split(/[,|\s]+/)
    .map((id) => id.trim().toUpperCase())
    .filter(Boolean);
}

/** Throws when the selection itself already breaks the published policy. */
export function assertSelectionIsAllowed(ids: string[]): void {
  if (ids.length > MAX_PUBLIC_BATCH) {
    throw new Error(
      [
        `Public execution policy: at most ${MAX_PUBLIC_BATCH} extended tests per command,`,
        `received ${ids.length} (${ids.join(', ')}).`,
        'Split the run into separate commands by traceability ID.',
      ].join(' '),
    );
  }
}

export type Decision = { run: boolean; reason?: string };

/**
 * Decides whether one test may run under the current selection.
 * `run: false` without a reason means the test is simply outside the selection.
 */
export function decide(title: string, ids: string[]): Decision {
  if (isBookTest(title)) {
    return ids.length === 0 || ids.some((id) => title.includes(id))
      ? { run: true }
      : { run: false };
  }

  if (ids.length > 0) {
    return ids.some((id) => title.includes(id)) ? { run: true } : { run: false };
  }

  return {
    run: false,
    reason: [
      'Public execution policy: extended tests must be selected by traceability ID,',
      `at most ${MAX_PUBLIC_BATCH} per command, because the public host is protected`,
      'against automated traffic.',
      '',
      `Example: npx cypress run --spec ${Cypress.spec.relative} --env ids=${title.match(/\[([A-Z-]+\d+)\]/)?.[1] ?? 'API-AUTH-001'}`,
    ].join('\n'),
  };
}
