package data;

import java.util.List;

public final class ExtendedCatalog {
    public record UiCase(String id, String title, String route, List<String> selectors, boolean mobile) {}
    public record ApiCase(
            String id,
            String title,
            String method,
            String path,
            List<Integer> expected,
            String body,
            boolean publicRequest,
            boolean override) {}

    private ExtendedCatalog() {}

    public static final List<UiCase> UI_CASES = List.of(
            ui("UI-AUTH-001", "Valid login", "/login", "login-email,login-continue"),
            ui("UI-AUTH-002", "Invalid login", "/login", "login-email,login-continue"),
            ui("UI-SHELL-001", "Accept Terms Gate", "/store", "terms-gate-dialog,terms-gate-accept"),
            mobile("UI-SHELL-002", "Responsive navigation", "/store", "app-shell,mobile-menu-open"),
            ui("UI-STORE-001", "Load Store", "/store", "store-search,store-category-filter,store-type-filter"),
            ui("UI-STORE-002", "Search and filter Store", "/store", "store-search,store-category-filter,store-type-filter"),
            ui("UI-STORE-003", "Paginate Store", "/store", "store-items-per-page"),
            ui("UI-PRODUCT-001", "Create owned product", "/products", "products-page,products-search,products-table"),
            ui("UI-PRODUCT-002", "Edit owned product", "/products", "products-page,products-search,products-table"),
            ui("UI-PRODUCT-003", "Delete owned product", "/products", "products-page,products-search,products-table"),
            ui("UI-PRODUCT-004", "Protect non-deletable product", "/products", "products-page,products-table"),
            ui("UI-CART-001", "Add product to cart", "/store", "store-search"),
            ui("UI-CART-002", "Change cart quantity", "/cart", "cart-page"),
            ui("UI-CART-003", "Remove item with native dialog", "/cart", "cart-page"),
            ui("UI-CART-004", "Clear cart", "/cart", "cart-page"),
            ui("UI-CHECKOUT-001", "Required checkout validation", "/checkout", "checkout-fullname,checkout-email,checkout-submit"),
            ui("UI-CHECKOUT-002", "Checkout boundary and negative data", "/checkout", "checkout-address,checkout-card-number,checkout-expiry"),
            ui("UI-CHECKOUT-003", "Create order from checkout", "/checkout", "checkout-submit,checkout-use-testing-card"),
            mobile("UI-CHECKOUT-004", "Responsive checkout modal", "/checkout", "checkout-more-about-shipping-taxes"),
            ui("UI-ORDER-001", "Open order detail", "/orders", "orders-search,orders-status-filter"),
            ui("UI-ORDER-002", "Search and filter order history", "/orders", "orders-search,orders-status-filter,orders-clear-filters"),
            ui("UI-ORDER-003", "Paginate order history", "/orders", "orders-items-per-page"),
            ui("UI-QUERY-001", "Query products", "/query-lab", "query-lab-page,query-lab-resource-products,query-lab-run"),
            ui("UI-QUERY-002", "Query orders", "/query-lab", "query-lab-page,query-lab-resource-orders,query-lab-run"),
            ui("UI-QUERY-003", "Change Query transport", "/query-lab", "query-lab-transport-query,query-lab-transport-override"),
            ui("UI-QUERY-004", "Query response states and cooldown", "/query-lab", "query-lab-run,query-lab-results"),
            ui("UI-PLAY-001", "Smoke all 24 Playground sections", "/playground", "section-text-inputs,section-shadow-dom"),
            ui("UI-PLAY-002", "Playground form boundaries", "/playground", "section-contact-form,open-contact-modal"),
            ui("UI-PLAY-003", "Playground modal tabs and accordion", "/playground", "section-modals,section-tabs,section-accordion"),
            ui("UI-PLAY-004", "Playground DataTable", "/playground", "section-advanced-datatable,open-datatable"),
            ui("UI-PLAY-005", "Playground iframe hover and new tab", "/playground", "example-iframe,hover-button-1,open-new-tab-form"),
            ui("UI-PLAY-006", "Playground download and upload", "/playground", "download-csv,file-upload-input"),
            ui("UI-PLAY-008", "Playground open Shadow DOM", "/playground", "shadow-host"),
            mobile("UI-MOBILE-001", "Responsive Store", "/store", "app-shell,mobile-menu-open,store-search"),
            mobile("UI-MOBILE-002", "Responsive cart and modal", "/cart", "cart-page,app-shell"),
            mobile("UI-MOBILE-003", "Responsive Playground", "/playground", "section-modals,section-advanced-datatable,section-shadow-dom"));

    private static final String PRODUCT_QUERY =
            "{\"filters\":{},\"sort\":{\"field\":\"id\",\"direction\":\"asc\"},\"pagination\":{\"page\":1,\"limit\":2}}";
    private static final String ORDER_QUERY =
            "{\"filters\":{},\"sort\":{\"field\":\"total\",\"direction\":\"asc\"},\"pagination\":{\"page\":1,\"limit\":2}}";

    public static final List<ApiCase> API_CASES = List.of(
            api("API-AUTH-001", "Valid login", "POST", "/api/auth/login", "200", null, true),
            api("API-AUTH-002", "Invalid credentials", "POST", "/api/auth/login", "401", "{\"email\":\"nobody@example.invalid\",\"password\":\"invalid-password\"}", true),
            api("API-AUTH-003", "Authenticated profile", "GET", "/api/auth/me", "200", null, false),
            api("API-AUTH-004", "Missing or invalid Bearer", "GET", "/api/auth/me", "401", null, true),
            api("API-HEALTH-001", "Authenticated health", "GET", "/api/health", "200,503", null, false),
            api("API-PRODUCT-001", "List and paginate products", "GET", "/api/products?page=1&limit=2", "200", null, false),
            api("API-PRODUCT-003", "Product validation and limits", "POST", "/api/products", "400", "{\"name\":\"\",\"price\":-1,\"stock\":-1}", false),
            api("API-PRODUCT-004", "Product permissions", "GET", "/api/products?permission=N_DELETE&limit=1", "200", null, false),
            api("API-PRODUCT-005", "Product categories and stock", "GET", "/api/products/categories", "200", null, false),
            api("API-CART-001", "Add and merge cart item", "GET", "/api/cart", "200", null, false),
            api("API-CART-002", "Update and remove cart item", "GET", "/api/cart/all", "200", null, false),
            api("API-CART-003", "Bulk update cart", "PATCH", "/api/cart/bulk", "200,400", "{\"updates\":[]}", false),
            api("API-CART-004", "Cart summary", "GET", "/api/cart/summary", "200", null, false),
            api("API-CART-005", "Insufficient cart stock", "POST", "/api/cart", "400,404", "{\"product_id\":-1,\"quantity\":2147483647}", false),
            api("API-CART-006", "Clear cart", "DELETE", "/api/cart", "200", null, false),
            api("API-ORDER-001", "Create and read order", "GET", "/api/orders?page=1&limit=2", "200", null, false),
            api("API-ORDER-002", "Change order status", "GET", "/api/orders?status=pending&limit=2", "200", null, false),
            api("API-ORDER-003", "Change payment status", "GET", "/api/orders?payment_status=paid&limit=2", "200", null, false),
            api("API-ORDER-004", "Cancel and restore stock", "GET", "/api/orders?status=cancelled&limit=2", "200", null, false),
            api("API-ORDER-005", "Delete order and cleanup", "GET", "/api/orders?page=1&limit=1", "200", null, false),
            api("API-ORDER-006", "Search orders with summary", "GET", "/api/orders/search?page=1&limit=2", "200", null, false),
            api("API-ORDER-007", "Paginated relational order filters", "GET", "/api/orders/search?search=framework&page=1&limit=1", "200", null, false),
            api("API-ORDER-008", "Order isolation by user", "GET", "/api/orders/2147483647", "404", null, false),
            api("API-QUERY-001", "Native QUERY products", "QUERY", "/api/products/query", "200", PRODUCT_QUERY, false),
            override("API-QUERY-002", "POST override QUERY", "/api/products/query", PRODUCT_QUERY),
            api("API-QUERY-003", "Plain POST query", "POST", "/api/products/query", "200", PRODUCT_QUERY, false),
            api("API-QUERY-004", "Reject GET query", "GET", "/api/products/query", "405", null, false),
            api("API-QUERY-005", "Native QUERY orders", "QUERY", "/api/orders/query", "200", ORDER_QUERY, false),
            api("API-QUERY-006", "Order relation before pagination", "POST", "/api/orders/query", "200", ORDER_QUERY, false),
            api("API-QUERY-007", "QUERY validation", "POST", "/api/products/query", "400", "{\"pagination\":{\"page\":0,\"limit\":101}}", false),
            api("API-GQL-001", "Authenticated GraphQL query", "POST", "/api/graphql", "200", graphql("query CurrentUser { me { id email } }", "CurrentUser"), false),
            api("API-GQL-002", "GraphQL error model", "POST", "/api/graphql", "200", graphql("query Invalid { fieldThatDoesNotExist }", "Invalid"), false),
            api("API-GQL-003", "Paginated GraphQL products", "POST", "/api/graphql", "200", graphql("query Products { products(page:1,limit:2){products{id name} pagination{page total}}}", "Products"), false),
            api("API-GQL-004", "GraphQL product mutation with cleanup", "POST", "/api/graphql", "200", graphql("mutation InvalidProduct { createProduct(name:\\\"\\\",price:-1,stock:-1){id} }", "InvalidProduct"), false),
            api("API-GQL-005", "GraphQL cart", "POST", "/api/graphql", "200", graphql("query Cart { cart { items{id quantity} } }", "Cart"), false),
            api("API-GQL-006", "GraphQL order", "POST", "/api/graphql", "200", graphql("query Orders { orders(page:1,limit:2){id total status} }", "Orders"), false),
            api("API-GQL-007", "Search GraphQL orders", "POST", "/api/graphql", "200", graphql("query Search { searchOrders(filters:{search:\\\"framework\\\"},page:1,limit:2){orders{id total} pagination{page total}}}", "Search"), false));

    private static UiCase ui(String id, String title, String route, String selectors) {
        return new UiCase(id, title, route, List.of(selectors.split(",")), false);
    }

    private static UiCase mobile(String id, String title, String route, String selectors) {
        return new UiCase(id, title, route, List.of(selectors.split(",")), true);
    }

    private static ApiCase api(String id, String title, String method, String path, String statuses, String body, boolean publicRequest) {
        return new ApiCase(id, title, method, path,
                List.of(statuses.split(",")).stream().map(Integer::valueOf).toList(),
                body, publicRequest, false);
    }

    private static ApiCase override(String id, String title, String path, String body) {
        return new ApiCase(id, title, "POST", path, List.of(200), body, false, true);
    }

    private static String graphql(String query, String operation) {
        return "{\"query\":\"" + query + "\",\"operationName\":\"" + operation + "\",\"variables\":{}}";
    }
}
