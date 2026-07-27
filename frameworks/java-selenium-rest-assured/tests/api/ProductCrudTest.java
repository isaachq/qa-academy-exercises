package tests.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import data.TestData;
import helpers.UniqueName;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.util.Map;
import org.junit.jupiter.api.Test;
import services.ProductService;

@Epic("Chapter 5")
@Feature("REST API")
@Story("Product CRUD")
class ProductCrudTest {
    @Test
    void createsReadsUpdatesAndDeletesAProduct() {
        ProductService service = new ProductService();
        Integer productId = null;
        try {
            Map<String, Object> created = service.createProduct(
                    ProductService.newProduct(UniqueName.product(), TestData.PRODUCT));
            productId = ((Number) created.get("id")).intValue();
            assertEquals("ALL", created.get("permissions"));
            assertEquals(created.get("name"), service.getProduct(productId).get("name"));
            Map<String, Object> updated =
                    service.updateProduct(productId, Map.of("price", 59.95, "stock", 12));
            assertEquals(59.95, ((Number) updated.get("price")).doubleValue(), 0.001);
            assertEquals(12, ((Number) updated.get("stock")).intValue());
        } finally {
            if (productId != null) service.deleteProduct(productId);
        }
    }
}
