import { test as base, expect } from '@playwright/test';
import { environment } from '../config/environment.js';
import { ProductService } from '../services/product_service.js';
import { OrderService } from '../services/order_service.js';

type Fixtures = {
  productService: ProductService;
  orderService: OrderService;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript(
      ({ apiKey, email }) => {
        localStorage.setItem('api_token', apiKey);
        localStorage.setItem('user_email', email);
        localStorage.setItem('qa-academy-terms-consent-v1', 'accepted');
      },
      { apiKey: environment.apiKey, email: environment.uiEmail },
    );
    await use(page);
  },
  productService: async ({ request }, use, testInfo) => {
    await use(new ProductService(request, testInfo));
  },
  orderService: async ({ request, productService }, use, testInfo) => {
    await use(new OrderService(request, productService, testInfo));
  },
});

export { expect };
