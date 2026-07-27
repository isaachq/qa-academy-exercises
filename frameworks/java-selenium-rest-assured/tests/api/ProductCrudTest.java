package tests.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import data.TestData;
import helpers.Steps;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import services.ProductService;

@Epic("Chapter 5")
@Feature("REST API")
@Story("Product CRUD")
class ProductCrudTest {
    @Test
    @DisplayName(Steps.Titles.PRODUCT_CRUD)
    void createsReadsUpdatesAndDeletesAProduct() {
        ProductService service = new ProductService();
        Integer productId = null;
        try {
            Map<String, Object> created = Steps.stepReturning(Steps.Scenario.CREATE_PRODUCT,
                    () -> service.createProduct(
                            ProductService.newProduct(UniqueName.product(), TestData.PRODUCT)));
            productId = ((Number) created.get("id")).intValue();
            int finalProductId = productId;

            Steps.step(Steps.Scenario.ASSERT_CREATED_PRODUCT,
                    () -> assertEquals("ALL", created.get("permissions")));

            Map<String, Object> read = Steps.stepReturning(Steps.Scenario.READ_PRODUCT,
                    () -> service.getProduct(finalProductId));

            Steps.step(Steps.Scenario.ASSERT_READ_PRODUCT,
                    () -> assertEquals(created.get("name"), read.get("name")));

            Map<String, Object> updated = Steps.stepReturning(Steps.Scenario.UPDATE_PRODUCT,
                    () -> service.updateProduct(finalProductId,
                            Map.of("price", 59.95, "stock", 12)));

            Steps.step(Steps.Scenario.ASSERT_UPDATED_PRODUCT, () -> {
                assertEquals(59.95, ((Number) updated.get("price")).doubleValue(), 0.001);
                assertEquals(12, ((Number) updated.get("stock")).intValue());
            });
        } finally {
            Integer createdProductId = productId;
            Steps.step(Steps.Scenario.TEARDOWN_PRODUCT, () -> {
                if (createdProductId != null) service.deleteProduct(createdProductId);
            });
        }
    }
}
