import http from 'node:http';
import https from 'node:https';

export type NodeApiRequest = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export type NodeApiResponse = {
  status: number;
  headers: Record<string, string>;
  body: unknown;
};

const normalizeHeaders = (
  headers: http.IncomingHttpHeaders,
): Record<string, string> => Object.fromEntries(
  Object.entries(headers)
    .filter((entry): entry is [string, string | string[]] => entry[1] !== undefined)
    .map(([name, value]) => [name, Array.isArray(value) ? value.join(', ') : value]),
);

const parseBody = (raw: string): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
};

/**
 * Sends API requests from Cypress's Node process. Cypress's cy.request rejects
 * non-standard verbs before dispatch, while node:http accepts valid extension
 * methods such as QUERY.
 */
export function nodeApiRequest(
  baseUrl: string,
  request: NodeApiRequest,
  redirectsRemaining = 3,
  cookie?: string,
): Promise<NodeApiResponse> {
  const target = new URL(request.url, baseUrl);
  const serializedBody = request.body === undefined ? undefined : JSON.stringify(request.body);
  const headers: Record<string, string> = { ...request.headers };

  if (serializedBody !== undefined) {
    headers['Content-Type'] ??= 'application/json';
    headers['Content-Length'] = Buffer.byteLength(serializedBody).toString();
  }
  if (cookie) headers.Cookie = cookie;

  const transport = target.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const outgoing = transport.request(target, {
      method: request.method,
      headers,
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on('end', () => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (location && status >= 300 && status < 400 && redirectsRemaining > 0) {
          const setCookie = response.headers['set-cookie']
            ?.map((value) => value.split(';', 1)[0])
            .join('; ');
          void nodeApiRequest(
            target.toString(),
            { ...request, url: location },
            redirectsRemaining - 1,
            setCookie ?? cookie,
          ).then(resolve, reject);
          return;
        }
        resolve({
          status,
          headers: normalizeHeaders(response.headers),
          body: parseBody(Buffer.concat(chunks).toString('utf8')),
        });
      });
    });
    outgoing.setTimeout(30_000, () => {
      outgoing.destroy(new Error(`API request timed out: ${request.method} ${target.pathname}`));
    });
    outgoing.on('error', reject);
    if (serializedBody !== undefined) outgoing.write(serializedBody);
    outgoing.end();
  });
}
