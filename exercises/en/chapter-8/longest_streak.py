import random

from bench import measure

def longest_unique_brute(failures):
    best = 0
    for i in range(len(failures)):
        seen = set()
        for j in range(i, len(failures)):
            if failures[j] in seen:
                break
            seen.add(failures[j])
        if len(seen) > best:
            best = len(seen)
    return best

def longest_unique_window(failures):
    last_position = {}
    start = 0
    best = 0
    for end, failure in enumerate(failures):
        if (failure in last_position
                and last_position[failure] >= start):
            start = last_position[failure] + 1
        last_position[failure] = end
        if end - start + 1 > best:
            best = end - start + 1
    return best

def check(name, function):
    results = [
        function(["a", "b", "c", "a", "b"]) == 3,
        function(["a", "a", "a"]) == 1,
        function([]) == 0,
        function(["a"]) == 1,
        function(["a", "b", "b", "c", "d", "e"]) == 4,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("longest_unique_brute", longest_unique_brute)
check("longest_unique_window", longest_unique_window)

def make_unique_failures(n):
    return [f"TC-{i:06d}" for i in range(n)]

def make_mixed_failures(n):
    random.seed(21)
    return [f"TC-{random.randint(0, 400):04d}" for _ in range(n)]

print()
print("longest_unique_brute (worst case: all distinct)")
measure(longest_unique_brute, [1000, 2000, 4000, 8000],
        make_data=make_unique_failures)

print()
print("longest_unique_window (repeated failures)")
measure(longest_unique_window, [200000, 400000, 800000, 1600000],
        make_data=make_mixed_failures)
