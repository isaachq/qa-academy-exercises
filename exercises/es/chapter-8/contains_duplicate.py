from bench import measure

def has_duplicate_brute(test_ids):
    for i in range(len(test_ids)):
        for j in range(i + 1, len(test_ids)):
            if test_ids[i] == test_ids[j]:
                return True
    return False

def has_duplicate_indexed(test_ids):
    seen = set()
    for test_id in test_ids:
        if test_id in seen:
            return True
        seen.add(test_id)
    return False

def check(name, function):
    results = [
        function(["TC-1", "TC-2", "TC-1"]) is True,
        function(["TC-1", "TC-2"]) is False,
        function([]) is False,
        function(["TC-1"]) is False,
        function(["TC-1", "TC-1", "TC-1"]) is True,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("has_duplicate_brute", has_duplicate_brute)
check("has_duplicate_indexed", has_duplicate_indexed)

def make_unique_ids(n):
    return [f"TC-{i:06d}" for i in range(n)]

print()
print("has_duplicate_brute")
measure(has_duplicate_brute, [1000, 2000, 4000, 8000],
        make_data=make_unique_ids)

print()
print("has_duplicate_indexed")
measure(has_duplicate_indexed, [100000, 200000, 400000, 800000],
        make_data=make_unique_ids)
