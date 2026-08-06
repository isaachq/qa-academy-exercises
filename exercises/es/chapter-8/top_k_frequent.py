import heapq
import random

from bench import measure

def top_k_brute(test_ids, k=3):
    counted = []
    for test_id in test_ids:
        already = False
        for name, _ in counted:
            if name == test_id:
                already = True
                break
        if not already:
            counted.append((test_id, test_ids.count(test_id)))
    counted.sort(key=lambda pair: pair[1], reverse=True)
    return [name for name, _ in counted[:k]]

def top_k_indexed(test_ids, k=3):
    counts = {}
    for test_id in test_ids:
        counts[test_id] = counts.get(test_id, 0) + 1
    ranked = heapq.nlargest(k, counts.items(),
                            key=lambda pair: pair[1])
    return [name for name, _ in ranked]

def check(name, function):
    results = [
        function(["a", "a", "a", "b", "b", "c"], 2) == ["a", "b"],
        function(["a"], 1) == ["a"],
        function([], 3) == [],
        function(["a", "b", "c"], 5) == ["a", "b", "c"],
        function(["x", "x", "x"], 1) == ["x"],
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("top_k_brute", top_k_brute)
check("top_k_indexed", top_k_indexed)

def make_failures(n):
    random.seed(5)
    return [f"TC-{random.randint(0, n // 20):05d}" for _ in range(n)]

print()
print("top_k_brute")
measure(top_k_brute, [4000, 8000, 16000, 32000],
        make_data=make_failures)

print()
print("top_k_indexed")
measure(top_k_indexed, [50000, 100000, 200000, 400000],
        make_data=make_failures)
