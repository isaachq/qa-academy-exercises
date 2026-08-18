from bench import measure

def two_sum_brute(numbers, target):
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return (i, j)
    return None

def two_sum_indexed(numbers, target):
    seen = {}
    for i, number in enumerate(numbers):
        needed = target - number
        if needed in seen:
            return (seen[needed], i)
        seen[number] = i
    return None

def check(name, function):
    results = [
        function([2, 7, 11, 15], 9) == (0, 1),
        function([3, 3], 6) == (0, 1),
        function([1, 2, 3], 100) is None,
        function([], 5) is None,
        function([5], 5) is None,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("two_sum_brute", two_sum_brute)
check("two_sum_indexed", two_sum_indexed)

def make_numbers(n):
    return list(range(n))

def run_brute(numbers):
    return two_sum_brute(numbers, len(numbers) * 2 - 3)

def run_indexed(numbers):
    return two_sum_indexed(numbers, len(numbers) * 2 - 3)

print()
print("two_sum_brute")
measure(run_brute, [1000, 2000, 4000, 8000], make_data=make_numbers)

print()
print("two_sum_indexed")
measure(run_indexed, [100000, 200000, 400000, 800000],
        make_data=make_numbers)
