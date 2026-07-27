import * as allure from 'allure-js-commons';
import { teachingData } from '../../data/test_data';
import { uniqueProductName } from '../../helpers/unique_name';
import { ProductService } from '../../services/product_service';

describe('REST product CRUD', () => {
  const service = new ProductService();
  let productId: number | undefined;

  beforeEach(() => { productId = undefined; });
  afterEach(() => {
    if (productId) service.deleteProduct(productId);
  });

  it('creates, reads, updates and deletes a product', () => {
    allure.epic('Chapter 5');
    allure.feature('REST API');
    allure.story('Product CRUD');
    service.createProduct({ name: uniqueProductName(), ...teachingData.product }).then((created) => {
      productId = created.id;
      expect(created.permissions).to.eq('ALL');
      return service.getProduct(created.id);
    }).then((read) => {
      expect(read.id).to.eq(productId);
      return service.updateProduct(productId!, { price: 59.95, stock: 12 });
    }).then((updated) => {
      expect(Number(updated.price)).to.eq(59.95);
      expect(updated.stock).to.eq(12);
    });
  });
});
