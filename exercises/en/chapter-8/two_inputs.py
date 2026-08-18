from bench import measure

def compare_suites(suites):
    expected, actual = suites
    only_expected = 0
    for name in expected:
        if name not in actual:
            only_expected = only_expected + 1

    only_actual = 0
    for name in actual:
        if name not in expected:
            only_actual = only_actual + 1
    return only_expected + only_actual

def grow_expected(n):
    expected = [f"test_{i}" for i in range(n)]
    actual = set(f"test_{i}" for i in range(10000))
    return (set(expected), actual)

def grow_actual(m):
    expected = set(f"test_{i}" for i in range(10000))
    actual = [f"test_{i}" for i in range(m)]
    return (expected, set(actual))

print("n grows, m fixed at 10000")
measure(compare_suites, [200000, 400000, 800000, 1600000],
        make_data=grow_expected)

print()
print("m grows, n fixed at 10000")
measure(compare_suites, [200000, 400000, 800000, 1600000],
        make_data=grow_actual)
