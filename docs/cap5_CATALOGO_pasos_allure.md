# Capítulo 5 — Catálogo de pasos y títulos para Allure

Los cuatro frameworks ejecutan los mismos tres escenarios. Para que los cuatro reportes de
Allure sean comparables, todos declaran **los mismos títulos y los mismos nombres de paso**,
y cada navegación, acción y aserción se reporta como un paso independiente.

Sin pasos, un fallo a mitad de ejecución sólo dice «el test falló». Con este catálogo el
reporte indica si falló al navegar, al ejecutar la acción o al validar el resultado, y qué
pasos anteriores sí pasaron.

## Dónde vive el catálogo

Cada proyecto declara el catálogo completo en su capa `helpers`:

| Proyecto | Archivo | API de paso |
|---|---|---|
| `python-playwright` | `helpers/steps.py` | `with step(...)` sobre `allure.step` |
| `typescript-playwright` | `helpers/steps.ts` | `step(...)` sobre `test.step` |
| `java-selenium-rest-assured` | `helpers/Steps.java` | `Steps.step(...)` sobre `Allure.step` |
| `typescript-cypress` | `helpers/steps.ts` | `step(...)` sobre `allure.step` (cola de comandos) |

`npm run validate:frameworks` falla si alguno de los cuatro archivos deja de declarar
cualquier entrada de este documento.

## Títulos de prueba

| ID | Escenario | Título |
|---|---|---|
| `BOOK-TEST-UI-001` | UI trazabilidad | `[BOOK-TEST-UI-001] Product purchase traceability from store stock to paid order history` |
| `BOOK-TEST-UI-002` | UI playground | `[BOOK-TEST-UI-002] Playground flakiness reproduced with a fixed seed` |
| `BOOK-TEST-API-001` | API CRUD | `[BOOK-TEST-API-001] Product CRUD lifecycle with guaranteed cleanup` |

## Pasos de escenario

Son los pasos de primer nivel del reporte. El prefijo indica su rol: `Setup`, `Given`,
`When` (navegación o acción), `Then` (aserción) y `Teardown`.

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
Then: order history modal fits the mobile viewport   (sólo en perfil móvil)
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

## Pasos anidados

Los page objects y los services emiten su propio paso dentro del paso de escenario, de modo
que el reporte separa «no llegué a la página» de «la página no cumple la aserción».

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

## Cómo se ve un fallo

Ejemplo real de un fallo provocado en la aserción de inventario:

```text
Product purchase traceability…                              failed
  Setup: clear the shopping cart                            passed
  When: user opens the product in the store                 passed
    Store: open the store page                              passed
    Store: search for the product                           passed
  Then: inventory shows full stock without reservations     failed
```

Los pasos posteriores no aparecen porque no llegaron a ejecutarse. El reporte identifica
que la navegación funcionó y que el fallo está en la aserción.

## Reglas al añadir o cambiar pasos

1. Un paso = una navegación, una acción o un bloque de aserciones. Nunca los tres juntos.
2. Los nombres son estáticos y en inglés; los valores variables van como parámetros o
   adjuntos de Allure, no dentro del nombre del paso.
3. Un método de page object hace acción **o** verificación. Si necesita ambas, se divide
   (`open` / `expect…`, `fillTestingDetails` / `submitOrder`).
4. Cualquier cambio se aplica a los cuatro `helpers` y a este documento en el mismo commit,
   o `validate:frameworks` falla.
