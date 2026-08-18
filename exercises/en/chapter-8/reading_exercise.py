import random

from bench import measure

def make_shuffled(n):
    random.seed(7)
    values = list(range(n))
    random.shuffle(values)
    return values

def read_a(data):
    total = 0
    for value in data:
        total = total + value
    largest = 0
    for value in data:
        if value > largest:
            largest = value
    return total + largest

def read_b(data):
    steps = 0
    for _ in range(20000):
        remaining = len(data)
        while remaining > 1:
            remaining = remaining // 2
            steps = steps + 1
    return steps

def read_c(data):
    seen = []
    for value in data:
        if value not in seen:
            seen.append(value)
    return len(seen)

def read_d(data):
    seen = set()
    for value in data:
        if value not in seen:
            seen.add(value)
    return len(seen)

def read_e(data):
    ordered = sorted(data, reverse=True)
    gaps = 0
    for i in range(1, len(ordered)):
        if ordered[i - 1] - ordered[i] > 1:
            gaps = gaps + 1
    return gaps

def read_f(data):
    report = []
    for value in data:
        report = report + [value]
    return len(report)

print("read_a")
measure(read_a, [200000, 400000, 800000, 1600000])

print()
print("read_b")
measure(read_b, [200000, 400000, 800000, 1600000])

print()
print("read_c")
measure(read_c, [2000, 4000, 8000, 16000])

print()
print("read_d")
measure(read_d, [200000, 400000, 800000, 1600000])

print()
print("read_e")
measure(read_e, [200000, 400000, 800000, 1600000],
        make_data=make_shuffled)

print()
print("read_f")
measure(read_f, [2500, 5000, 10000, 20000])
