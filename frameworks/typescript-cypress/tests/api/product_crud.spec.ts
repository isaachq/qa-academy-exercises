import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { STEPS, TITLES, step } from '../../helpers/steps';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService, type Product } from '../../services/product_service';

describe('REST product CRUD', () => {
  const service = new ProductService();

  // Cypress aborts the command queue on the first failure, so the scenario keeps
  // its cleanup in a hook.
  let created: Product | undefined;
  let read: Product | undefined;
  let updated: Product | undefined;

  beforeEach(() => {
    created = undefined;
    read = undefined;
    updated = undefined;
  });

  afterEach(() => {
    step(STEPS.teardownProduct, () => {
      if (created) service.deleteProduct(created.id);
    });
  });

  it(TITLES.productCrud, () => {
    allure.epic('Chapter 5');
    allure.feature('REST API');
    allure.story('Product CRUD');

    step(STEPS.createProduct, () => {
      service
        .createProduct({ name: uniqueProductName(), ...teachingData.product })
        .then((product) => {
          created = product;
        });
    });

    step(STEPS.assertCreatedProduct, () => {
      expect(created!.permissions).to.eq('ALL');
    });

    step(STEPS.readProduct, () => {
      service.getProduct(created!.id).then((product) => {
        read = product;
      });
    });

    step(STEPS.assertReadProduct, () => {
      expect(read!.name).to.eq(created!.name);
    });

    step(STEPS.updateProduct, () => {
      service.updateProduct(created!.id, { price: 59.95, stock: 12 }).then((product) => {
        updated = product;
      });
    });

    step(STEPS.assertUpdatedProduct, () => {
      expect(Number(updated!.price)).to.eq(59.95);
      expect(updated!.stock).to.eq(12);
    });
  });
});
