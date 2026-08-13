# ============================================================================
# chapter1_practice.py
# CHAPTER 1: BASIC PYTHON PROGRAMMING — Complete Reference File
# Book: Zero to SDET — De Cero a Ingeniero de Automatización
# ============================================================================
#
# This file contains ALL the code from Chapter 1, written progressively
# as it appears in the book. Use it to:
#
#   ✅ Compare your code with the official version line by line
#   ✅ Verify you didn't skip any important section
#   ✅ Debug if something doesn't work in your local version
#   ✅ Quick reference for all concepts when you need them
#
# Do NOT use this file to:
#
#   ❌ Copy it without having written the code yourself first
#   ❌ Skip sections thinking "I'll copy it later"
#   ❌ Avoid practicing by writing code manually
#
# REMINDER: Writing code manually is ESSENTIAL for learning.
# The muscle memory of writing syntax, making mistakes,
# and correcting them is irreplaceable. If you copied the code
# without writing it yourself, you didn't learn.
# Go back and write it manually.
# ============================================================================


# ============================================================================
# SECTION 1: VARIABLES AND DATA TYPES
# SDET Context: Variables are the fundamental building blocks of automation.
# They store environment URLs, API responses, timeouts, test names.
# ============================================================================

# Variables an SDET uses day to day
test_case_name = "TC-001: Validate Successful Login"
timeout_seconds = 30
base_url = "https://staging.my-app.com"
is_test_passing = False  # We haven't run anything yet
response_time_ms = 245.8

# Print variables
print("=== TEST CONFIGURATION ===")
print("Test Case:", test_case_name)
print("Timeout:", timeout_seconds)
print("Base URL:", base_url)
print("Test passing?:", is_test_passing)
print("Response time:", response_time_ms, "ms")

# --- Data type verification ---
# Piedra Rosetta: Python infers types automatically.
# In Java (Chapter 2) you will have to declare them explicitly:
#   int timeout = 30;
#   String baseUrl = "https://...";
# Python trusts you; Java trusts no one.
print("\n=== DATA TYPES ===")
print("Type of 'test_case_name':", type(test_case_name))
print("Type of 'timeout_seconds':", type(timeout_seconds))
print("Type of 'response_time_ms':", type(response_time_ms))
print("Type of 'is_test_passing':", type(is_test_passing))


# ============================================================================
# SECTION 2: BASIC OPERATIONS
# SDET Context: Testing metrics — calculate pass rates, response times,
# build URLs dynamically.
# ============================================================================

# Number operations — Testing metrics
print("\n=== OPERATIONS — TEST METRICS ===")
total_tests = 150
tests_passed = 132
tests_failed = total_tests - tests_passed

print("Total tests:", total_tests)
print("Tests passed:", tests_passed)
print("Tests failed:", tests_failed)
print("Success rate:", (tests_passed / total_tests) * 100, "%")
print("Tests per module (5 modules):", total_tests // 5)
print("Remaining tests:", total_tests % 5)

# String operations — Build URLs dynamically
environment = "staging"
endpoint = "/api/v1/users"
full_url = "https://" + environment + ".my-app.com" + endpoint
print("\nConstructed URL:", full_url)

# Visual separator for reports
separator = "=" * 50
print(separator)


# ============================================================================
# SECTION 3: STRING FORMATTING
# SDET Context: Generate execution logs, formatted reports,
# descriptive error messages.
# ============================================================================

# String formatting — Testing reports
print("\n=== STRING FORMATTING ===")

test_name = "Validate Login"
status_code = 200
response_time = 0.345

# Method 1: Concatenation (basic, less recommended)
log1 = "Test: " + test_name + " | Status: " + str(status_code)
print("Concatenation:", log1)

# Method 2: f-strings (RECOMMENDED - Python 3.6+)
log2 = f"Test: {test_name} | Status: {status_code} | Time: {response_time}s"
print("f-string:", log2)

# Method 3: .format() (older but valid)
log3 = "Test: {} | Status: {} | Time: {}s".format(test_name, status_code, response_time)
print(".format():", log3)

# f-strings with expressions — Formatted report
print(f"\n{'='*40}")
print(f"{'EXECUTION REPORT':^40}")
print(f"{'='*40}")
print(f"Response time: {response_time:.3f}s")
print(f"Time in milliseconds: {response_time * 1000:.0f}ms")
print(f"Status: {'✓ PASSED' if status_code == 200 else '✗ FAILED'}")


# ============================================================================
# SECTION 4: CONTROL STRUCTURES — if/elif/else
# SDET Context: Validate HTTP responses, classify status codes,
# determine if a test passes or fails based on multiple conditions.
# ============================================================================

# --- Conditionals — HTTP response validation ---
print("\n=== HTTP RESPONSE VALIDATION ===")

status_code = 200

# Scenario 1: Successful response
# Scenario 2: Error response
if status_code == 200:
    print("✓ Test PASSED — Successful login")
    print("  The endpoint responded correctly")
else:
    print("✗ Test FAILED — Login error")
    print(f"  Status code received: {status_code}")

# --- if/elif/else — HTTP status code classification ---
print("\n=== STATUS CODE CLASSIFICATION ===")

response_code = 404

# Multiple HTTP response scenarios:
if response_code >= 200 and response_code < 300:
    print(f"✓ SUCCESS ({response_code}) — Successful operation")
elif response_code >= 300 and response_code < 400:
    print(f"↪ REDIRECT ({response_code}) — Redirect detected")
elif response_code >= 400 and response_code < 500:
    print(f"✗ CLIENT ERROR ({response_code}) — Client error")
    if response_code == 401:
        print("  → Unauthorized. Expired token?")
    elif response_code == 403:
        print("  → Forbidden. Insufficient permissions")
    elif response_code == 404:
        print("  → Resource not found. Correct URL?")
else:
    print(f"🔥 SERVER ERROR ({response_code}) — Server failed")

print(f"Status code analyzed: {response_code}")

# --- Logical operators — API Response validation ---
print("\n=== COMPLETE API RESPONSE VALIDATION ===")

status_code = 200
response_time_ms = 450
max_response_time_ms = 500
body_has_data = True

# Scenario 1: Everything correct (AND)
if status_code == 200 and response_time_ms <= max_response_time_ms and body_has_data:
    print("✓ Test PASSED — All validations passed")
    print(f"  Status: {status_code} | Time: {response_time_ms}ms | Data: OK")
# Scenario 2: Status ok but something else failed (partial OR)
elif status_code == 200 and (response_time_ms > max_response_time_ms or not body_has_data):
    print("⚠ Test WARNING — Status OK but with issues")
    if response_time_ms > max_response_time_ms:
        print(f"  → Response time exceeded: {response_time_ms}ms > {max_response_time_ms}ms SLA")
    if not body_has_data:
        print("  → Empty response body")
# Scenario 3: Incorrect status code
else:
    print(f"✗ Test FAILED — Status code: {status_code}")


# ============================================================================
# SECTION 5: LOOPS — for and while
# SDET Context: Iterate over test suites, browsers for cross-browser
# testing, endpoints for health checks, retries (polling).
# ============================================================================

# --- For loop ---
print("\n=== FOR LOOP ===")

# Iterate over a basic range — Test retries
print("Running failed test retries:")
for attempt in range(1, 4):
    print(f"  Attempt #{attempt} of 3...")

# Iterate over a list — Cross-browser testing
print("\nRunning tests in multiple browsers:")
browsers = ["Chrome", "Firefox", "Safari", "Edge"]
for browser in browsers:
    print(f"  🌐 Running suite in {browser}...")

# Iterate over test users
print("\nValidating login with different users:")
test_users = ["admin@test.com", "user@test.com", "guest@test.com"]
for i, user in enumerate(test_users, 1):
    print(f"  Test {i}: Login with {user}")

# Iterate over endpoints
print("\nEndpoint health check:")
endpoints = ["/api/v1/users", "/api/v1/products", "/api/v1/orders"]
for endpoint in endpoints:
    print(f"  GET https://staging.app.com{endpoint} → 200 OK")

# Iterate over a string
print("\nLetters of 'SDET':")
for letter in "SDET":
    print(f"  {letter}")

# --- While loop — Polling: Wait until a service responds ---
print("\n=== WHILE LOOP — POLLING ===")

import random  # To simulate random responses

max_attempts = 5
attempt = 0
service_ready = False

print("Waiting for service to become available...")
while attempt < max_attempts and not service_ready:
    attempt += 1
    # Simulating: service becomes ready on attempt 3
    if attempt >= 3:
        service_ready = True

    if service_ready:
        print(f"  Attempt {attempt}: ✓ Service available!")
    else:
        print(f"  Attempt {attempt}: ⏳ Service not available, retrying...")

if service_ready:
    print("→ Continuing with test execution")
else:
    print("→ TIMEOUT: Service never responded")

# --- break and continue — Real testing scenarios ---
print("\n=== BREAK AND CONTINUE ===")

# break: Stop execution when a blocker is found
print("Running test suite (break when BLOCKER is found):")
test_results = ["PASSED", "PASSED", "FAILED", "BLOCKER", "PASSED", "PASSED"]
for i, result in enumerate(test_results, 1):
    if result == "BLOCKER":
        print(f"  Test {i}: 🛑 {result} — Stopping execution!")
        break
    print(f"  Test {i}: {result}")
print("Suite stopped. Review the blocker before continuing.")

# continue: Skip disabled tests
print("\nRunning tests (skipping SKIP status):")
tests = [
    {"name": "test_login", "status": "enabled"},
    {"name": "test_logout", "status": "skip"},
    {"name": "test_search", "status": "enabled"},
    {"name": "test_checkout", "status": "skip"},
    {"name": "test_payment", "status": "enabled"},
]
for test in tests:
    if test["status"] == "skip":
        continue  # Skip disabled tests
    print(f"  ▶ Running: {test['name']}")


# ============================================================================
# SECTION 6: FUNCTIONS
# SDET Context: Reusable testing helpers — result logging,
# response validation, metrics calculation, test configuration.
# Without mastering functions, you cannot build a framework.
# ============================================================================

# --- Basic function ---
print("\n=== FUNCTIONS ===")


def print_test_header():
    print("=" * 50)
    print("     AUTOMATED TEST EXECUTION REPORT")
    print("=" * 50)


# Call the function
print_test_header()


# --- Function with parameters — Execution log ---
def log_test_result(test_name, status):
    symbol = "✓" if status == "PASSED" else "✗"
    print(f"  {symbol} [{status}] {test_name}")


log_test_result("TC-001: Validate Login", "PASSED")
log_test_result("TC-002: Validate Logout", "FAILED")
log_test_result("TC-003: Validate Search", "PASSED")


# --- Function that returns a value — Response validation ---
def validate_status_code(actual, expected):
    """Validates that the status code is the expected one"""
    return actual == expected


result = validate_status_code(200, 200)
print(f"\nCorrect status code? {result}")


# More complex function — Calculate pass rate
def calculate_pass_rate(passed, total):
    """Calculates the percentage of successful tests"""
    if total == 0:
        return 0.0
    return (passed / total) * 100


pass_rate = calculate_pass_rate(45, 50)
print(f"Pass rate: {pass_rate}%")


# --- Function with default parameter — Test configuration ---
def setup_test(test_name, environment="staging", timeout=30):
    print(f"\n  Setting up: {test_name}")
    print(f"  Environment: {environment}")
    print(f"  Timeout: {timeout}s")


setup_test("Login Test")                           # Uses defaults
setup_test("Checkout Test", "production", 60)      # Override all
setup_test("Search Test", timeout=10)              # Override timeout only


# ============================================================================
# SECTION 7: LISTS
# SDET Context: Test case lists, browsers for cross-browser
# testing, URLs, test data. You will use lists constantly.
# ============================================================================

# Lists — Test Suite Management
print("\n=== LISTS ===")

# Create test cases list
test_suite = ["test_login", "test_search", "test_cart"]
print("Test Suite:", test_suite)

# Access elements (index starts at 0)
print("First test:", test_suite[0])
print("Last test:", test_suite[-1])

# Add a new test
test_suite.append("test_checkout")
print("After append:", test_suite)

# Insert a priority test at the beginning
test_suite.insert(0, "test_smoke_health_check")
print("After insert:", test_suite)

# Remove a deprecated test
test_suite.remove("test_cart")
print("After remove:", test_suite)

# Suite length
print("Total tests in suite:", len(test_suite))

# Check if a test exists
if "test_login" in test_suite:
    print("✓ test_login is included in the suite")

# Iterate over the full suite
print("\nExecution order:")
for i, test in enumerate(test_suite, 1):
    print(f"  {i}. {test}")


# ============================================================================
# SECTION 8: DICTIONARIES
# SDET Context: Test results, configurations, payloads.
# FLASHFORWARD — API Testing (Chapter 6): A Python dictionary has
# EXACTLY the same structure as a JSON payload. When you send a
# POST /api/users with body {"username": "admin", "password": "secret"},
# that is a dictionary. You are learning two things at once.
# ============================================================================

# Dictionaries — Test Case Result
print("\n=== DICTIONARIES ===")

# Create dictionary — Identical structure to a JSON payload
test_result = {
    "test_id": "TC-001",
    "test_name": "Validate Successful Login",
    "status": "PASSED",
    "execution_time_ms": 1250,
    "environment": "staging",
    "browser": "Chrome",
    "tags": ["smoke", "regression", "login"]  # List inside dict = Array inside JSON
}

# Access values
print("Test ID:", test_result["test_id"])
print("Status:", test_result["status"])

# Add new key — Add metadata
test_result["executed_by"] = "automation_pipeline"
print("Executed by:", test_result["executed_by"])

# Modify value — Test changed to failed on re-run
test_result["status"] = "FAILED"
print("Updated status:", test_result["status"])

# Check if a key exists
if "execution_time_ms" in test_result:
    print(f"Execution time: {test_result['execution_time_ms']}ms")

# Iterate over dictionary — Generate report
print("\n--- COMPLETE TEST REPORT ---")
for key, value in test_result.items():
    print(f"  {key}: {value}")


# ============================================================================
# SECTION 9: EXCEPTION HANDLING (try/except)
# SDET Context: Resilience in automation. Without try/except your framework
# crashes on the first error. With try/except, it handles the error,
# reports it and continues with the next test.
# ============================================================================

# Exception handling — Resilience in automation
print("\n=== EXCEPTION HANDLING ===")

# Scenario 1: Parse an invalid response
print("Scenario 1: Parse invalid response")
try:
    response_body = "<!DOCTYPE html><html>Error Page</html>"
    # Simulating trying to parse as a number (as if we expected an ID)
    user_id = int(response_body)
    print("User ID:", user_id)
except ValueError:
    print("✗ Error: Response does not contain a valid numeric value")
    user_id = None

print(f"✓ Framework continues executing... (user_id = {user_id})")

# Scenario 2: Division by zero in metrics
print("\nScenario 2: Calculate metrics with empty data")
try:
    total_tests = 0
    passed_tests = 0
    pass_rate = passed_tests / total_tests
except ZeroDivisionError:
    print("✗ Error: Cannot calculate rate — 0 tests executed")
    pass_rate = 0.0
except Exception as e:
    print(f"✗ Unexpected error: {e}")
finally:
    print(f"✓ Pass rate reported: {pass_rate}%")
    print("✓ Finally block: Test data cleanup completed")


# ============================================================================
# SECTION 10: LAMBDA FUNCTIONS (Bonus)
# SDET Context: Quick status code validations, test data transformations,
# filtering test results.
# ============================================================================

# Lambda functions — Quick testing utilities
print("\n=== LAMBDA FUNCTIONS ===")

# Lambda to validate status codes quickly
is_success = lambda code: 200 <= code < 300
is_client_error = lambda code: 400 <= code < 500
is_server_error = lambda code: 500 <= code < 600

print("200 is success?", is_success(200))
print("404 is client error?", is_client_error(404))
print("503 is server error?", is_server_error(503))

# Lambda with map() — Format test names
raw_test_names = ["login test", "search test", "checkout test"]
formatted_names = list(map(lambda name: f"test_{name.replace(' ', '_')}", raw_test_names))
print("\nFormatted tests:", formatted_names)

# Lambda with filter() — Filter tests that passed
results = [
    {"name": "test_login", "passed": True},
    {"name": "test_search", "passed": False},
    {"name": "test_cart", "passed": True},
    {"name": "test_checkout", "passed": False},
]
passed_tests = list(filter(lambda t: t["passed"], results))
print("Tests that passed:", [t["name"] for t in passed_tests])


# ============================================================================
# END OF REFERENCE FILE
# ============================================================================
#
# Concepts covered in this file:
#
#   1.  Variables and data types (SDET context)
#   2.  Arithmetic operations (testing metrics)
#   3.  String formatting — f-strings, .format(), concatenation (logs/reports)
#   4.  Conditionals if/elif/else (HTTP status code validation)
#   5.  For loops (iterating over test suites, browsers, endpoints)
#   6.  While loops (polling / waiting for service availability)
#   7.  break and continue (handling blockers and disabled tests)
#   8.  Functions with parameters, return values and defaults (testing helpers)
#   9.  Lists (test suite management)
#   10. Dictionaries (identical structure to JSON payloads — Flashforward Ch. 6)
#   11. Exception handling try/except/finally (framework resilience)
#   12. Lambda functions with map() and filter() (quick utilities)
#
# NOTE: The Imports sections (multiple files) are not in this file
# because they require separate files. Refer to the chapter for:
#   - test_helpers.py (testing utilities)
#   - test_imports.py (simple imports test)
#   - utils/api_helpers.py (helpers in folder with __init__.py)
#   - main.py (imports from folders test)
#
# The 10 practice exercises are also not here because they are
# independent files (exercise_1.py to exercise_10.py).
#
# If you made it here and wrote all the code manually:
# Congratulations! You have the solid foundation for Chapter 2 (Java).
# ============================================================================