package data;

import java.util.Map;

public final class TestData {
    public static final int PURCHASE_QUANTITY = 1;
    public static final long FLAKY_SEED = 42042L;
    public static final Map<String, Object> PRODUCT = Map.of(
            "description", "Created by the Java Selenium teaching framework.",
            "price", 49.95,
            "stock", 8,
            "category", "Sample"
    );

    private TestData() {}
}
