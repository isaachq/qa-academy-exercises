# Chapter 5: Complete UI and API Test Catalog

> Specification and catalog documentation for the four automation framework projects in `qa-academy-exercises`.
>
> Python/Playwright, TypeScript/Playwright, and Java/Selenium + REST Assured implement the full catalog (73 extended + 4 Book scenarios). Cypress implements the same architecture with the designated Cypress demo subset.

## 1. Catalog Rules

- A single Test ID represents the identical testing intent across all frameworks.
- Syntax and runner logic adapt per language; preconditions, assertions, and teardown cleanup remain strictly identical.
- All code, test names, descriptions, comments, step labels, configuration files, README files, and logs MUST be in English.
- Each test case generates unique dynamic test data and executes teardown cleanup regardless of test outcome.
- API authentication uses `API_KEY`; UI tests prepare state via `localStorage`, except dedicated authentication test cases.
- `orders.total` is the persistent database field. `total_amount` is used solely as a summary aggregate.
- **JUnit 5 Method Granularity Note**: All 4 frameworks cover 100% identical business scenarios. While Playwright (`page.route()`) and Cypress (`cy.intercept()`) combine network mock states in `UI-QUERY-004` into a single test block (74 extended / 78 total), Java Selenium WebDriver splits these deterministic Query Lab sub-states into explicit JUnit 5 `@Test` methods (`QueryLabMobileTest.java`), resulting in 77 extended / 81 total test method executions with zero reliance on network interception mocks.

## 2. Book Scenarios

Every framework implements the core teaching scenarios:

1. **`BOOK-TEST-UI-001` — Product Purchase Traceability (Desktop)**
   - Clear shopping cart via API setup.
   - Create a unique product and record initial stock.
   - Open stock tracker and assert initial inventory (`stock`, `reserved = 0`, `available`).
   - Add product to cart and verify `reserved` increases while `available` decreases.
   - Open cart, verify item name, quantity, and subtotal.
   - Complete checkout and capture `orderId`.
   - Re-open product stock tracker and assert stock deducted (`stock - qty`).
   - Open Order History modal and verify order ID, status (`paid`), and total.
   - Perform teardown cleanup (delete order, clear cart, delete product).

2. **`BOOK-TEST-UI-001-MOBILE` — Product Purchase Traceability (Mobile Viewport)**
   - Executes the purchase traceability flow under mobile viewport emulation.
   - Asserts mobile modal contract (modal overlay fit, non-clipped close button, backdrop isolation).

3. **`BOOK-TEST-UI-002` — Playground Flakiness Triage**
   - Opens Playground with a fixed seed.
   - Verifies seed display.
   - Triggers fast success scenario.
   - Asserts invoice modal confirmation for seeded run.

4. **`BOOK-TEST-API-001` — Product REST CRUD Lifecycle**
   - POST `/api/products` — create unique product.
   - Assert permissions (`ALL`).
   - GET `/api/products/{id}` — read product and verify name.
   - PATCH `/api/products/{id}` — update price and stock.
   - DELETE `/api/products/{id}` — teardown cleanup.

---

## 3. Extended UI Catalog (36 Test Cases)

### Authentication & Shell
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-AUTH-001 | Valid login | Login granted, session token & user set | Yes |
| UI-AUTH-002 | Invalid credentials | Error message displayed, no auth state | No |
| UI-SHELL-001 | Terms Gate acceptance | Modal visible, consent persisted | No |
| UI-SHELL-002 | Responsive navigation | Mobile drawer and menu navigation | No |

### Store & Products
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-STORE-001 | Load store catalog | Products rendered, loading states resolved | Yes |
| UI-STORE-002 | Search and filter | Results match keyword and category filter | No |
| UI-STORE-003 | Pagination | Page numbers and product grid pagination | No |
| UI-PRODUCT-001 | Create product | Created product displayed with `ALL` permissions | No |
| UI-PRODUCT-002 | Edit product | Form updates persisted and displayed | No |
| UI-PRODUCT-003 | Delete product | Delete confirmation and list removal | No |
| UI-PRODUCT-004 | Protected product rule | Read-only / protected deletion rejected | No |

### Cart
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-CART-001 | Add product to cart | Badge badge count, item row, and subtotal | Yes |
| UI-CART-002 | Change quantity | Quantity update recalculates subtotal | No |
| UI-CART-003 | Delete item with dialog | Native confirm dialog intercepted & item removed | Yes |
| UI-CART-004 | Clear cart | Cart emptied and empty state rendered | No |

### Checkout & Orders
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-CHECKOUT-001 | Form validation | Required fields error summary | No |
| UI-CHECKOUT-002 | Boundary & invalid input | Card/address boundary validation | No |
| UI-CHECKOUT-003 | Submit order | Checkout succeeds, order ID returned | No |
| UI-CHECKOUT-004 | Responsive modal | Tax/shipping modal overlays mobile viewport | No |
| UI-ORDER-001 | View order details | Status, items, tax, shipping, and total matched | No |
| UI-ORDER-002 | Filter order history | History filtered by order status | No |
| UI-ORDER-003 | Order history pagination | Pagination controls and row counts | No |

### Query Lab
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-QUERY-001 | Query products | Transport metadata, table, and pagination | No |
| UI-QUERY-002 | Query orders | Sort uses `total`, summary aggregate uses `total_amount` | Yes |
| UI-QUERY-003 | Switch transport mode | Native `QUERY` vs `POST_OVERRIDE` reflected | No |
| UI-QUERY-004 | State feedback | Loading, empty, and error feedback | No |

### Playground
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-PLAY-001 | 24-section smoke test | All 24 section test IDs present | Yes |
| UI-PLAY-002 | Form & boundaries | Valid, invalid, and boundary inputs | No |
| UI-PLAY-003 | Modal, tabs & accordion | Open, tab switch, accordion expand | No |
| UI-PLAY-004 | DataTable | 100 base rows, sorting, filtering | Yes |
| UI-PLAY-005 | iframe, hover & new tab | Frame context switch and new window | No |
| UI-PLAY-006 | Download & upload | File download and mock upload status | No |
| UI-PLAY-008 | Open Shadow DOM | Input and submit inside `shadow-host` | Yes |

### Mobile Viewport
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| UI-MOBILE-001 | Store mobile layout | Responsive product grid and filters | No |
| UI-MOBILE-002 | Cart & modal mobile | Modal fit and scroll isolation | No |
| UI-MOBILE-003 | Playground mobile | Section layout on mobile viewport | No |

---

## 4. Extended API Catalog (37 Test Cases)

### Auth & Health
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-AUTH-001 | Valid authentication | Returns session/API token and user profile | No |
| API-AUTH-002 | Invalid credentials | 401 Unauthorized response | Yes |
| API-AUTH-003 | User profile (`GET /api/auth/me`) | Profile matches token identity | No |
| API-AUTH-004 | Missing/Invalid Bearer token | 401 Unauthorized | No |
| API-HEALTH-001 | System health | 200/503 health checks response | No |

### Products
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-PRODUCT-001 | List and paginate | Pagination headers and product list | No |
| API-PRODUCT-002 | Product CRUD lifecycle | Full create, read, update, delete | Yes |
| API-PRODUCT-003 | Validations & limits | Rejects negative price or excess stock | No |
| API-PRODUCT-004 | Product permissions | Read-only vs full permission enforcement | No |
| API-PRODUCT-005 | Categories & stock | Aggregates and stock consistency | No |

### Cart
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-CART-001 | Add and merge items | 201 Created, quantity merged | No |
| API-CART-002 | Update and remove item | PATCH quantity zero removes item | No |
| API-CART-003 | Bulk update | Mixed updates and response stats | No |
| API-CART-004 | Cart summary | Subtotal, tax, shipping, and total | Yes |
| API-CART-005 | Insufficient stock | 400 Bad Request on stock overflow | No |
| API-CART-006 | Clear cart | DELETE empty cart state | No |

### Orders
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-ORDER-001 | Create and fetch order | 201 Created with items and totals | No |
| API-ORDER-002 | Order status transitions | Valid status state machine transitions | No |
| API-ORDER-003 | Update payment | Payment state update & persistence | No |
| API-ORDER-004 | Cancel order & restore stock | Cancellation releases reserved stock | No |
| API-ORDER-005 | Delete order & cleanup | Order deletion & stock restoration | No |
| API-ORDER-006 | Search orders with summary | Filter by status, summary counts | Yes |
| API-ORDER-007 | Relational paginated filters | Search filters applied before total calculation | No |
| API-ORDER-008 | User data isolation | Cross-tenant access returns 403/404 | No |

### HTTP QUERY
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-QUERY-001 | Native `QUERY` products | `meta.transport === "QUERY"` | Yes |
| API-QUERY-002 | `POST_OVERRIDE` products | `meta.transport === "POST_OVERRIDE"` | No |
| API-QUERY-003 | Plain `POST` query | `meta.transport === "POST"` | No |
| API-QUERY-004 | `GET` on query endpoint | 405 Method Not Allowed with `Allow: QUERY, POST, OPTIONS` | No |
| API-QUERY-005 | Order `QUERY` | Sort uses `total`, summary uses `total_amount` | Yes |
| API-QUERY-006 | Relation before pagination | Search filter consistency across pages | No |
| API-QUERY-007 | Invalid query payload | 400 Bad Request on invalid fields | No |

### GraphQL
| ID | Title | Key Assertions | Cypress Demo |
|---|---|---|---|
| API-GQL-001 | Authenticated query | `me` query returns account details | No |
| API-GQL-002 | Error handling model | HTTP 200 with `errors` array handled as failure | Yes |
| API-GQL-003 | Paginated products query | `operationName`, variables, and nodes | No |
| API-GQL-004 | Product mutation & cleanup | Create, update, and delete product mutations | No |
| API-GQL-005 | Cart mutations | Add, update, and clear cart mutations | No |
| API-GQL-006 | Order mutation | Create and cancel order mutations | No |
| API-GQL-007 | Search orders query | Filters, pagination, and total fields | No |

---

## 5. Framework Test Execution Totals

| Project | Book Scenarios | Extended UI | Extended API | Total Test Executions |
|---|---:|---:|---:|---:|
| **`typescript-playwright`** | 4 | 36 | 37 | **77** |
| **`python-playwright`** | 4 | 36 | 37 | **77** |
| **`java-selenium-rest-assured`** | 4 | 36 | 37 | **77** |
| **`typescript-cypress`** | 4 | 9 | 7 | **20** |

---

## 6. Public Execution Policy

> [!NOTE]
> **Public Execution Policy:**
> - The **4 Book Scenarios** run cleanly without restrictions and can always be executed together.
> - Running all **73 extended scenarios** against hosted deployments simultaneously will cause traffic protection to throttle and challenge incoming requests, creating a **false perception of flaky tests**.
> - Public learners executing against hosted environments must execute extended tests **1 test at a time** (or small batches of 1–3 tests by ID).

