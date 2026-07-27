/**
 * Keeps a failing test's real error visible in the Allure report.
 *
 * The reporter serializes `error.actual` and `error.expected` with
 * `JSON.stringify` using a cycle guard that only tracks the ancestors of the
 * current path, and with no depth or length limit. An object graph that reuses
 * the same subtree in several branches is therefore expanded once per path,
 * which grows exponentially and throws `RangeError: Invalid string length`.
 * That RangeError then replaces the real failure, so the report says nothing
 * about what actually broke.
 *
 * This guard runs before the reporter's own `fail` listener and replaces any
 * value that cannot be serialized cheaply with a bounded preview, so the
 * assertion message always survives. Values that are provably safe to
 * serialize are left untouched, keeping the usual actual/expected diff.
 */

const MAX_DEPTH = 6;
const MAX_LENGTH = 4096;

type Inspection = { preview: string; bounded: boolean };

/**
 * Serializes a value with a proper seen-set, a depth limit and a length limit.
 * `bounded` is false when nothing had to be cut, which means the reporter can
 * serialize the original value safely on its own.
 */
const inspect = (value: unknown): Inspection => {
  const seen = new WeakSet<object>();
  let bounded = false;

  const walk = (current: unknown, depth: number): unknown => {
    if (current === null || typeof current !== 'object') {
      return typeof current === 'bigint' || typeof current === 'function'
        ? String(current)
        : current;
    }
    if (seen.has(current)) {
      bounded = true;
      return '[circular or repeated reference]';
    }
    if (depth >= MAX_DEPTH) {
      bounded = true;
      return '[depth limit reached]';
    }
    seen.add(current);
    if (Array.isArray(current)) return current.map((item) => walk(item, depth + 1));
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(current)) output[key] = walk(item, depth + 1);
    return output;
  };

  let preview: string;
  try {
    preview = JSON.stringify(walk(value, 0)) ?? String(value);
  } catch {
    bounded = true;
    preview = '[value could not be serialized]';
  }
  if (preview.length > MAX_LENGTH) {
    bounded = true;
    preview = `${preview.slice(0, MAX_LENGTH)}...`;
  }
  return { preview, bounded };
};

const safeValue = (value: unknown): unknown => {
  if (value === null || typeof value !== 'object') return value;
  const { preview, bounded } = inspect(value);
  return bounded ? preview : value;
};

const sanitize = (holder: Record<string, unknown> | undefined): void => {
  if (!holder || typeof holder !== 'object') return;
  for (const key of ['actual', 'expected'] as const) {
    if (!(key in holder) || holder[key] === undefined) continue;
    try {
      holder[key] = safeValue(holder[key]);
    } catch {
      holder[key] = '[value could not be serialized]';
    }
  }
};

const guard = (error: Error): void => {
  const holder = error as unknown as Record<string, unknown>;
  sanitize(holder);
  sanitize(holder.matcherResult as Record<string, unknown> | undefined);

  // Cypress treats a `fail` listener that returns without throwing as "failure
  // handled". Only rethrow when no other listener follows, mirroring what the
  // reporter's own listener does.
  if (Object.is(Cypress.listeners('fail').at(-1), guard)) throw error;
};

Cypress.on('fail', guard);
