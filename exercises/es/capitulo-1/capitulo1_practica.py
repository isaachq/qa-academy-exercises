# ============================================================================
# capitulo1_practica.py
# CAPÍTULO 1: PROGRAMACIÓN BÁSICA CON PYTHON — Archivo de Referencia Completo
# Libro: Zero to SDET — De Cero a Ingeniero de Automatización
# ============================================================================
#
# Este archivo contiene TODO el código del Capítulo 1, escrito progresivamente
# tal como aparece en el libro. Úsalo para:
#
#   ✅ Comparar tu código con la versión oficial línea por línea
#   ✅ Verificar que no te saltaste ninguna sección importante
#   ✅ Debuggear si algo no funciona en tu versión local
#   ✅ Referencia rápida de todos los conceptos cuando los necesites
#
# NO uses este archivo para:
#
#   ❌ Copiarlo sin haber escrito el código tú mismo primero
#   ❌ Saltarte secciones del capítulo pensando "ya lo copiaré después"
#   ❌ Evitar practicar escribiendo código manualmente
#
# RECORDATORIO: Escribir el código manualmente es ESENCIAL para el
# aprendizaje. La memoria muscular de escribir sintaxis, cometer errores,
# y corregirlos es irreemplazable. Si copiaste el código sin escribirlo
# tú mismo, no aprendiste. Regresa y escríbelo manualmente.
# ============================================================================


# ============================================================================
# SECCIÓN 1: VARIABLES Y TIPOS DE DATOS
# Contexto SDET: Las variables son las piezas fundamentales de automation.
# Guardan URLs de entornos, respuestas de APIs, timeouts, nombres de tests.
# ============================================================================

# Variables de un SDET en su día a día
test_case_name = "TC-001: Validar Login Exitoso"
timeout_seconds = 30
base_url = "https://staging.mi-aplicacion.com"
is_test_passing = False  # Todavía no hemos ejecutado nada
response_time_ms = 245.8

# Imprimir variables
print("=== CONFIGURACIÓN DE TEST ===")
print("Test Case:", test_case_name)
print("Timeout:", timeout_seconds)
print("URL Base:", base_url)
print("¿Test pasando?:", is_test_passing)
print("Tiempo de respuesta:", response_time_ms, "ms")

# --- Tipos de datos — verificación ---
# Piedra Rosetta: Python infiere los tipos automáticamente.
# En Java (Capítulo 2) tendrás que declararlos explícitamente:
#   int timeout = 30;
#   String baseUrl = "https://...";
# Python confía en ti; Java no confía en nadie.
print("\n=== TIPOS DE DATOS ===")
print("Tipo de 'test_case_name':", type(test_case_name))
print("Tipo de 'timeout_seconds':", type(timeout_seconds))
print("Tipo de 'response_time_ms':", type(response_time_ms))
print("Tipo de 'is_test_passing':", type(is_test_passing))


# ============================================================================
# SECCIÓN 2: OPERACIONES BÁSICAS
# Contexto SDET: Métricas de testing — calcular pass rates, tiempos,
# construir URLs dinámicamente.
# ============================================================================

# Operaciones con números — Métricas de testing
print("\n=== OPERACIONES — MÉTRICAS DE TEST ===")
total_tests = 150
tests_passed = 132
tests_failed = total_tests - tests_passed

print("Total de tests:", total_tests)
print("Tests pasados:", tests_passed)
print("Tests fallidos:", tests_failed)
print("Porcentaje de éxito:", (tests_passed / total_tests) * 100, "%")
print("Tests por módulo (5 módulos):", total_tests // 5)
print("Tests sobrantes:", total_tests % 5)

# Operaciones con strings — Construir URLs dinámicamente
environment = "staging"
endpoint = "/api/v1/users"
full_url = "https://" + environment + ".mi-app.com" + endpoint
print("\nURL construida:", full_url)

# Separador visual para reportes
separador = "=" * 50
print(separador)


# ============================================================================
# SECCIÓN 3: FORMATEO DE STRINGS
# Contexto SDET: Generar logs de ejecución, reportes formateados,
# mensajes de error descriptivos.
# ============================================================================

# Formateo de strings — Reportes de testing
print("\n=== FORMATEO DE STRINGS ===")

test_name = "Validar Login"
status_code = 200
response_time = 0.345

# Forma 1: Concatenación (básica, menos recomendada)
log1 = "Test: " + test_name + " | Status: " + str(status_code)
print("Concatenación:", log1)

# Forma 2: f-strings (RECOMENDADA - Python 3.6+)
log2 = f"Test: {test_name} | Status: {status_code} | Tiempo: {response_time}s"
print("f-string:", log2)

# Forma 3: .format() (antigua pero válida)
log3 = "Test: {} | Status: {} | Tiempo: {}s".format(test_name, status_code, response_time)
print(".format():", log3)

# f-strings con expresiones — Reporte formateado
print(f"\n{'='*40}")
print(f"{'REPORTE DE EJECUCIÓN':^40}")
print(f"{'='*40}")
print(f"Tiempo de respuesta: {response_time:.3f}s")
print(f"Tiempo en milisegundos: {response_time * 1000:.0f}ms")
print(f"Status: {'✓ PASSED' if status_code == 200 else '✗ FAILED'}")


# ============================================================================
# SECCIÓN 4: ESTRUCTURAS DE CONTROL — if/elif/else
# Contexto SDET: Validar respuestas HTTP, clasificar status codes,
# determinar si un test pasa o falla basado en múltiples condiciones.
# ============================================================================

# --- Condicionales — Validación de respuesta HTTP ---
print("\n=== VALIDACIÓN DE RESPUESTA HTTP ===")

status_code = 200

# Escenario 1: Respuesta exitosa
# Escenario 2: Respuesta con error
if status_code == 200:
    print("✓ Test PASSED — Login exitoso")
    print("  El endpoint respondió correctamente")
else:
    print("✗ Test FAILED — Error en login")
    print(f"  Status code recibido: {status_code}")

# --- if/elif/else — Clasificación de status codes HTTP ---
print("\n=== CLASIFICACIÓN DE STATUS CODE ===")

response_code = 404

# Múltiples escenarios de respuesta HTTP:
if response_code >= 200 and response_code < 300:
    print(f"✓ SUCCESS ({response_code}) — Operación exitosa")
elif response_code >= 300 and response_code < 400:
    print(f"↪ REDIRECT ({response_code}) — Redirección detectada")
elif response_code >= 400 and response_code < 500:
    print(f"✗ CLIENT ERROR ({response_code}) — Error del cliente")
    if response_code == 401:
        print("  → No autorizado. ¿Token expirado?")
    elif response_code == 403:
        print("  → Prohibido. Sin permisos suficientes")
    elif response_code == 404:
        print("  → Recurso no encontrado. ¿URL correcta?")
else:
    print(f"🔥 SERVER ERROR ({response_code}) — El servidor falló")

print(f"Status code analizado: {response_code}")

# --- Operadores lógicos — Validación de API Response ---
print("\n=== VALIDACIÓN COMPLETA DE API RESPONSE ===")

status_code = 200
response_time_ms = 450
max_response_time_ms = 500
body_has_data = True

# Escenario 1: Todo correcto (AND)
if status_code == 200 and response_time_ms <= max_response_time_ms and body_has_data:
    print("✓ Test PASSED — Todas las validaciones correctas")
    print(f"  Status: {status_code} | Tiempo: {response_time_ms}ms | Datos: OK")
# Escenario 2: Status ok pero algo más falló (OR parcial)
elif status_code == 200 and (response_time_ms > max_response_time_ms or not body_has_data):
    print("⚠ Test WARNING — Status OK pero con issues")
    if response_time_ms > max_response_time_ms:
        print(f"  → Tiempo de respuesta excedido: {response_time_ms}ms > {max_response_time_ms}ms SLA")
    if not body_has_data:
        print("  → Response body vacío")
# Escenario 3: Status code incorrecto
else:
    print(f"✗ Test FAILED — Status code: {status_code}")


# ============================================================================
# SECCIÓN 5: LOOPS — for y while
# Contexto SDET: Iterar sobre test suites, navegadores para cross-browser
# testing, endpoints para health checks, reintentos (polling).
# ============================================================================

# --- Loop for ---
print("\n=== LOOP FOR ===")

# Iterar sobre un rango básico — Reintentos de test
print("Ejecutando reintentos de test fallido:")
for intento in range(1, 4):
    print(f"  Intento #{intento} de 3...")

# Iterar sobre una lista — Cross-browser testing
print("\nEjecutando tests en múltiples navegadores:")
navegadores = ["Chrome", "Firefox", "Safari", "Edge"]
for navegador in navegadores:
    print(f"  🌐 Ejecutando suite en {navegador}...")

# Iterar sobre usuarios de prueba
print("\nValidando login con diferentes usuarios:")
usuarios_prueba = ["admin@test.com", "user@test.com", "guest@test.com"]
for i, usuario in enumerate(usuarios_prueba, 1):
    print(f"  Test {i}: Login con {usuario}")

# Iterar sobre endpoints
print("\nHealth check de endpoints:")
endpoints = ["/api/v1/users", "/api/v1/products", "/api/v1/orders"]
for endpoint in endpoints:
    print(f"  GET https://staging.app.com{endpoint} → 200 OK")

# Iterar sobre un string
print("\nLetras de 'SDET':")
for letra in "SDET":
    print(f"  {letra}")

# --- Loop while — Polling: Esperar hasta que un servicio responda ---
print("\n=== LOOP WHILE — POLLING ===")

import random  # Para simular respuestas variables

max_intentos = 5
intento = 0
servicio_listo = False

print("Esperando a que el servicio esté disponible...")
while intento < max_intentos and not servicio_listo:
    intento += 1
    # Simulamos: el servicio se pone listo en el intento 3
    if intento >= 3:
        servicio_listo = True

    if servicio_listo:
        print(f"  Intento {intento}: ✓ Servicio disponible!")
    else:
        print(f"  Intento {intento}: ⏳ Servicio no disponible, reintentando...")

if servicio_listo:
    print("→ Continuando con la ejecución de tests")
else:
    print("→ TIMEOUT: El servicio nunca respondió")

# --- break y continue — Escenarios reales de testing ---
print("\n=== BREAK Y CONTINUE ===")

# break: Detener ejecución al encontrar un blocker
print("Ejecutando test suite (break al encontrar un BLOCKER):")
test_results = ["PASSED", "PASSED", "FAILED", "BLOCKER", "PASSED", "PASSED"]
for i, resultado in enumerate(test_results, 1):
    if resultado == "BLOCKER":
        print(f"  Test {i}: 🛑 {resultado} — Deteniendo ejecución!")
        break
    print(f"  Test {i}: {resultado}")
print("Suite detenida. Revisar el blocker antes de continuar.")

# continue: Saltar tests deshabilitados
print("\nEjecutando tests (saltando los SKIP):")
tests = [
    {"name": "test_login", "status": "enabled"},
    {"name": "test_logout", "status": "skip"},
    {"name": "test_search", "status": "enabled"},
    {"name": "test_checkout", "status": "skip"},
    {"name": "test_payment", "status": "enabled"},
]
for test in tests:
    if test["status"] == "skip":
        continue  # Salta los tests deshabilitados
    print(f"  ▶ Ejecutando: {test['name']}")


# ============================================================================
# SECCIÓN 6: FUNCIONES
# Contexto SDET: Helpers de testing reutilizables — log de resultados,
# validación de responses, cálculo de métricas, configuración de tests.
# Si no dominas funciones, no puedes construir un framework.
# ============================================================================

# --- Función básica ---
print("\n=== FUNCIONES ===")


def print_test_header():
    print("=" * 50)
    print("     AUTOMATED TEST EXECUTION REPORT")
    print("=" * 50)


# Llamar la función
print_test_header()


# --- Función con parámetros — Log de ejecución ---
def log_test_result(test_name, status):
    symbol = "✓" if status == "PASSED" else "✗"
    print(f"  {symbol} [{status}] {test_name}")


log_test_result("TC-001: Validar Login", "PASSED")
log_test_result("TC-002: Validar Logout", "FAILED")
log_test_result("TC-003: Validar Búsqueda", "PASSED")


# --- Función que retorna valor — Validación de response ---
def validate_status_code(actual, expected):
    """Valida que el status code sea el esperado"""
    return actual == expected


result = validate_status_code(200, 200)
print(f"\n¿Status code correcto? {result}")


# Función más compleja — Calcular tasa de éxito
def calculate_pass_rate(passed, total):
    """Calcula el porcentaje de tests exitosos"""
    if total == 0:
        return 0.0
    return (passed / total) * 100


pass_rate = calculate_pass_rate(45, 50)
print(f"Tasa de éxito: {pass_rate}%")


# --- Función con parámetro por defecto — Configuración de test ---
def setup_test(test_name, environment="staging", timeout=30):
    print(f"\n  Configurando: {test_name}")
    print(f"  Entorno: {environment}")
    print(f"  Timeout: {timeout}s")


setup_test("Login Test")                           # Usa defaults
setup_test("Checkout Test", "production", 60)      # Override todo
setup_test("Search Test", timeout=10)              # Override solo timeout


# ============================================================================
# SECCIÓN 7: LISTAS
# Contexto SDET: Listas de test cases, navegadores para cross-browser
# testing, URLs, datos de prueba. Usarás listas constantemente.
# ============================================================================

# Listas — Gestión de Test Suite
print("\n=== LISTAS ===")

# Crear lista de test cases
test_suite = ["test_login", "test_search", "test_cart"]
print("Test Suite:", test_suite)

# Acceder elementos (índice empieza en 0)
print("Primer test:", test_suite[0])
print("Último test:", test_suite[-1])

# Agregar un test nuevo
test_suite.append("test_checkout")
print("Después de append:", test_suite)

# Insertar un test prioritario al inicio
test_suite.insert(0, "test_smoke_health_check")
print("Después de insert:", test_suite)

# Eliminar un test deprecado
test_suite.remove("test_cart")
print("Después de remove:", test_suite)

# Longitud de la suite
print("Total de tests en suite:", len(test_suite))

# Verificar si un test existe
if "test_login" in test_suite:
    print("✓ test_login está incluido en la suite")

# Iterar sobre la suite completa
print("\nOrden de ejecución:")
for i, test in enumerate(test_suite, 1):
    print(f"  {i}. {test}")


# ============================================================================
# SECCIÓN 8: DICCIONARIOS
# Contexto SDET: Resultados de tests, configuraciones, payloads.
# FLASHFORWARD — API Testing (Capítulo 6): Un diccionario de Python tiene
# EXACTAMENTE la misma estructura que un JSON payload. Cuando envíes un
# POST /api/users con body {"username": "admin", "password": "secret"},
# eso es un diccionario. Estás aprendiendo dos cosas a la vez.
# ============================================================================

# Diccionarios — Resultado de un Test Case
print("\n=== DICCIONARIOS ===")

# Crear diccionario — Esto es idéntico a un JSON payload
test_result = {
    "test_id": "TC-001",
    "test_name": "Validar Login Exitoso",
    "status": "PASSED",
    "execution_time_ms": 1250,
    "environment": "staging",
    "browser": "Chrome",
    "tags": ["smoke", "regression", "login"]  # Lista dentro de dict = Array dentro de JSON
}

# Acceder valores
print("Test ID:", test_result["test_id"])
print("Status:", test_result["status"])

# Agregar nueva clave — Agregar metadata
test_result["executed_by"] = "automation_pipeline"
print("Ejecutado por:", test_result["executed_by"])

# Modificar valor — El test pasó a failed en re-run
test_result["status"] = "FAILED"
print("Status actualizado:", test_result["status"])

# Verificar si existe una clave
if "execution_time_ms" in test_result:
    print(f"Tiempo de ejecución: {test_result['execution_time_ms']}ms")

# Iterar sobre el diccionario — Generar reporte
print("\n--- REPORTE COMPLETO DEL TEST ---")
for clave, valor in test_result.items():
    print(f"  {clave}: {valor}")


# ============================================================================
# SECCIÓN 9: MANEJO DE EXCEPCIONES (try/except)
# Contexto SDET: Resiliencia en automation. Sin try/except tu framework
# crashea al primer error. Con try/except, maneja el error, lo reporta
# y continúa con el siguiente test.
# ============================================================================

# Manejo de excepciones — Resiliencia en automation
print("\n=== MANEJO DE EXCEPCIONES ===")

# Escenario 1: Parsear un response inválido
print("Escenario 1: Parsear response inválido")
try:
    response_body = "<!DOCTYPE html><html>Error Page</html>"
    # Simulamos intentar parsear como número (como si esperáramos un ID)
    user_id = int(response_body)
    print("User ID:", user_id)
except ValueError:
    print("✗ Error: Response no contiene un valor numérico válido")
    user_id = None

print(f"✓ Framework continúa ejecutando... (user_id = {user_id})")

# Escenario 2: División por cero en métricas
print("\nEscenario 2: Calcular métricas con datos vacíos")
try:
    total_tests = 0
    passed_tests = 0
    pass_rate = passed_tests / total_tests
except ZeroDivisionError:
    print("✗ Error: No se puede calcular tasa — 0 tests ejecutados")
    pass_rate = 0.0
except Exception as e:
    print(f"✗ Error inesperado: {e}")
finally:
    print(f"✓ Pass rate reportado: {pass_rate}%")
    print("✓ Bloque finally: Limpieza de datos de prueba completada")


# ============================================================================
# SECCIÓN 10: FUNCIONES LAMBDA (Bonus)
# Contexto SDET: Validaciones rápidas de status codes, transformaciones
# de datos de prueba, filtrado de resultados de tests.
# ============================================================================

# Funciones lambda — Utilidades rápidas de testing
print("\n=== FUNCIONES LAMBDA ===")

# Lambda para validar status codes rápidamente
is_success = lambda code: 200 <= code < 300
is_client_error = lambda code: 400 <= code < 500
is_server_error = lambda code: 500 <= code < 600

print("200 es success?", is_success(200))
print("404 es client error?", is_client_error(404))
print("503 es server error?", is_server_error(503))

# Lambda con map() — Formatear nombres de tests
raw_test_names = ["login test", "search test", "checkout test"]
formatted_names = list(map(lambda name: f"test_{name.replace(' ', '_')}", raw_test_names))
print("\nTests formateados:", formatted_names)

# Lambda con filter() — Filtrar tests que pasaron
results = [
    {"name": "test_login", "passed": True},
    {"name": "test_search", "passed": False},
    {"name": "test_cart", "passed": True},
    {"name": "test_checkout", "passed": False},
]
passed_tests = list(filter(lambda t: t["passed"], results))
print("Tests que pasaron:", [t["name"] for t in passed_tests])


# ============================================================================
# FIN DEL ARCHIVO DE REFERENCIA
# ============================================================================
#
# Conceptos cubiertos en este archivo:
#
#   1.  Variables y tipos de datos (contexto SDET)
#   2.  Operaciones aritméticas (métricas de testing)
#   3.  Formateo de strings — f-strings, .format(), concatenación (logs/reportes)
#   4.  Condicionales if/elif/else (validación de HTTP status codes)
#   5.  Loops for (iteración sobre test suites, navegadores, endpoints)
#   6.  Loops while (polling / esperar servicio disponible)
#   7.  break y continue (manejo de blockers y tests deshabilitados)
#   8.  Funciones con parámetros, retorno y valores por defecto (helpers de testing)
#   9.  Listas (gestión de test suites)
#   10. Diccionarios (estructura idéntica a JSON payloads — Flashforward Cap. 6)
#   11. Manejo de excepciones try/except/finally (resiliencia en frameworks)
#   12. Funciones lambda con map() y filter() (utilidades rápidas)
#
# NOTA: Las secciones de Imports (múltiples archivos) no están en este archivo
# porque requieren archivos separados. Consulta el capítulo para:
#   - test_helpers.py (utilidades de testing)
#   - test_imports.py (prueba de imports simples)
#   - utils/api_helpers.py (helpers en carpeta con __init__.py)
#   - main.py (prueba de imports desde carpetas)
#
# Los 10 ejercicios prácticos tampoco están aquí porque son archivos
# independientes (ejercicio_1.py a ejercicio_10.py).
#
# Si llegaste hasta aquí y escribiste todo el código manualmente:
# ¡Felicidades! Tienes la base sólida para el Capítulo 2 (Java).
# ============================================================================
