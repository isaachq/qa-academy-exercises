import { allure } from 'allure-playwright';
import { teachingData } from '../../data/test_data.js';
import { test, expect } from '../../fixtures/test.js';
import { uniqueProductName } from '../../helpers/unique_name.js';

test('creates, reads, updates and deletes a product', async ({ productService }) => {
  await allure.epic('Chapter 5');
  await allure.feature('REST API');
  await allure.story('Product CRUD');

  let productId: number | undefined;
  try {
    const created = await productService.createProduct({
      name: uniqueProductName('typescript-playwright'),
      ...teachingData.product,
    });
    productId = created.id;
    expect(created.permissions).toBe('ALL');

    const read = await productService.getProduct(productId);
    expect(read.name).toBe(created.name);

    const updated = await productService.updateProduct(productId, { price: 59.95, stock: 12 });
    expect(Number(updated.price)).toBe(59.95);
    expect(updated.stock).toBe(12);
  } finally {
    if (productId) await productService.deleteProduct(productId);
  }
});
