# Capítulo 5: plan final de estrategia y estructura

> Documento de planeación editorial y técnica; no es contenido del libro.
>
> Estado: **cerrado para iniciar implementación**.  
> Plataforma objetivo: `https://qaacademyabc.xyz`  
> Repositorio de la plataforma: `isaachq/qa-academy-platform`  
> Repositorio público de ejercicios: `qa-academy-exercises`

## 1. Propósito del capítulo

El capítulo construirá cuatro proyectos de automatización sobre QA Academy Platform. Python,
TypeScript y Java tendrán cobertura completa; Cypress conservará un catálogo demostrativo más
pequeño, pero utilizará la misma arquitectura y también incluirá UI y API. Los cuatro compartirán
el mismo esqueleto mental, aunque cada tecnología conserve sus convenciones.

La meta no es llenar páginas con código repetido. El libro mostrará únicamente el código necesario
para explicar decisiones de arquitectura, diseño de pruebas, trazabilidad y mantenimiento. Las
implementaciones completas vivirán en `qa-academy-exercises`.

Al finalizar, el lector deberá poder:

1. reconocer una arquitectura de automatización por capas;
2. separar Page Objects, Service Objects, fixtures, datos y configuración;
3. automatizar UI de escritorio y emulación móvil;
4. probar REST, GraphQL y HTTP QUERY;
5. preparar y limpiar datos sin depender de ejecuciones anteriores;
6. producir evidencia equivalente con Allure en los tres stacks;
7. ejecutar localmente las pruebas y entender cómo las ejecuta CI.

## 2. Alcance definitivo

### Incluido

- Login y preparación de una sesión de prueba existente.
- Productos, Store, carrito, checkout y órdenes.
- Detalle, búsqueda, estados y cancelación de órdenes.
- API REST pública documentada.
- GraphQL público.
- HTTP QUERY:
  - método QUERY nativo;
  - POST con `X-HTTP-Method-Override: QUERY`;
  - POST plano;
  - GET rechazado con 405 y encabezado `Allow`.
- Query Lab para productos y órdenes.
- Playground como laboratorio de automatización:
  - formularios y validaciones;
  - modales, pestañas y acordeones;
  - tablas y DataTable;
  - diálogos nativos;
  - iframe, hover, nueva pestaña, descarga y carga;
  - estados controlados de flakiness;
  - Shadow DOM abierto.
- Emulación móvil web.
- Allure.
- Ejecución local y GitHub Actions.

### Fuera de alcance

- Registro automatizado de cuentas.
- Interacción con el iframe interno de Cloudflare Turnstile.
- Examen, cuestionario y evaluación.
- Formulario o flujo de acceso a certificación.
- Certificación, proctoring y administración.
- Endpoints, encabezados, cookies o contratos internos de la plataforma.
- Automatización móvil nativa.
- Pruebas de base de datos como parte de estos tres frameworks.
- MCP y automatización asistida por IA.

MCP se explicará cuando el libro llegue al capítulo de IA. El capítulo 5 no incluirá instalación,
configuración, prompts ni ejemplos de MCP; así se evita adelantar un concepto que requiere su propio
contexto.

## 3. Los cuatro proyectos de framework

| Lenguaje | UI | API | Runner | Allure |
|---|---|---|---|---|
| Python | Playwright | Playwright `APIRequestContext` | pytest + pytest-playwright | allure-pytest |
| TypeScript | Playwright | Playwright `request` / `APIRequestContext` | Playwright Test | allure-playwright |
| Java | Selenium | REST Assured | TestNG | allure-testng + AllureRestAssured |
| Cypress | Cypress | `cy.request()` | Cypress | allure-cypress |

Decisiones cerradas:

- Python no utilizará `requests`; Playwright cubrirá UI y API.
- TypeScript utilizará un solo runner: Playwright Test.
- Java conservará Selenium y REST Assured dentro del mismo framework.
- Los tres frameworks principales tendrán cobertura comparable, no código idéntico.
- Cypress tendrá la misma arquitectura de carpetas y cubrirá UI y API, pero ejecutará un subconjunto
  demostrativo claramente identificado.

## 4. Arquitectura común

Los cuatro stacks compartirán dos patrones principales:

- **Page Object Model:** oculta selectores y expone acciones de la interfaz.
- **Service Object:** oculta rutas, headers y cuerpos HTTP, y expone operaciones del dominio.

El esqueleto conceptual será:

```text
tests/ui/     escenarios de interfaz
tests/api/    escenarios REST, GraphQL y HTTP QUERY
pages/        Page Objects
services/     Service Objects
fixtures/     ciclo de vida y dependencias del test
helpers/      utilidades pequeñas y reutilizables
data/         builders, payloads y datos estáticos seguros
config/       URLs, variables y opciones de ejecución
```

`fixtures/` se reconoce como una capa propia. No debe esconderse dentro de `helpers/`, porque controla
setup, teardown, dependencias, contexto de navegador, clientes HTTP y evidencia.

### Python

```text
chapter-05/python-playwright/
├── tests/
│   ├── ui/
│   └── api/
├── pages/
├── services/
├── fixtures/
├── helpers/
├── data/
├── config/
├── conftest.py
├── pytest.ini
├── requirements.txt
├── .env.example
└── README.md
```

### TypeScript

```text
chapter-05/typescript-playwright/
├── tests/
│   ├── ui/
│   └── api/
├── pages/
├── services/
├── fixtures/
├── helpers/
├── data/
├── config/
├── playwright.config.ts
├── package.json
├── .env.example
└── README.md
```

### Java

```text
chapter-05/java-selenium/
├── src/
│   ├── main/java/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── helpers/
│   │   ├── data/
│   │   └── config/
│   └── test/
│       ├── java/
│       │   ├── ui/
│       │   ├── api/
│       │   └── fixtures/
│       └── resources/
│           ├── testng.xml
│           └── allure.properties
├── pom.xml
├── .env.example
└── README.md
```

Java respetará la convención Maven: el código reutilizable estará en `src/main/java` y los tests y
su ciclo de vida en `src/test`.

### Cypress

```text
chapter-05/cypress-demo/
├── tests/
│   ├── ui/
│   └── api/
├── pages/
├── services/
├── fixtures/
├── helpers/
├── data/
├── config/
├── cypress.config.ts
├── package.json
├── .env.example
└── README.md
```

Cypress conserva los mismos límites arquitectónicos. El término *demo* describe la cantidad de
escenarios implementados, no una estructura incompleta.

## 5. Contratos técnicos que consumirán los frameworks

Los frameworks no deducirán contratos desde textos, clases CSS o ejemplos antiguos. Sus fuentes
serán:

1. `docs/api-endpoint-map.md`, únicamente sus secciones públicas 1–7;
2. `/api/openapi.json` y `/api-docs`;
3. `/graphql-docs` y el schema servido por `/api/graphql`;
4. `docs/page-selector-map.md`;
5. `docs/automation-data-contract.md`;
6. comportamiento desplegado de QA Academy Platform.

Reglas obligatorias:

- usar `data-testid` estable; no texto traducible, clases utilitarias ni posiciones;
- usar identificadores persistentes en selectores dinámicos;
- utilizar `orders.total` para campo, filtro, ordenamiento y columna de Query Lab;
- reservar `total_amount` para agregados de resumen;
- aplicar filtros relacionales de órdenes antes de comprobar total y paginación;
- no utilizar `app/playground/old_page`;
- no inventar paginación para el DataTable de Playground: tiene búsqueda y ordenamiento;
- tratar GraphQL HTTP 200 con `errors` como fallo funcional cuando corresponda.

## 6. Autenticación y estado

El lector creará y verificará una cuenta manualmente. Los frameworks recibirán:

```env
BASE_URL=https://qaacademyabc.xyz
API_KEY=
UI_EMAIL=
UI_PASSWORD=
```

No se versionarán valores reales.

### API

REST y GraphQL usarán:

```http
Authorization: Bearer <API_KEY>
```

### UI

La mayoría de los escenarios no repetirá el formulario de login. Antes de navegar al flujo de
negocio, el framework preparará el estado esperado por la aplicación:

- `localStorage.api_token`;
- `localStorage.user_email`;
- `localStorage['qa-academy-terms-consent-v1'] = 'accepted'`.

Playwright lo establecerá antes de cargar la página. Selenium abrirá el origen, preparará
`localStorage` mediante JavaScript y recargará la ruta objetivo.

Solamente los escenarios dedicados a login utilizarán `UI_EMAIL` y `UI_PASSWORD`. No se afirmará que
la autenticación de QA Academy depende de cookies o de un `storageState` compartido entre API y UI:
el contrato actual utiliza Bearer token y `localStorage`.

## 7. Estrategia de datos y cleanup

Todo dato mutable creado por una prueba tendrá un nombre único:

```text
e2e-<stack>-<timestamp>-<random>
```

Reglas:

- no depender del orden de IDs ni de datos de otra ejecución;
- no modificar permanentemente productos template;
- crear productos propios con permiso `ALL` para editar o eliminar;
- vaciar el carrito cuando el escenario lo requiera;
- eliminar las órdenes creadas cuando el contrato lo permita;
- ejecutar cleanup aunque falle la aserción principal;
- registrar fallos de cleanup en Allure;
- serializar suites que muten carrito, stock u órdenes cuando compartan cuenta;
- preferir una cuenta por worker si posteriormente se habilita paralelismo real.

Las pruebas de filtros relacionales crearán suficientes órdenes controladas para comprobar que las
coincidencias no desaparecen al cambiar de página.

## 8. Cobertura funcional mínima de los tres frameworks

Los tres frameworks completos implementarán el mismo catálogo lógico. Cada stack podrá adaptar
fixtures y sintaxis, pero no omitir la intención.

### UI esencial

1. Login exitoso y error controlado.
2. Store: búsqueda, filtros y cambio de página.
3. Agregar producto al carrito y verificar badge/resumen.
4. Actualizar y eliminar un artículo, manejando el diálogo nativo.
5. Checkout con validaciones negativas y datos de prueba permitidos.
6. Crear una orden y abrir su detalle.
7. Buscar una orden y validar estado, pago y total.
8. Validar al menos un flujo en escritorio y en emulación móvil.

### API REST

1. autenticación válida e inválida;
2. CRUD de un producto propio;
3. permisos y caso negativo de producto no eliminable;
4. carrito: alta, actualización, resumen y limpieza;
5. creación, consulta, cambio de estado, cancelación y cleanup de orden;
6. búsqueda de órdenes con filtros, resumen y paginación;
7. aislamiento de recursos por usuario cuando sea reproducible con fixtures autorizados.

### HTTP QUERY y Query Lab

1. productos mediante QUERY nativo;
2. órdenes mediante QUERY nativo;
3. POST override;
4. POST plano;
5. GET con 405;
6. filtros, ordenamiento, selección de campos y paginación;
7. `total` como campo de orden;
8. `total_amount` únicamente como resumen;
9. Query Lab ejecutado visualmente para productos y órdenes.

La API de Playwright acepta un método HTTP mediante la opción `method`; REST Assured expone
`request(String method, ...)`. Aun así, cada framework deberá conservar una prueba ejecutable de
QUERY contra QA Academy. Esa prueba es parte del contrato, no una suposición basada sólo en la firma
de la librería.

### GraphQL

1. query autenticada;
2. query paginada de productos;
3. mutation con cleanup;
4. carrito u orden mediante mutation;
5. validación de `data` y `errors`;
6. variables y `operationName`.

### Playground

El Playground tiene 24 secciones y debe reconocerse completo mediante un smoke contract que valide
la presencia de sus secciones estables. Los ejemplos profundos se concentrarán en técnicas que
aportan aprendizaje:

- formulario y límites;
- modal;
- tabla con búsqueda y ordenamiento;
- iframe;
- hover o nueva pestaña;
- descarga/carga;
- flakiness con seed reproducible;
- Shadow DOM abierto.

No se escribirán tres copias extensas para cada control HTML. El objetivo es enseñar la técnica y
dejar el contrato completo disponible para ejercicios.

## 9. Emulación móvil

La cobertura móvil será web emulada, no automatización nativa.

- Playwright: proyecto móvil basado en un descriptor de dispositivo versionado en la configuración.
- Selenium: Chrome `mobileEmulation` con métricas y user agent equivalentes documentados.
- Los escenarios móviles se limitarán a navegación responsive y flujos donde el layout cambia:
  Store, carrito/modal y Playground.

No se ejecutará toda la suite dos veces sólo para aumentar el número de pruebas. Se seleccionarán
escenarios que realmente ejerciten comportamiento responsive.

## 10. Allure como contrato de evidencia

Todos los tests producirán:

- `epic`, `feature` y `story`;
- pasos de negocio legibles;
- screenshot en fallos de UI;
- request y response redactados en API;
- traza de Playwright cuando sea útil;
- información de cleanup;
- ambiente y stack sin exponer credenciales.

Los tres stacks escribirán resultados compatibles con Allure. El reporte deberá permitir comparar
la misma intención de prueba en Python, TypeScript y Java.

No se adjuntarán:

- API keys, JWT o contraseñas;
- datos reales de usuario;
- tarjetas o valores de pago fuera de los datos de prueba permitidos;
- encabezados o contratos internos.

## 11. Cypress como demo enfocada

```text
chapter-05/cypress-demo/
├── tests/
│   ├── ui/
│   └── api/
├── pages/
├── services/
├── fixtures/
├── helpers/
├── data/
├── config/
├── cypress.config.ts
├── package.json
├── .env.example
└── README.md
```

La demo mostrará un subconjunto de UI y API que permita comparar experiencia de desarrollo,
arquitectura, selectores, requests y manejo de casos avanzados. No tendrá:

- cobertura equivalente a los tres frameworks principales;
- paridad con los otros tres stacks;
- catálogo completo de pruebas;
- promesa de ser una cuarta opción principal.

## 12. CI obligatorio en `qa-academy-exercises`

Cada test nuevo deberá tener:

1. un comando local reproducible;
2. una entrada real en GitHub Actions;
3. evidencia o reporte recuperable;
4. configuración sin secretos versionados.

Un archivo de prueba que CI no ejecuta no cuenta como cobertura entregada.

El workflow tendrá jobs independientes:

- Python: instalación, lint/formato, tests y resultados Allure;
- TypeScript: instalación, lint/typecheck, Playwright y resultados Allure;
- Java: compilación, TestNG, REST Assured y resultados Allure;
- Cypress demo: lint/typecheck, subconjunto UI/API y resultados Allure.

Los escenarios que modifican datos deberán ejecutarse de forma controlada para no competir por
carrito, stock u órdenes. Si CI no dispone de una cuenta aislada autorizada, esos escenarios no se
simularán con mocks para aparentar cobertura: se documentará y resolverá el fixture antes de
publicarlos.

## 13. Política de código y publicación

- El libro explica; el repositorio completa.
- El libro mostrará completos sólo un test UI estándar y un test API estándar por framework
  principal.
- UI estándar: Store → agregar producto → verificar carrito y subtotal.
- API estándar: ciclo create/get/update/delete de un producto propio, con cleanup.
- Cypress comparará esos dos casos mediante fragmentos breves; no repetirá dos archivos completos.
- QUERY, GraphQL, Shadow DOM, flakiness, móvil y evidencia aparecerán como fragmentos técnicos con
  enlace a su implementación completa.
- No repetir bloques casi idénticos cuando una abstracción pequeña comunica mejor la idea.
- No crear wrappers que sólo renombren una llamada sin aportar contrato o intención.
- Evitar clases base gigantes y helpers genéricos sin responsabilidad clara.
- Ningún ejemplo dependerá de secretos escritos en el código.
- `.env.example` contendrá nombres y valores vacíos, excepto `BASE_URL`.
- `.env`, reportes, trazas, capturas y dependencias estarán ignorados.
- El README de cada stack incluirá instalación, comando local, variables, alcance y cleanup.
- Los inventarios internos de la plataforma no se copiarán al libro ni al repositorio público.

### Presupuesto de código para Word

El capítulo contendrá:

- configuración esencial de Python, TypeScript y Java;
- seis archivos de prueba completos: tres UI y tres API;
- árboles de carpetas y fragmentos mínimos de Page Objects, Service Objects y fixtures;
- una comparación breve de Cypress;
- fragmentos avanzados sólo cuando expliquen una diferencia real.

El catálogo extendido podrá crecer hasta la cobertura definida en
`docs/cap5_CATALOGO_pruebas_ui_api.md`, pero vivirá en GitHub y se incorporará por fases. El lector
será invitado a ejecutar y explorar esos casos; no se reproducirán en Word.

## 14. Secuencia editorial definitiva

### 14.1 Introducción

- Qué se construirá.
- Por qué existen tres stacks.
- Qué comparte cada framework y qué cambia.
- Plataforma, alcance y requisitos.

### 14.2 Arquitectura antes de herramientas

- Pirámide y ubicación de UI/API.
- Page Object y Service Object.
- Fixtures, datos, configuración y helpers.
- Mapa común de carpetas.

### 14.3 Preparación de los tres proyectos

- Python.
- TypeScript.
- Java.
- Variables y política de secretos.
- Primer smoke test y primer resultado Allure.

### 14.4 Autenticación reutilizable

- Login como escenario.
- Bearer token para API.
- Preparación de `localStorage` para flujos UI.
- Terms Gate sin bypass de automatización.

### 14.5 UI hands-on

- Store.
- Carrito y diálogo nativo.
- Checkout.
- Orden y detalle.
- Desktop frente a móvil emulado.

### 14.6 API REST y ciclo de datos

- Service Objects.
- Productos.
- Carrito.
- Órdenes.
- Setup, assertions y cleanup.
- Casos positivos, negativos y de límites.

### 14.7 HTTP QUERY y Query Lab

- Por qué existe QUERY.
- Cuatro comportamientos de transporte.
- Productos frente a órdenes.
- Campo `total` y agregado `total_amount`.
- Filtros relacionales y paginación.
- Ejecución desde Query Lab.

### 14.8 GraphQL

- Queries, mutations, variables y `operationName`.
- Diferencia entre status HTTP y errores GraphQL.
- Reuso de la capa de servicios.

### 14.9 Playground

- Contrato de 24 secciones.
- Formulario y DataTable.
- iframe, descarga y nueva pestaña.
- Shadow DOM.
- Flakiness reproducible sin retries ciegos.

### 14.10 Evidencia y ejecución

- Allure.
- Fallos y adjuntos.
- Comandos locales.
- GitHub Actions.
- Qué significa que una prueba esté realmente integrada.

### 14.11 Demo de Cypress

- Alcance deliberadamente pequeño.
- Comparación técnica.
- Cuándo encaja y por qué no es el cuarto framework.

### 14.12 Cierre

- Comparación de los tres stacks.
- Decisiones de mantenimiento.
- Puente al capítulo 6.
- MCP reservado para el capítulo de IA.

## 15. Trabajo previo a la escritura

La plataforma ya está lista y sus contratos fueron validados. Antes de redactar el capítulo sólo
queda trabajo de implementación del repositorio de ejercicios:

1. preparar la estructura `chapter-05/`;
2. configurar `.gitignore`, `.env.example` y README;
3. crear los tres smoke tests y conectarlos a CI;
4. implementar primero el catálogo común en TypeScript como referencia;
5. trasladar la intención a Python y Java sin traducción línea por línea;
6. ejecutar QUERY nativo en los tres stacks contra la plataforma;
7. incorporar Allure y comprobar que no filtra secretos;
8. completar la demo de Cypress;
9. verificar todos los comandos localmente y en CI;
10. seleccionar los seis tests completos y los fragmentos avanzados;
11. comenzar la escritura usando únicamente ejemplos que ya compilan y pasan.

## 16. Criterio de “planeación terminada”

La planeación queda cerrada porque:

- los cuatro stacks y runners están definidos;
- la arquitectura y sus responsabilidades están definidas;
- el alcance y las exclusiones están definidos;
- MCP tiene destino editorial;
- Query Lab diferencia productos y órdenes;
- `total` y `total_amount` tienen contratos inequívocos;
- Playground tiene estrategia completa sin inflar el capítulo;
- autenticación, datos, cleanup, móvil y Allure tienen enfoque común;
- Cypress tiene la misma arquitectura y un alcance limitado;
- cada prueba deberá ejecutarse en CI;
- el libro tiene un presupuesto explícito de seis archivos de prueba completos;
- el siguiente paso ya no es investigar la plataforma, sino construir
  `qa-academy-exercises/chapter-05`.
