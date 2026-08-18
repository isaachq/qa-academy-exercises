from bench import measure

def make_failures(n):
    return [f"error_{i % (n // 2)}" for i in range(n)]

def count_unique_with_list(failures):
    seen = []
    for failure in failures:
        if failure not in seen:
            seen.append(failure)
    return len(seen)

def count_unique_with_set(failures):
    seen = set()
    for failure in failures:
        if failure not in seen:
            seen.add(failure)
    return len(seen)

print("count_unique_with_list")
measure(count_unique_with_list, [2000, 4000, 8000, 16000],
        make_data=make_failures)

print()
print("count_unique_with_set")
measure(count_unique_with_set, [200000, 400000, 800000, 1600000],
        make_data=make_failures)
