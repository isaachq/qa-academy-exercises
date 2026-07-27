import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { STEPS, TITLES, step } from '../../helpers/steps.js';
import { uniqueProductName } from '../../helpers/unique_name.js';
import type { Product } from '../../services/product_service.js';

test(TITLES.productCrud, async ({ productService }) => {
  await allure.epic('Chapter 5');
  await allure.feature('REST API');
  await allure.story('BOOK-TEST-API-001 - Product CRUD');

  let created: Product | undefined;
  try {
    created = await step(STEPS.createProduct, () =>
      productService.createProduct({
        name: uniqueProductName('typescript-playwright'),
        ...teachingData.product,
      }),
    );

    await step(STEPS.assertCreatedProduct, async () => {
      expect(created!.permissions).toBe('ALL');
    });

    const read = await step(STEPS.readProduct, () => productService.getProduct(created!.id));

    await step(STEPS.assertReadProduct, async () => {
      expect(read.name).toBe(created!.name);
    });

    const updated = await step(STEPS.updateProduct, () =>
      productService.updateProduct(created!.id, { price: 59.95, stock: 12 }),
    );

    await step(STEPS.assertUpdatedProduct, async () => {
      expect(Number(updated.price)).toBe(59.95);
      expect(updated.stock).toBe(12);
    });
  } finally {
    await step(STEPS.teardownProduct, async () => {
      if (created) await productService.deleteProduct(created.id);
    });
  }
});
