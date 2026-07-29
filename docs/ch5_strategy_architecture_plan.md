# Capítulo 5: Plan de estrategia y estructura (hands-on UI + API)

> **Documento maestro de planeación (Versión actualizada post-desarrollo)**  
> Fija los tres stacks principales, la revisión de Cypress, los resultados de los spikes técnicos (HTTP `QUERY`, Allure), las estructuras exactas en el repositorio `isaachq/qa-academy-exercises`, la política de ejecución pública anti-bot y la guía detallada de los 4 tests de BOOK.  
> La meta: un mismo esqueleto mental en Python, Java y TypeScript, con Allure como columna de trazabilidad, sobre QA Academy Platform (`https://qaacademyabc.xyz`).

---

## 1. Los tres stacks principales + Cypress Review

Cada lenguaje prueba UI y API con herramientas optimizadas para su ecosistema. El estado final confirmado es el siguiente:

| Lenguaje | UI | API | Runner | Adaptador Allure | Rol en el Libro |
|---|---|---|---|---|---|
| **Python** | Playwright | Playwright `APIRequestContext` | `pytest` (`pytest-playwright`) | `allure-pytest` | Stack Principal |
| **TypeScript** | Playwright | Playwright `request` fixture | `Playwright Test` | `allure-playwright` | Stack Principal |
| **Java** | Selenium WebDriver | REST Assured | `TestNG` / `JUnit 5` | `allure-testng` / `AllureRestAssured` | Stack Principal |
| **Cypress (TS)** | Cypress | `cy.request()` / `nodeApiRequest` | Cypress Runner | `allure-cypress` | Demo / Review de Nicho |

**Punto clave de asimetría**: En Python y TypeScript, **Playwright resuelve UI y API con una sola herramienta** (`APIRequestContext` / `request`). En Java, la UI utiliza Selenium WebDriver y la API utiliza REST Assured, integrando dos librerías en una misma arquitectura. En Cypress, UI y API conviven en el entorno ejecutor de Cypress. La estructura común del libro está diseñada para absorber esta asimetría sin cambiar la mentalidad del ingeniero.

---

## 2. Gaps investigados y resueltos

1. **Gap 1 — Python y la API: ¿`requests` o Playwright?**  
   *Resuelto*. Playwright Python incluye `APIRequestContext` nativo (`page.request`, `playwright.request.new_context()`), el cual ejecuta `GET`, `POST`, `PUT`, `PATCH`, `DELETE` y `QUERY` validando respuestas. No se requiere la librería externa `requests`. Ventaja decisiva: `APIRequestContext` **comparte baseURL, headers y storage state con el navegador**, permitiendo autenticarse por API y reutilizar la sesión en la UI sin fricción.

2. **Gap 2 — La asimetría Java (2 librerías) vs Python/TS (1 librería)**  
   *Resuelto por arquitectura*. La carpeta de API (`services/`) existe idéntica en los tres stacks; lo único que cambia es el motor interno: REST Assured en Java, `APIRequestContext` en Python y TypeScript. El lector aplica los mismos patrones en los tres lenguajes.

3. **Gap 3 — Allure y la trazabilidad unificada**  
   *Resuelto*. Aunque cada runner utiliza su propio adaptador (`allure-pytest`, `allure-playwright`, `allure-testng`), todos escriben en `allure-results/` y producen un informe HTML unificado con historias, épicas y nombres de pasos idénticos (`helpers/steps`).

4. **Gap 4 — Política de Ejecución Pública y Anti-Bot (Sin ByPass)**  
   *Resuelto para publicación pública*. Todo rastro de parches o llaves privadas de bypass (`VERCEL_AUTOMATION_BYPASS_SECRET`) ha sido eliminado del repositorio público.
   - **Los 4 Tests de BOOK**: Se ejecutan de forma limpia y simultánea en bloque sin ningún tipo de bloqueo ni restricción.
   - **Catálogo Extendido (73 Tests)**: Se explica al lector que las plataformas cloud en producción aplican reglas de protección anti-bot y *rate-limiting*. Por ello, los tests extendidos del repositorio están diseñados para ser consultados y ejecutados **1 a 1** (o en ráfagas de 1 a 3 tests mediante `--ids` o `--grep`), enseñando al estudiante el manejo profesional de ejecuciones filtradas.

---

## 3. El unificador de fondo: Dos patrones

Dos patrones de diseño se repiten idénticos en todos los lenguajes:

- **Page Object Model (POM) para UI**: Cada pantalla de la aplicación es representada por una clase que expone acciones de negocio y oculta la localización de elementos.
- **Service Object para API**: Un *Service Object* es al endpoint lo que un *Page Object* es a la pantalla. Encapsula las peticiones HTTP, rutas y serialización de payloads.

Con estos dos patrones, un test se lee igual de limpio en Python, Java o TypeScript.

---

## 4. Estructura común: Siete carpetas

La estructura conceptual se compone de **siete carpetas principales**, mapeadas a las convenciones de cada lenguaje dentro del repositorio `qa-academy-exercises/frameworks/`:

```text
frameworks/[stack]/
├── tests/ui/      # Pruebas de Interfaz (Page Object Model)
├── tests/api/     # Pruebas de API (Service Object Pattern)
├── pages/         # Page Objects (UI)
├── services/      # Service Objects (API -> REST Assured | APIRequestContext)
├── helpers/       # Utilidades compartidas (Allure steps, generadores de datos)
├── data/          # Datos de prueba y constantes
└── config/        # Configuración de entornos, URLs y timeouts
```

---

## 5. Mapeo de Directorios en el Repositorio Público

El repositorio público contiene los cuatro proyectos ejecutables organizados en:

1. **Python Playwright**: `frameworks/python-playwright/`
   - `tests/ui/` (`test_product_purchase_traceability.py`, `test_playground_flaky.py`)
   - `tests/api/` (`test_product_crud.py`)
   - `pages/` (`login_page.py`, `store_page.py`, `cart_page.py`, `checkout_page.py`)
   - `services/` (`product_service.py`, `auth_service.py`)

2. **TypeScript Playwright**: `frameworks/typescript-playwright/`
   - `tests/ui/` (`product_purchase_traceability.spec.ts`, `playground_flaky.spec.ts`)
   - `tests/api/` (`product_crud.spec.ts`)
   - `pages/` (`LoginPage.ts`, `StorePage.ts`, `CartPage.ts`, `CheckoutPage.ts`)
   - `services/` (`ProductService.ts`, `AuthService.ts`)

3. **Java Selenium & REST Assured**: `frameworks/java-selenium-rest-assured/`
   - `src/test/java/tests/ui/` (`ProductPurchaseTraceabilityTest.java`, `PlaygroundFlakyTest.java`)
   - `src/test/java/tests/api/` (`ProductCrudTest.java`)
   - `src/main/java/pages/` (`LoginPage.java`, `StorePage.java`, `CartPage.java`, `CheckoutPage.java`)
   - `src/main/java/services/` (`ProductService.java`, `AuthService.java`)

4. **TypeScript Cypress (Demo / Review)**: `frameworks/typescript-cypress/`
   - `tests/ui/` (`product_purchase_traceability.spec.ts`, `playground_flaky.spec.ts`)
   - `tests/api/` (`product_crud.spec.ts`)

---

## 6. Resultados de Spikes Técnicos

1. **El Método HTTP QUERY (RFC 10008)**  
   *Confirmado e implementado*. Se verificó que Playwright (`fetch` / `request`), REST Assured (`request("QUERY", ...)`) y `node:http` (utilizado en Cypress task) ejecutan peticiones HTTP nativas con el método `QUERY`. Esto permite enviar cuerpos JSON complejos sin sufrir las limitaciones de longitud de URL de los parámetros `GET`.

2. **Integración con MCP (Model Context Protocol)**  
   El fundamento teórico y arquitectónico de AI Agentic Testing vive en el **Capítulo 4**. En el Capítulo 5 nos enfocamos 100% en la automatización hands-on de UI + API sólida, dejando la interacción avanzada de agentes MCP para los capítulos de profesionalización vanguardista (Capítulos 8 y 9).

---

## 7. Detalle Técnico de los 4 Tests de BOOK

Los 4 tests del libro ejecutan el mismo flujo de negocio y verificaciones en los tres lenguajes:

### 1. `BOOK-TEST-UI-001`: Product Purchase Traceability (Desktop Web)
- **Propósito**: Validar la trazabilidad completa desde la consulta de inventario en tienda hasta la generación y pago de una orden.
- **Flujo**:
  1. Autenticación / Inyección de estado de sesión (`api_token`, `user_email`).
  2. Navegación a `/store` y selección de producto.
  3. Adición al carrito y validación del contador del carrito.
  4. Transición a `/cart` y procesamiento de checkout (`/checkout`).
  5. Confirmación de orden y validación del badge de estado pagado (`PAID`).
- **Selectores de UI Universales**:
  - Email: `[data-testid="login-email"]` / `getByLabel("Email")`
  - Password: `[data-testid="login-password"]` / `getByLabel("Password")`
  - Submit Login: `[data-testid="login-continue"]` / `getByRole("button", { name: "Sign In" })`
  - Product Card: `[data-testid="product-card"]`
  - Add to Cart: `[data-testid="add-to-cart-btn"]`
  - Cart Counter Badge: `[data-testid="cart-count"]`
  - Checkout Button: `[data-testid="checkout-btn"]`
  - Confirm Order: `[data-testid="confirm-order-btn"]`
  - Order Status Badge: `[data-testid="order-status"]`

### 2. `BOOK-TEST-UI-001-MOBILE`: Product Purchase Traceability (Mobile Viewport)
- **Propósito**: Validar el mismo flujo de compra bajo emulación de pantalla móvil (Viewport: 375x667 / Pixel 7 / iPhone SE).
- **Aspectos Clave**: Interacción con menú hamburguesa responsivo (`[data-testid="mobile-menu-btn"]`) y cajón de navegación lateral.

### 3. `BOOK-TEST-UI-002`: Playground Flaky Test Triage
- **Propósito**: Demostrar el triaje de pruebas inestables en la sección Playground de QA Academy Platform.
- **Estrategia**: Manejo de elementos dinámicos mediante esperas deterministas basadas en condición (`toBeVisible`, `WebDriverWait.until`), evitando `sleep()` fijos y aislando fallos de UI.

### 4. `BOOK-TEST-API-001`: Product REST CRUD Lifecycle
- **Propósito**: Probar el ciclo de vida completo de un recurso de producto con limpieza garantizada.
- **Métodos y Endpoints HTTP**:
  - `POST /api/v1/auth/login` -> Obtención de Bearer Token.
  - `POST /api/v1/products` -> Creación de producto con datos dinámicos (`uniqueProductName()`).
  - `GET /api/v1/products/{id}` -> Validación de contrato de lectura (`200 OK`).
  - `PUT /api/v1/products/{id}` -> Actualización de precio/stock (`200 OK`).
  - `DELETE /api/v1/products/{id}` -> Eliminación del producto en bloque `finally` / `afterEach` (`200 OK` / `204 No Content`).

---

## 8. Estructura Definitiva del Capítulo 5 (Guía Editorial)

Esta es la secuencia exacta de secciones para la redacción del capítulo del libro:

1. **Introducción y Filosofía Hands-on**
   - El mapa de QA Academy Platform.
   - Por qué UI + API en el mismo capítulo (absorbiendo la pirámide de pruebas).

2. **La Estructura Común de 7 Carpetas**
   - Explicación de los dos patrones centrales: POM para UI y Service Object para API.
   - Comparativa trilingüe de carpetas (`tests/ui`, `tests/api`, `pages`, `services`, `helpers`, `data`, `config`).

3. **Setup del Entorno por Lenguaje**
   - Instalación y ejecución paralela en Python, Java y TypeScript.
   - Comandos exactos para clonar y ejecutar el repositorio público `isaachq/qa-academy-exercises`.

4. **UI Hands-on: Los Tests de Interfaz**
   - Construcción de `BOOK-TEST-UI-001` en Desktop y Mobile Viewport.
   - Manejo del Playground y triaje de pruebas inestables con `BOOK-TEST-UI-002`.

5. **API Hands-on: REST, HTTP QUERY y GraphQL**
   - Construcción de `BOOK-TEST-API-001` (CRUD con limpieza garantizada en `finally`).
   - Demostración del método HTTP `QUERY` (RFC 10008) y consultas GraphQL.

6. **Trazabilidad y Reportes Unificados con Allure**
   - Cómo ejecutar, generar y leer el reporte visual unificado (`allure-results` -> `allure generate`).

7. **Subsecciones por Framework y Estructuras en el Repo**
   - Desglose de archivos clave en `python-playwright`, `java-selenium-rest-assured` y `typescript-playwright`.

8. **Cypress: Demo y Revisión de Nicho**
   - Comparación de Cypress vs Playwright (Single tab vs Multi-context, `cy.request()`).

9. **Conclusión y Puente al Capítulo 6**
   - Resumen de aprendizajes en automatización UI + API.
   - Transición al **Capítulo 6: SQL — SQLite general, transacciones básicas y avanzadas, views y triggers** para validar datos directamente en la capa de persistencia.
