# Chapter 5 — Allure Step and Title Catalog

All four frameworks execute the same teaching scenarios. To make all four Allure reports comparable, all frameworks declare **the exact same titles and step names**, and every navigation, action, and assertion is reported as an independent step.

Without steps, an execution failure mid-test only states "the test failed". With this step catalog, the report indicates whether it failed during navigation, action execution, or result assertion, and which preceding steps passed.

## Catalog Location

Each project declares the complete catalog in its `helpers` layer:

| Project | File | Step API |
|---|---|---|
| `python-playwright` | `helpers/steps.py` | `with step(...)` over `allure.step` |
| `typescript-playwright` | `helpers/steps.ts` | `step(...)` over `test.step` |
| `java-selenium-rest-assured` | `helpers/Steps.java` | `Steps.step(...)` over `Allure.step` |
| `typescript-cypress` | `helpers/steps.ts` | `step(...)` over `allure.step` (command queue) |

## Test Titles

| ID | Scenario | Title |
|---|---|---|
| `BOOK-TEST-UI-001` | UI Traceability | `[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history` |
| `BOOK-TEST-UI-002` | UI Playground | `[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed` |
| `BOOK-TEST-API-001` | API CRUD | `[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup` |

## Scenario Steps

These are the top-level report steps. The prefix indicates the step role: `Setup`, `Given`, `When` (navigation or action), `Then` (assertion), and `Teardown`.

### `Product purchase traceability…`

```text
Setup: clear the shopping cart
Setup: create the product through the API
When: user opens the product in the store
Then: inventory shows full stock without reservations
When: user adds the product to the cart
Then: inventory reserves the purchased quantity
When: user opens the cart
Then: cart shows the product, quantity and subtotal
When: user proceeds to checkout
When: user places the order
When: user reopens the product in the store
Then: inventory reflects the confirmed purchase
When: user opens the order history
Then: order history shows the paid order
Then: order history modal fits the mobile viewport   (mobile profile only)
Teardown: delete the order, cart and product
```

### `Playground flakiness…`

```text
Given: playground is open with the fixed seed
Then: seed display confirms the fixed seed
When: user triggers the fast success scenario
Then: invoice modal confirms the seeded run
```

### `Product CRUD lifecycle…`

```text
When: client creates a product
Then: created product exposes full permissions
When: client reads the product by id
Then: read product matches the created name
When: client updates price and stock
Then: updated product returns the new price and stock
Teardown: delete the product
```

## Nested Steps

Page objects and services emit nested steps inside the scenario steps, ensuring the report separates "failed to reach page" from "page failed assertion".

```text
Store: open the store page
Store: search for the product
Store: read the inventory modal
Store: click add to cart and wait for the cart response
Store: verify the reserved badge
Store: open the order history modal
Store: verify the order history row
Store: verify the modal fits the mobile viewport

Cart: open the cart page
Cart: verify item, quantity and subtotal
Cart: click proceed to checkout

Checkout: fill the testing payment details
Checkout: submit the order and read the order id

Playground: open the playground with a seeded run
Playground: verify the seed display
Playground: trigger the fast success scenario
Playground: verify the invoice modal

API: DELETE /api/cart
API: POST /api/products
API: GET /api/products/{id}
API: PATCH /api/products/{id}
API: DELETE /api/products/{id}
API: DELETE /api/orders/{id}
```

## Failure Diagnosis Example

Real example of a failure triggered in an inventory assertion:

```text
Product purchase traceability…                              failed
  Setup: clear the shopping cart                            passed
  When: user opens the product in the store                 passed
    Store: open the store page                              passed
    Store: search for the product                           passed
  Then: inventory shows full stock without reservations     failed
```

Subsequent steps are not executed. The report clearly pinpoints that navigation succeeded and the failure occurred during verification.

## Rules for Modifying Steps

1. One step = one navigation, one action, or one assertion block. Never all three combined.
2. Names are static and written in English; dynamic values are passed as parameters or Allure attachments.
3. A Page Object method performs an action **or** a verification. If both are needed, split them (`open` / `expect…`, `fillTestingDetails` / `submitOrder`).
4. Any changes must be reflected across all framework `helpers` and this document in sync.
