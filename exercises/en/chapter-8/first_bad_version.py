calls = 0

def is_bad_version(build, first_bad):
    global calls
    calls = calls + 1
    return build >= first_bad

def find_first_bad_scanning(total, first_bad):
    for build in range(1, total + 1):
        if is_bad_version(build, first_bad):
            return build
    return -1

def find_first_bad_binary(total, first_bad):
    low = 1
    high = total
    while low < high:
        middle = (low + high) // 2
        if is_bad_version(middle, first_bad):
            high = middle
        else:
            low = middle + 1
    return low

def check(name, function):
    results = [
        function(10, 4) == 4,
        function(1, 1) == 1,
        function(100, 1) == 1,
        function(100, 100) == 100,
        function(2, 2) == 2,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("find_first_bad_scanning", find_first_bad_scanning)
check("find_first_bad_binary", find_first_bad_binary)

print()
print(f"{'builds':>10} {'scanning':>10} {'binary':>10}")
for total in [1000, 10000, 100000, 1000000]:
    first_bad = total - 1

    calls = 0
    find_first_bad_scanning(total, first_bad)
    scanning_calls = calls

    calls = 0
    find_first_bad_binary(total, first_bad)
    binary_calls = calls

    print(f"{total:>10} {scanning_calls:>10} {binary_calls:>10}")
