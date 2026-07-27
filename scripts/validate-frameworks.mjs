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
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('All four frameworks share the required layers and teaching scenarios.');
