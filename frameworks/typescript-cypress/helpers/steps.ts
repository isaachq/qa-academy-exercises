import * as allure from 'allure-js-commons';

/**
 * Canonical test titles shared by the four teaching frameworks.
 * Any change here must be mirrored in the other three projects and in
 * docs/ch5_allure_step_catalog.md.
 */
export const TITLES = {
  productPurchaseTraceability:
    '[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history',
  playgroundFlaky: '[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed',
  productCrud: '[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup',
} as const;

/** Scenario level steps. One step per navigation, action or assertion block. */
export const STEPS = {
  setupClearCart: 'Setup: clear the shopping cart',
  setupCreateProduct: 'Setup: create the product through the API',
  openProduct: 'When: user opens the product in the store',
  assertInitialInventory: 'Then: inventory shows full stock without reservations',
  addToCart: 'When: user adds the product to the cart',
  assertReservedInventory: 'Then: inventory reserves the purchased quantity',
  openCart: 'When: user opens the cart',
  assertCartContent: 'Then: cart shows the product, quantity and subtotal',
  proceedToCheckout: 'When: user proceeds to checkout',
  placeOrder: 'When: user places the order',
  reopenProduct: 'When: user reopens the product in the store',
  assertPurchasedInventory: 'Then: inventory reflects the confirmed purchase',
  openOrderHistory: 'When: user opens the order history',
  assertOrderHistory: 'Then: order history shows the paid order',
  assertMobileModal: 'Then: order history modal fits the mobile viewport',
  teardownPurchase: 'Teardown: delete the order, cart and product',

  openPlayground: 'Given: playground is open with the fixed seed',
  assertSeed: 'Then: seed display confirms the fixed seed',
  triggerFastSuccess: 'When: user triggers the fast success scenario',
  assertInvoiceModal: 'Then: invoice modal confirms the seeded run',

  createProduct: 'When: client creates a product',
  assertCreatedProduct: 'Then: created product exposes full permissions',
  readProduct: 'When: client reads the product by id',
  assertReadProduct: 'Then: read product matches the created name',
  updateProduct: 'When: client updates price and stock',
  assertUpdatedProduct: 'Then: updated product returns the new price and stock',
  teardownProduct: 'Teardown: delete the product',
} as const;

/** Nested steps emitted by page objects and services. */
export const ACTIONS = {
  storeOpen: 'Store: open the store page',
  storeSearch: 'Store: search for the product',
  storeReadInventory: 'Store: read the inventory modal',
  storeAddToCart: 'Store: click add to cart and wait for the cart response',
  storeVerifyReserved: 'Store: verify the reserved badge',
  storeOpenOrderHistory: 'Store: open the order history modal',
  storeVerifyOrderRow: 'Store: verify the order history row',
  storeVerifyMobileModal: 'Store: verify the modal fits the mobile viewport',

  cartOpen: 'Cart: open the cart page',
  cartVerifyItem: 'Cart: verify item, quantity and subtotal',
  cartCheckout: 'Cart: click proceed to checkout',

  checkoutFill: 'Checkout: fill the testing payment details',
  checkoutSubmit: 'Checkout: submit the order and read the order id',

  playgroundOpen: 'Playground: open the playground with a seeded run',
  playgroundVerifySeed: 'Playground: verify the seed display',
  playgroundTrigger: 'Playground: trigger the fast success scenario',
  playgroundVerifyInvoice: 'Playground: verify the invoice modal',

  apiClearCart: 'API: DELETE /api/cart',
  apiCreateProduct: 'API: POST /api/products',
  apiGetProduct: 'API: GET /api/products/{id}',
  apiUpdateProduct: 'API: PATCH /api/products/{id}',
  apiDeleteProduct: 'API: DELETE /api/products/{id}',
  apiDeleteOrder: 'API: DELETE /api/orders/{id}',
} as const;

type Unwrapped<T> = T extends Cypress.Chainable<infer Value> ? Value : T;

/**
 * Runs a body inside a reported step so Allure shows where a failure happened
 * instead of collapsing the whole scenario into a single block.
 *
 * The Cypress runtime enqueues the step boundaries as commands, so every
 * `cy.*` command queued by the body is reported inside this step and the step
 * itself resolves as a regular chainable.
 */
export const step = <T>(name: string, body: () => T): Cypress.Chainable<Unwrapped<T>> =>
  allure.step(name, body) as unknown as Cypress.Chainable<Unwrapped<T>>;
