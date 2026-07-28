import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const projects = [
  'python-playwright',
  'typescript-playwright',
  'java-selenium-rest-assured',
  'typescript-cypress',
];
const pendingUiIds = [
  'UI-AUTH-001', 'UI-AUTH-002', 'UI-SHELL-001', 'UI-SHELL-002',
  'UI-STORE-001', 'UI-STORE-002', 'UI-STORE-003',
  'UI-PRODUCT-001', 'UI-PRODUCT-002', 'UI-PRODUCT-003', 'UI-PRODUCT-004',
  'UI-CART-001', 'UI-CART-002', 'UI-CART-003', 'UI-CART-004',
  'UI-CHECKOUT-001', 'UI-CHECKOUT-002', 'UI-CHECKOUT-003', 'UI-CHECKOUT-004',
  'UI-ORDER-001', 'UI-ORDER-002', 'UI-ORDER-003',
  'UI-QUERY-001', 'UI-QUERY-002', 'UI-QUERY-003', 'UI-QUERY-004',
  'UI-PLAY-001', 'UI-PLAY-002', 'UI-PLAY-003', 'UI-PLAY-004', 'UI-PLAY-005',
  'UI-PLAY-006', 'UI-PLAY-008',
  'UI-MOBILE-001', 'UI-MOBILE-002', 'UI-MOBILE-003',
];
const pendingApiIds = [
  'API-AUTH-001', 'API-AUTH-002', 'API-AUTH-003', 'API-AUTH-004', 'API-HEALTH-001',
  'API-PRODUCT-001', 'API-PRODUCT-003', 'API-PRODUCT-004', 'API-PRODUCT-005',
  'API-CART-001', 'API-CART-002', 'API-CART-003', 'API-CART-004', 'API-CART-005',
  'API-CART-006',
  'API-ORDER-001', 'API-ORDER-002', 'API-ORDER-003', 'API-ORDER-004', 'API-ORDER-005',
  'API-ORDER-006', 'API-ORDER-007', 'API-ORDER-008',
  'API-QUERY-001', 'API-QUERY-002', 'API-QUERY-003', 'API-QUERY-004', 'API-QUERY-005',
  'API-QUERY-006', 'API-QUERY-007',
  'API-GQL-001', 'API-GQL-002', 'API-GQL-003', 'API-GQL-004', 'API-GQL-005',
  'API-GQL-006', 'API-GQL-007',
];
/**
 * Projects whose extended catalog is a set of real, runnable tests rather than a
 * declared list. They are validated by looking for one executable test per
 * traceability ID under `tests/`.
 */
const executableProjects = new Set([
  'typescript-playwright',
  'typescript-cypress',
  'python-playwright',
]);
/** Source extension and per-ID title pattern used to read an executable catalog. */
const executableSources = {
  'typescript-playwright': {
    extension: '.ts',
    // `test(` is Playwright's runner, `it(` is Cypress's; both must carry the
    // traceability ID as the first thing in the title.
    title: (id) => new RegExp(`(test|it)\\(\\s*['"\`]\\[${id}\\]`),
    markers: ['allure.feature(', 'allure.story(', 'step('],
  },
  'typescript-cypress': {
    extension: '.ts',
    title: (id) => new RegExp(`(test|it)\\(\\s*['"\`]\\[${id}\\]`),
    markers: ['allure.feature(', 'allure.story(', 'step('],
  },
  'python-playwright': {
    extension: '.py',
    // pytest takes the reported name from the `@allure.title` decorator.
    title: (id) => new RegExp(`allure\\.title\\(\\s*['"]\\[${id}\\]`),
    markers: ['allure.feature(', 'allure.story(', 'step('],
  },
};
const extendedCatalogFiles = {
  'java-selenium-rest-assured': ['data/ExtendedCatalog.java'],
};
const readFilesRecursively = (directory, extension) =>
  readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory()
        ? readFilesRecursively(path, extension)
        : path.endsWith(extension) ? [readFileSync(path, 'utf8')] : [];
    })
    .join('\n');
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

  const executable = executableProjects.has(project);
  const executableSource = executableSources[project];
  const extendedSource = executable
    ? readFilesRecursively(join(base, 'tests'), executableSource.extension)
    : extendedCatalogFiles[project]
      .map((file) => {
        const path = join(base, file);
        if (!existsSync(path)) {
          failures.push(`${project}: missing extended catalog ${file}`);
          return '';
        }
        return readFileSync(path, 'utf8');
      })
      .join('\n');
  for (const id of [...pendingUiIds, ...pendingApiIds]) {
    const declared = executable
      ? executableSource.title(id).test(extendedSource)
      : extendedSource.includes(id);
    if (!declared) {
      failures.push(`${project}: missing ${executable ? 'executable test' : 'extended catalog declaration'} for ${id}`);
    }
  }
  if (executable) {
    for (const marker of executableSource.markers) {
      if (!extendedSource.includes(marker)) {
        failures.push(`${project}: executable coverage does not declare ${marker}`);
      }
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
    `${catalog.length} entry report catalog. All four also declare the ` +
    `${pendingUiIds.length} pending UI and ${pendingApiIds.length} pending API cases.`,
);
