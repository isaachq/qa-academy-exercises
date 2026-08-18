from itertools import permutations

from bench import measure

def make_tests(n):
    return [f"test_{i}" for i in range(n)]

def all_execution_orders(tests):
    count = 0
    for order in permutations(tests):
        count = count + 1
    return count

measure(all_execution_orders, [9, 10, 11, 12], repeats=2,
        make_data=make_tests)

print()
print(f"{'tests':>6} {'orders':>12}")
total = 1
for n in range(1, 16):
    total = total * n
    if n in (5, 10, 15):
        print(f"{n:>6} {total:>12}")
