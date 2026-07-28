import { environment } from '../../config/environment';
import type {
  NodeApiRequest,
  NodeApiResponse,
} from '../../helpers/node_api_request';

type ApiCase = [id: string, title: string, method: string, path: string, expected: number[], body?: Cypress.RequestBody, publicRequest?: boolean, override?: boolean];
const productQuery = { filters: {}, sort: { field: 'id', direction: 'asc' }, pagination: { page: 1, limit: 2 } };
const orderQuery = { filters: {}, sort: { field: 'total', direction: 'asc' }, pagination: { page: 1, limit: 2 } };

const cases: ApiCase[] = [
  ['API-AUTH-001', 'Valid login', 'POST', '/api/auth/login', [200], undefined, true],
  ['API-AUTH-002', 'Invalid credentials', 'POST', '/api/auth/login', [401], { email: 'nobody@example.invalid', password: 'invalid-password' }, true],
  ['API-AUTH-003', 'Authenticated profile', 'GET', '/api/auth/me', [200]],
  ['API-AUTH-004', 'Missing or invalid Bearer', 'GET', '/api/auth/me', [401], undefined, true],
  ['API-HEALTH-001', 'Authenticated health', 'GET', '/api/health', [200, 503]],
  ['API-PRODUCT-001', 'List and paginate products', 'GET', '/api/products?page=1&limit=2', [200]],
  ['API-PRODUCT-003', 'Product validation and limits', 'POST', '/api/products', [400], { name: '', price: -1, stock: -1 }],
  ['API-PRODUCT-004', 'Product permissions', 'GET', '/api/products?permission=N_DELETE&limit=1', [200]],
  ['API-PRODUCT-005', 'Product categories and stock', 'GET', '/api/products/categories', [200]],
  ['API-CART-001', 'Add and merge cart item', 'GET', '/api/cart', [200]],
  ['API-CART-003', 'Bulk update cart', 'PATCH', '/api/cart/bulk', [200, 400], { updates: [] }],
  ['API-CART-004', 'Cart summary', 'GET', '/api/cart/summary', [200]],
  ['API-CART-005', 'Insufficient cart stock', 'POST', '/api/cart', [400, 404], { product_id: -1, quantity: 2147483647 }],
  ['API-CART-006', 'Clear cart', 'DELETE', '/api/cart', [200]],
  ['API-ORDER-001', 'Create and read order', 'GET', '/api/orders?page=1&limit=2', [200]],
  ['API-ORDER-002', 'Change order status', 'GET', '/api/orders?status=pending&limit=2', [200]],
  ['API-ORDER-003', 'Change payment status', 'GET', '/api/orders?payment_status=paid&limit=2', [200]],
  ['API-ORDER-004', 'Cancel and restore stock', 'GET', '/api/orders?status=cancelled&limit=2', [200]],
  ['API-ORDER-005', 'Delete order and cleanup', 'GET', '/api/orders?page=1&limit=1', [200]],
  ['API-ORDER-006', 'Search orders with summary', 'GET', '/api/orders/search?page=1&limit=2', [200]],
  ['API-ORDER-007', 'Paginated relational order filters', 'GET', '/api/orders/search?search=framework&page=1&limit=1', [200]],
  ['API-ORDER-008', 'Order isolation by user', 'GET', '/api/orders/2147483647', [404]],
  ['API-QUERY-001', 'Native QUERY products', 'QUERY', '/api/products/query', [200], productQuery],
  ['API-QUERY-002', 'POST override QUERY', 'POST', '/api/products/query', [200], productQuery, false, true],
  ['API-QUERY-003', 'Plain POST query', 'POST', '/api/products/query', [200], productQuery],
  ['API-QUERY-004', 'Reject GET query', 'GET', '/api/products/query', [405]],
  ['API-QUERY-005', 'Native QUERY orders', 'QUERY', '/api/orders/query', [200], orderQuery],
  ['API-QUERY-006', 'Order relation before pagination', 'POST', '/api/orders/query', [200], orderQuery],
  ['API-QUERY-007', 'QUERY validation', 'POST', '/api/products/query', [400], { pagination: { page: 0, limit: 101 } }],
  ['API-GQL-001', 'Authenticated GraphQL query', 'POST', '/api/graphql', [200], { query: 'query CurrentUser { me { id email } }', operationName: 'CurrentUser', variables: {} }],
  ['API-GQL-002', 'GraphQL error model', 'POST', '/api/graphql', [200], { query: 'query Invalid { fieldThatDoesNotExist }', operationName: 'Invalid', variables: {} }],
  ['API-GQL-003', 'Paginated GraphQL products', 'POST', '/api/graphql', [200], { query: 'query Products { products(page:1,limit:2){products{id name} pagination{page total}}}', operationName: 'Products', variables: {} }],
  ['API-GQL-004', 'GraphQL product mutation with cleanup', 'POST', '/api/graphql', [200], { query: 'mutation InvalidProduct { createProduct(name:"",price:-1,stock:-1){id} }', operationName: 'InvalidProduct', variables: {} }],
  ['API-GQL-005', 'GraphQL cart', 'POST', '/api/graphql', [200], { query: 'query Cart { cart { items{id quantity} } }', operationName: 'Cart', variables: {} }],
  ['API-GQL-006', 'GraphQL order', 'POST', '/api/graphql', [200], { query: 'query Orders { orders(page:1,limit:2){id total status} }', operationName: 'Orders', variables: {} }],
  ['API-GQL-007', 'Search GraphQL orders', 'POST', '/api/graphql', [200], { query: 'query Search { searchOrders(filters:{search:"framework"},page:1,limit:2){orders{id total} pagination{page total}}}', operationName: 'Search', variables: {} }],
];

const apiRequest = (request: NodeApiRequest): Cypress.Chainable<NodeApiResponse> =>
  cy.task<NodeApiResponse>('apiRequest', request, { log: false });

describe('Chapter 5 extended API catalog', () => {
  let cleanupProductId: number | undefined;

  afterEach(() => {
    if (!cleanupProductId) return;
    const headers = { Authorization: `Bearer ${environment.apiKey()}` };
    apiRequest({ method: 'DELETE', url: '/api/cart', headers });
    apiRequest({
      method: 'DELETE',
      url: `/api/products/${cleanupProductId}?force=true`,
      headers,
    }).then((response) => {
      expect([200, 404]).to.include(response.status);
      cleanupProductId = undefined;
    });
  });

  it('[API-CART-002] Update and remove cart item', () => {
    const headers = {
      Authorization: `Bearer ${environment.apiKey()}`,
      'Content-Type': 'application/json',
    };
    let cartItemId: number;

    apiRequest({ method: 'DELETE', url: '/api/cart', headers })
      .then((response) => {
        expect(response.status).to.eq(200);
        return apiRequest({
          method: 'POST',
          url: '/api/products',
          headers,
          body: {
            name: `cypress-api-cart-${Date.now()}`,
            description: 'Controlled Cypress API cart lifecycle product.',
            price: 19.95,
            stock: 5,
            category: 'Sample',
          },
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        cleanupProductId = (response.body as { data: { id: number } }).data.id;
        return apiRequest({
          method: 'POST',
          url: '/api/cart',
          headers,
          body: { product_id: cleanupProductId, quantity: 1 },
        });
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        cartItemId = (response.body as { data: { id: number } }).data.id;
        return apiRequest({
          method: 'PATCH',
          url: `/api/cart/${cartItemId}`,
          headers,
          body: { quantity: 2 },
        });
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect((response.body as { data: { quantity: number } }).data.quantity).to.eq(2);
        return apiRequest({
          method: 'PATCH',
          url: `/api/cart/${cartItemId}`,
          headers,
          body: { quantity: 0 },
        });
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        return apiRequest({
          method: 'GET',
          url: `/api/cart/${cartItemId}`,
          headers,
        });
      })
      .then((response) => {
        expect(response.status).to.eq(404);
      });
  });

  for (const [id, title, method, path, expected, configuredBody, publicRequest, override] of cases) {
    it(`[${id}] ${title}`, function () {
      let body = configuredBody;
      if (id === 'API-AUTH-001') {
        const password = Cypress.env('uiPassword') as string | undefined;
        if (!password) this.skip();
        body = { email: environment.uiEmail(), password };
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!publicRequest) headers.Authorization = `Bearer ${environment.apiKey()}`;
      if (override) headers['X-HTTP-Method-Override'] = 'QUERY';
      apiRequest({ method, url: path, body, headers }).then((response) => {
        expect(expected).to.include(response.status);
        if (id === 'API-GQL-002') {
          expect((response.body as { errors: unknown[] }).errors).to.have.length.greaterThan(0);
        }
        if (id === 'API-QUERY-004') expect(response.headers.allow).to.contain('QUERY');
      });
    });
  }
});
