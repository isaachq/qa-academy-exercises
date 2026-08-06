def find_first_broken_build(builds):
    checks = 0
    low = 0
    high = len(builds) - 1
    while low < high:
        middle = (low + high) // 2
        checks = checks + 1
        if builds[middle] == "broken":
            high = middle
        else:
            low = middle + 1
    return checks

def make_builds(n):
    return ["passing"] * (n // 2) + ["broken"] * (n - n // 2)

print(f"{'builds':>10} {'checks':>8}")
for size in [1000, 10000, 100000, 1000000]:
    checks = find_first_broken_build(make_builds(size))
    print(f"{size:>10} {checks:>8}")
