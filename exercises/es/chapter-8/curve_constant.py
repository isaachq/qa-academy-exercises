from bench import measure

def make_suite(n):
    names = [f"test_case_{i}" for i in range(n)]
    index = {name: i for i, name in enumerate(names)}
    return index

def find_test(index):
    found = 0
    for _ in range(200000):
        if "test_case_500" in index:
            found = found + 1
    return found

measure(find_test, [100000, 200000, 400000, 800000],
        make_data=make_suite)
