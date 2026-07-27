import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const projects = [
  'python-playwright',
  'typescript-playwright',
  'java-selenium-rest-assured',
  'typescript-cypress',
];
const layers = ['tests/ui', 'tests/api', 'pages', 'services', 'fixtures', 'helpers', 'data', 'config'];
const scenarios = [
  ['tests/ui', 'product_purchase_traceability'],
  ['tests/ui', 'playground_flaky'],
  ['tests/api', 'product_crud'],
];
const scenarioFiles = {
  'python-playwright': {
    product_purchase_traceability: 'tests/ui/test_product_purchase_traceability.py',
    playground_flaky: 'tests/ui/test_playground_flaky.py',
    product_crud: 'tests/api/test_product_crud.py',
  },
  'typescript-playwright': {
    product_purchase_traceability: 'tests/ui/product_purchase_traceability.spec.ts',
    playground_flaky: 'tests/ui/playground_flaky.spec.ts',
    product_crud: 'tests/api/product_crud.spec.ts',
  },
  'java-selenium-rest-assured': {
    product_purchase_traceability: 'tests/ui/ProductPurchaseTraceabilityTest.java',
    playground_flaky: 'tests/ui/PlaygroundFlakyTest.java',
    product_crud: 'tests/api/ProductCrudTest.java',
  },
  'typescript-cypress': {
    product_purchase_traceability: 'tests/ui/product_purchase_traceability.spec.ts',
    playground_flaky: 'tests/ui/playground_flaky.spec.ts',
    product_crud: 'tests/api/product_crud.spec.ts',
  },
};
const storyLabels = {
  product_purchase_traceability: 'BOOK-TEST-UI-001 - Product purchase traceability',
  playground_flaky: 'BOOK-TEST-UI-002 - Flaky test triage',
  product_crud: 'BOOK-TEST-API-001 - Product CRUD',
};

/**
 * The step catalog every framework must declare so the four Allure reports show the
 * same titles and the same step names. Documented in docs/cap5_CATALOGO_pasos_allure.md.
 */
const stepCatalogFiles = {
  'python-playwright': 'helpers/steps.py',
  'typescript-playwright': 'helpers/steps.ts',
  'java-selenium-rest-assured': 'helpers/Steps.java',
  'typescript-cypress': 'helpers/steps.ts',
};

const titles = [
  '[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history',
  '[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed',
  '[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup',
];

const scenarioSteps = [
  'Setup: clear the shopping cart',
  'Setup: create the product through the API',
  'When: user opens the product in the store',
  'Then: inventory shows full stock without reservations',
  'When: user adds the product to the cart',
  'Then: inventory reserves the purchased quantity',
  'When: user opens the cart',
  'Then: cart shows the product, quantity and subtotal',
  'When: user proceeds to checkout',
  'When: user places the order',
  'When: user reopens the product in the store',
  'Then: inventory reflects the confirmed purchase',
  'When: user opens the order history',
  'Then: order history shows the paid order',
  'Then: order history modal fits the mobile viewport',
  'Teardown: delete the order, cart and product',
  'Given: playground is open with the fixed seed',
  'Then: seed display confirms the fixed seed',
  'When: user triggers the fast success scenario',
  'Then: invoice modal confirms the seeded run',
  'When: client creates a product',
  'Then: created product exposes full permissions',
  'When: client reads the product by id',
  'Then: read product matches the created name',
  'When: client updates price and stock',
  'Then: updated product returns the new price and stock',
  'Teardown: delete the product',
];

const actionSteps = [
  'Store: open the store page',
  'Store: search for the product',
  'Store: read the inventory modal',
  'Store: click add to cart and wait for the cart response',
  'Store: verify the reserved badge',
  'Store: open the order history modal',
  'Store: verify the order history row',
  'Store: verify the modal fits the mobile viewport',
  'Cart: open the cart page',
  'Cart: verify item, quantity and subtotal',
  'Cart: click proceed to checkout',
  'Checkout: fill the testing payment details',
  'Checkout: submit the order and read the order id',
  'Playground: open the playground with a seeded run',
  'Playground: verify the seed display',
  'Playground: trigger the fast success scenario',
  'Playground: verify the invoice modal',
  'API: DELETE /api/cart',
  'API: POST /api/products',
  'API: GET /api/products/{id}',
  'API: PATCH /api/products/{id}',
  'API: DELETE /api/products/{id}',
  'API: DELETE /api/orders/{id}',
];

const catalog = [...titles, ...scenarioSteps, ...actionSteps];

const failures = [];
for (const project of projects) {
  const base = join(root, 'frameworks', project);
  for (const layer of layers) {
    if (!existsSync(join(base, layer))) failures.push(`${project}: missing ${layer}`);
  }

  const readme = join(base, 'README.md');
  const envExample = join(base, '.env.example');
  if (!existsSync(readme)) failures.push(`${project}: missing README.md`);
  if (!existsSync(envExample)) failures.push(`${project}: missing .env.example`);

  for (const [directory, scenario] of scenarios) {
    const manifest = join(base, directory, '.scenario-manifest');
    if (!existsSync(manifest) || !readFileSync(manifest, 'utf8').split(/\r?\n/).includes(scenario)) {
      failures.push(`${project}: ${scenario} is not registered in ${directory}`);
    }

    const testPath = join(base, scenarioFiles[project][scenario]);
    const source = existsSync(testPath) ? readFileSync(testPath, 'utf8') : '';
    if (!source.includes(storyLabels[scenario])) {
      failures.push(`${project}: ${scenario} does not declare its shared Allure story`);
    }
  }

  const catalogPath = join(base, stepCatalogFiles[project]);
  if (!existsSync(catalogPath)) {
    failures.push(`${project}: missing step catalog ${stepCatalogFiles[project]}`);
    continue;
  }

  // Java wraps long literals across lines, so compare against the concatenated source.
  const declared = readFileSync(catalogPath, 'utf8').replace(/"\s*\+\s*\n\s*"/g, '');
  for (const entry of catalog) {
    if (!declared.includes(entry)) {
      failures.push(`${project}: step catalog does not declare "${entry}"`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  'All four frameworks share the required layers, teaching scenarios and the ' +
    `${catalog.length} entry report catalog.`,
);
