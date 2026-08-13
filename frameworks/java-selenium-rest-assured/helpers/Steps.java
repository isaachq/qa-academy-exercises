package helpers;

import io.qameta.allure.Allure;

/**
 * Canonical report vocabulary shared by the four teaching frameworks.
 *
 * <p>Any change here must be mirrored in the other three projects and in
 * docs/cap5_CATALOGO_pasos_allure.md.
 */
public final class Steps {
    private Steps() {}

    /** Canonical test titles. */
    public static final class Titles {
        public static final String PRODUCT_PURCHASE_TRACEABILITY =
                "[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history";
        public static final String PLAYGROUND_FLAKY =
                "[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed";
        public static final String PRODUCT_CRUD =
                "[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup";

        private Titles() {}
    }

    /** Scenario level steps. One step per navigation, action or assertion block. */
    public static final class Scenario {
        public static final String SETUP_CLEAR_CART = "Setup: clear the shopping cart";
        public static final String SETUP_CREATE_PRODUCT =
                "Setup: create the product through the API";
        public static final String OPEN_PRODUCT = "When: user opens the product in the store";
        public static final String ASSERT_INITIAL_INVENTORY =
                "Then: inventory shows full stock without reservations";
        public static final String ADD_TO_CART = "When: user adds the product to the cart";
        public static final String ASSERT_RESERVED_INVENTORY =
                "Then: inventory reserves the purchased quantity";
        public static final String OPEN_CART = "When: user opens the cart";
        public static final String ASSERT_CART_CONTENT =
                "Then: cart shows the product, quantity and subtotal";
        public static final String PROCEED_TO_CHECKOUT = "When: user proceeds to checkout";
        public static final String PLACE_ORDER = "When: user places the order";
        public static final String REOPEN_PRODUCT = "When: user reopens the product in the store";
        public static final String ASSERT_PURCHASED_INVENTORY =
                "Then: inventory reflects the confirmed purchase";
        public static final String OPEN_ORDER_HISTORY = "When: user opens the order history";
        public static final String ASSERT_ORDER_HISTORY = "Then: order history shows the paid order";
        public static final String ASSERT_MOBILE_MODAL =
                "Then: order history modal fits the mobile viewport";
        public static final String TEARDOWN_PURCHASE =
                "Teardown: delete the order, cart and product";

        public static final String OPEN_PLAYGROUND = "Given: playground is open with the fixed seed";
        public static final String ASSERT_SEED = "Then: seed display confirms the fixed seed";
        public static final String TRIGGER_FAST_SUCCESS =
                "When: user triggers the fast success scenario";
        public static final String ASSERT_INVOICE_MODAL =
                "Then: invoice modal confirms the seeded run";

        public static final String CREATE_PRODUCT = "When: client creates a product";
        public static final String ASSERT_CREATED_PRODUCT =
                "Then: created product exposes full permissions";
        public static final String READ_PRODUCT = "When: client reads the product by id";
        public static final String ASSERT_READ_PRODUCT =
                "Then: read product matches the created name";
        public static final String UPDATE_PRODUCT = "When: client updates price and stock";
        public static final String ASSERT_UPDATED_PRODUCT =
                "Then: updated product returns the new price and stock";
        public static final String TEARDOWN_PRODUCT = "Teardown: delete the product";

        private Scenario() {}
    }

    /** Nested steps emitted by page objects and services. */
    public static final class Actions {
        public static final String STORE_OPEN = "Store: open the store page";
        public static final String STORE_SEARCH = "Store: search for the product";
        public static final String STORE_READ_INVENTORY = "Store: read the inventory modal";
        public static final String STORE_ADD_TO_CART =
                "Store: click add to cart and wait for the cart response";
        public static final String STORE_VERIFY_RESERVED = "Store: verify the reserved badge";
        public static final String STORE_OPEN_ORDER_HISTORY =
                "Store: open the order history modal";
        public static final String STORE_VERIFY_ORDER_ROW = "Store: verify the order history row";
        public static final String STORE_VERIFY_MOBILE_MODAL =
                "Store: verify the modal fits the mobile viewport";

        public static final String CART_OPEN = "Cart: open the cart page";
        public static final String CART_VERIFY_ITEM = "Cart: verify item, quantity and subtotal";
        public static final String CART_CHECKOUT = "Cart: click proceed to checkout";

        public static final String CHECKOUT_FILL = "Checkout: fill the testing payment details";
        public static final String CHECKOUT_SUBMIT =
                "Checkout: submit the order and read the order id";

        public static final String PLAYGROUND_OPEN =
                "Playground: open the playground with a seeded run";
        public static final String PLAYGROUND_VERIFY_SEED = "Playground: verify the seed display";
        public static final String PLAYGROUND_TRIGGER =
                "Playground: trigger the fast success scenario";
        public static final String PLAYGROUND_VERIFY_INVOICE = "Playground: verify the invoice modal";

        public static final String API_CLEAR_CART = "API: DELETE /api/cart";
        public static final String API_CREATE_PRODUCT = "API: POST /api/products";
        public static final String API_GET_PRODUCT = "API: GET /api/products/{id}";
        public static final String API_UPDATE_PRODUCT = "API: PATCH /api/products/{id}";
        public static final String API_DELETE_PRODUCT = "API: DELETE /api/products/{id}";
        public static final String API_DELETE_ORDER = "API: DELETE /api/orders/{id}";

        private Actions() {}
    }

    /** Body of a step that produces no value. */
    @FunctionalInterface
    public interface Action {
        void run();
    }

    /** Body of a step that produces a value. */
    @FunctionalInterface
    public interface Result<T> {
        T get();
    }

    /**
     * Runs a body inside a reported step so Allure shows where a failure happened instead of
     * collapsing the whole scenario into a single block.
     */
    public static void step(String name, Action action) {
        Allure.step(name, action::run);
    }

    /** Same as {@link #step(String, Action)} for bodies that return a value. */
    public static <T> T stepReturning(String name, Result<T> result) {
        return Allure.step(name, result::get);
    }
}
