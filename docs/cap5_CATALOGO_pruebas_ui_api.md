# Capítulo 5: catálogo de pruebas UI y API

> Documento de planeación para construir los cuatro proyectos de
> `qa-academy-exercises/chapter-05`.
>
> Python/Playwright, TypeScript/Playwright y Java/Selenium + REST Assured implementarán el catálogo
> completo. Cypress utilizará la misma arquitectura, pero sólo implementará los casos marcados
> **Cypress demo**.

## 1. Reglas del catálogo

- Un ID representa la misma intención en todos los frameworks principales.
- El código puede cambiar por lenguaje; precondiciones, assertions y cleanup no.
- Cada caso nuevo debe tener comando local y ejecución real en CI.
- Los casos mutables generan datos únicos y ejecutan cleanup aun si falla la prueba.
- Registro, Turnstile interno, examen, evaluación, certificación, proctoring, administración, MCP y
  endpoints internos están fuera de alcance.
- La cuenta se crea manualmente. API usa `API_KEY`; UI prepara `localStorage`, excepto los casos
  dedicados al login.
- `orders.total` es el campo persistido. `total_amount` sólo es un agregado de resumen.

## 2. Qué código aparecerá en el libro

El catálogo completo pertenece al repositorio, no a las páginas de Word. El capítulo imprimirá
únicamente el núcleo necesario para enseñar la arquitectura.

### Archivos de prueba completos

Cada uno de los tres frameworks principales mostrará tres pruebas completas:

1. **UI estándar — Store → carrito (`BOOK-UI-CART-001`)**
   - preparar sesión mediante fixture;
   - buscar un producto;
   - agregarlo al carrito;
   - comprobar item, cantidad y subtotal;
   - utilizar Page Objects.
2. **UI avanzada — flaky test reproducible (`BOOK-UI-FLAKY-001`)**
   - abrir el formulario de flakiness de Playground;
   - fijar una seed conocida;
   - ejecutar un resultado controlado;
   - distinguir fallo del test frente a fallo simulado del producto;
   - adjuntar evidencia sin utilizar retries ciegos.
3. **API REST estándar — ciclo de vida de producto (`BOOK-API-CRUD-001`)**
   - crear un producto único;
   - consultarlo;
   - actualizarlo;
   - eliminarlo en cleanup;
   - utilizar un Service Object.

Esto produce **nueve archivos de prueba completos en el libro**:

| Framework | UI carrito | UI flaky | API CRUD |
|---|---|---|---|
| Python | Completo | Completo | Completo |
| TypeScript | Completo | Completo | Completo |
| Java | Completo | Completo | Completo |

Los nombres de archivo conservarán el mismo significado:

```text
tests/ui/test_store_cart.*
tests/ui/test_playground_flaky.*
tests/api/test_product_crud.*
```

Cada lenguaje adaptará únicamente su extensión y convención de naming.

### Configuración y reportes incluidos

Antes de las pruebas, el libro mostrará para cada framework principal:

- dependencias y runner;
- variables de entorno;
- configuración de navegador/API;
- fixtures de autenticación y cleanup;
- configuración de Allure;
- comando local;
- comando utilizado por CI.

Después de ejecutar las tres pruebas, se mostrará el reporte Allure con:

- epic, feature y story equivalentes;
- pasos de setup, test y teardown;
- screenshot del fallo UI;
- request/response redactados del CRUD;
- seed y evidencia del flaky test;
- resultado de cleanup.

### Cypress en el libro

Cypress tendrá la misma estructura y las mismas tres pruebas en el repositorio. En Word se mostrará
una comparación compacta de carrito, flaky test y CRUD, resaltando únicamente las diferencias de
sintaxis, runner y reporte. No se repetirán tres archivos completos adicionales.

### Técnicas mostradas como fragmentos

Los siguientes temas requieren explicación, pero no otro archivo completo por lenguaje:

- QUERY nativo y POST override;
- GraphQL con `data` y `errors`;
- Shadow DOM;
- Allure request/response y screenshot;
- emulación móvil.

El libro mostrará un fragmento de referencia y una tabla con su equivalente por stack. Después
dirigirá al lector a la implementación completa en `qa-academy-exercises`.

### Presupuesto editorial

- 3 configuraciones principales explicadas.
- 9 archivos de prueba completos.
- Configuración y reporte de los tres frameworks principales.
- Cypress como comparación breve de las mismas tres pruebas.
- Fragmentos avanzados seleccionados.
- Ninguna impresión del catálogo completo.

El principio editorial es: **el libro explica el patrón; el repositorio demuestra su cobertura**.

## 3. Catálogo UI completo

### Autenticación y shell

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-AUTH-001 | Login válido | Acceso concedido; token y email preparados; navegación autenticada | Sí |
| UI-AUTH-002 | Login inválido | Mensaje controlado; no se crea estado autenticado | No |
| UI-SHELL-001 | Aceptar Terms Gate | Diálogo visible; consentimiento persistido; contenido habilitado | No |
| UI-SHELL-002 | Navegación responsive | Menú y destinos públicos funcionan en viewport móvil | No |

### Store y productos

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-STORE-001 | Cargar Store | Productos visibles y estados de carga resueltos | Sí |
| UI-STORE-002 | Buscar y filtrar | Resultados corresponden a búsqueda, categoría y tipo | No |
| UI-STORE-003 | Paginar | Indicador, anterior/siguiente y contenido de página cambian correctamente | No |
| UI-PRODUCT-001 | Crear producto propio | Producto `ALL` aparece con datos enviados | No |
| UI-PRODUCT-002 | Editar producto propio | Cambios visibles y persistidos | No |
| UI-PRODUCT-003 | Eliminar producto propio | Confirmación, eliminación y feedback correcto | No |
| UI-PRODUCT-004 | Proteger producto no eliminable | Regla de permisos y diálogo esperado | No |

### Carrito

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-CART-001 | Agregar producto | Badge, item, cantidad y subtotal correctos | Sí |
| UI-CART-002 | Cambiar cantidad | Cantidad y subtotal se actualizan; stock respetado | No |
| UI-CART-003 | Eliminar con diálogo nativo | Se intercepta `confirm`; item desaparece | Sí |
| UI-CART-004 | Vaciar carrito | Confirmación y estado vacío | No |

### Checkout y órdenes

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-CHECKOUT-001 | Validaciones requeridas | Errores por campo y resumen de errores | No |
| UI-CHECKOUT-002 | Datos límite/negativos | Nombre, dirección, tarjeta y expiración se rechazan correctamente | No |
| UI-CHECKOUT-003 | Crear orden | Checkout exitoso; orden, total y detalle accesibles | No |
| UI-CHECKOUT-004 | Modal responsive | Modal de impuestos/envío queda sobre el contenido y puede cerrarse en móvil | No |
| UI-ORDER-001 | Abrir detalle | Estado, pago, items, subtotal, impuestos, envío y total correctos | No |
| UI-ORDER-002 | Buscar y filtrar historial | Resultados corresponden a búsqueda y estado | No |
| UI-ORDER-003 | Paginar historial | Controles e indicador corresponden a la página | No |

### Query Lab

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-QUERY-001 | Consultar productos | Preview, transporte, tabla y paginación correctos | No |
| UI-QUERY-002 | Consultar órdenes | Columna y sort usan `total`; resumen puede usar `total_amount` | Sí |
| UI-QUERY-003 | Cambiar transporte | QUERY nativo y POST override se reflejan en metadata | No |
| UI-QUERY-004 | Estados de respuesta | Loading, vacío, error y cooldown son observables | No |

### Playground

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-PLAY-001 | Smoke de 24 secciones | Cada selector de sección existe una sola vez | Sí |
| UI-PLAY-002 | Formulario y límites | Estados válido, inválido y boundary son deterministas | No |
| UI-PLAY-003 | Modal, tabs y accordion | Apertura, cambio de estado y cierre | No |
| UI-PLAY-004 | DataTable | 100 filas base; búsqueda y ordenamiento; sin paginación inventada | Sí |
| UI-PLAY-005 | iframe, hover y nueva pestaña | Cambio de contexto y retorno controlados | No |
| UI-PLAY-006 | Descarga y carga | Archivo descargado y estado de carga simulada verificados | No |
| UI-PLAY-007 | Flakiness reproducible | Seed fijo reproduce resultado; no usa retry ciego | Sí |
| UI-PLAY-008 | Shadow DOM abierto | Input, submit y resultado dentro de `shadow-host` | Sí |

### Emulación móvil

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| UI-MOBILE-001 | Store responsive | Navegación, filtros y tarjetas utilizables | No |
| UI-MOBILE-002 | Carrito/modal responsive | Contenido visible; modal sobrepuesto y cerrable | No |
| UI-MOBILE-003 | Playground responsive | Secciones y modales críticos utilizables | No |

**Total UI de frameworks principales: 37 pruebas.**  
**Subconjunto Cypress UI: 9 pruebas.**

## 4. Catálogo API completo

### Auth y salud

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-AUTH-001 | Login válido | Session/API token y usuario esperado; secretos no se adjuntan | No |
| API-AUTH-002 | Credenciales inválidas | 401 y error controlado | Sí |
| API-AUTH-003 | Perfil autenticado | `/auth/me` corresponde a la cuenta | No |
| API-AUTH-004 | Bearer ausente/inválido | Recurso protegido devuelve 401 | No |
| API-HEALTH-001 | Health autenticado | Contrato 200/503 y checks conocidos | No |

### Productos

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-PRODUCT-001 | Listar y paginar | Metadata y límite corresponden a los datos | No |
| API-PRODUCT-002 | Ciclo CRUD propio | Crear, obtener, editar y eliminar producto `ALL` | Sí |
| API-PRODUCT-003 | Validaciones y límites | Precio, stock, campos y máximo permitido | No |
| API-PRODUCT-004 | Permisos | `N_DELETE`/`READ_ONLY` respetan operaciones permitidas | No |
| API-PRODUCT-005 | Categorías y stock | Agregados y disponibilidad son consistentes | No |

### Carrito

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-CART-001 | Agregar y fusionar item | 201 inicial; cantidad combinada y stock respetado | No |
| API-CART-002 | Actualizar y eliminar item | PATCH y quantity cero producen estado esperado | No |
| API-CART-003 | Bulk update | Resultados mixtos, estadísticas y resumen correctos | No |
| API-CART-004 | Resumen | Subtotal, impuestos, envío, descuento y readiness correctos | Sí |
| API-CART-005 | Stock insuficiente | 400; carrito no queda corrupto | No |
| API-CART-006 | Vaciar carrito | DELETE y estado vacío idempotente | No |

### Órdenes

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-ORDER-001 | Crear y consultar orden | 201; items, shipping, payment y totales correctos | No |
| API-ORDER-002 | Cambiar estados | Transiciones válidas e inválidas | No |
| API-ORDER-003 | Cambiar pago | Estado permitido y persistencia | No |
| API-ORDER-004 | Cancelar y restaurar stock | Cancelación y restauración; repetición segura | No |
| API-ORDER-005 | Eliminar y cleanup | Orden eliminada y stock restaurado | No |
| API-ORDER-006 | Buscar con resumen | Filtros, `total_amount`, promedio y conteos correctos | Sí |
| API-ORDER-007 | Filtros relacionales paginados | `search`/producto se aplican antes de total y página | No |
| API-ORDER-008 | Aislamiento por usuario | Recursos ajenos no son accesibles | No |

### HTTP QUERY

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-QUERY-001 | QUERY nativo de productos | Filtros, sort, fields, página y `meta.transport=QUERY` | Sí |
| API-QUERY-002 | POST override | Header override y `meta.transport=POST_OVERRIDE` | No |
| API-QUERY-003 | POST plano | Respuesta válida y transporte POST | No |
| API-QUERY-004 | GET rechazado | 405 y `Allow: QUERY, POST, OPTIONS` | No |
| API-QUERY-005 | QUERY de órdenes | Filtros/sort usan `total`; resumen separado | Sí |
| API-QUERY-006 | Relación antes de paginación | `search`/`product_ids`, total y páginas consistentes | No |
| API-QUERY-007 | Validaciones | Rangos, fechas, IDs, fields, sort y limit inválidos | No |

### GraphQL

| ID | Prueba | Assertions principales | Cypress demo |
|---|---|---|---|
| API-GQL-001 | Query autenticada | `me` devuelve cuenta esperada | No |
| API-GQL-002 | Modelo de errores | HTTP 200 puede contener `errors`; no se acepta como éxito funcional | Sí |
| API-GQL-003 | Productos paginados | Variables, `operationName`, data y pagination | No |
| API-GQL-004 | Mutation con cleanup | Crear/editar/eliminar producto | No |
| API-GQL-005 | Carrito | Add/update/remove/clear con assertions de dominio | No |
| API-GQL-006 | Orden | Crear, consultar, cambiar estado o cancelar y limpiar | No |
| API-GQL-007 | Buscar órdenes | Filtros, resumen y paginación | No |

**Total API de frameworks principales: 38 pruebas.**  
**Subconjunto Cypress API: 7 pruebas.**

## 5. Resumen del repositorio

| Proyecto | UI | API | Total inicial |
|---|---:|---:|---:|
| Python/Playwright | 37 | 38 | 75 |
| TypeScript/Playwright | 37 | 38 | 75 |
| Java/Selenium + REST Assured | 37 | 38 | 75 |
| Cypress demo | 9 | 7 | 16 |

Los 241 casos son el objetivo de cobertura extendida del repositorio y pueden incorporarse por
fases. No representan 241 archivos ni 241 bloques que deban escribirse en el libro. Los casos
parametrizados pueden compartir archivo sin perder su ID, y cada implementación que se agregue debe
quedar conectada a CI.

## 6. Orden de construcción

1. Crear la estructura idéntica de responsabilidades en los cuatro proyectos.
2. Configurar smoke test, variables, redacción de secretos, Allure y CI.
3. Implementar primero los tres casos que aparecerán en el libro.
4. Implementar TypeScript/Playwright como referencia para la cobertura extendida.
5. Implementar Python conservando intención, no traducción literal.
6. Implementar Java respetando Maven, Selenium y REST Assured.
7. Implementar el subconjunto Cypress en la misma arquitectura.
8. Ejecutar primero UI/API smoke; después datos mutables y cleanup.
9. Validar QUERY nativo en los cuatro clientes.
10. Incorporar el catálogo extendido por fases, siempre conectado a CI.
11. Seleccionar fragmentos avanzados sólo después de que compilen y pasen.

## 7. Decisiones que ya no requieren confirmación

- Los cuatro proyectos comparten carpetas y responsabilidades.
- Cypress incluye `tests/ui`, `tests/api`, `pages`, `services`, `fixtures`, `helpers`, `data` y
  `config`.
- Cypress sigue siendo demo porque implementa un subconjunto, no porque carezca de arquitectura.
- Los tres frameworks principales mantienen paridad funcional.
- Las pruebas de registro y certificación permanecen fuera de alcance.
- MCP permanece en el capítulo de IA.
- Ninguna prueba se considera terminada hasta ejecutarse en CI.
- El libro imprime nueve tests completos, no el catálogo extendido.
- Cypress implementa los mismos tres tests editoriales, pero se presenta como demo.

## 8. Único checkpoint antes de programar

Antes de crear los cuatro proyectos, revisar este catálogo por:

- cantidad de casos;
- casos que deban fusionarse o dividirse;
- subconjunto exacto de Cypress;
- prioridad editorial para decidir qué código aparecerá en las 120–130 páginas del capítulo.

Una vez aprobado ese checkpoint, la siguiente fase es implementación, no una nueva auditoría de la
plataforma.
