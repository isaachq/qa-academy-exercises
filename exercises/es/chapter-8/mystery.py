from bench import measure

PROBES = 200000

def mystery_a(data):
    total = 0
    for _ in range(PROBES):
        total = total + data[0]
    return total

def mystery_b(data):
    found = -1
    for i in range(2000):
        target = data[i]
        low = 0
        high = len(data) - 1
        while low <= high:
            middle = (low + high) // 2
            if data[middle] == target:
                found = middle
                break
            if data[middle] < target:
                low = middle + 1
            else:
                high = middle - 1
    return found

def mystery_c(data):
    total = 0
    for value in data:
        total = total + value
    return total

def mystery_d(data):
    pairs = 0
    for first in data:
        for second in data:
            pairs = pairs + 1
    return pairs

def mystery_e(data):
    subsets = [[]]
    for value in data:
        subsets = subsets + [subset + [value] for subset in subsets]
    return len(subsets)

print("mystery_a")
measure(mystery_a, [100000, 200000, 400000, 800000])

print()
print("mystery_b")
measure(mystery_b, [100000, 200000, 400000, 800000])

print()
print("mystery_c")
measure(mystery_c, [100000, 200000, 400000, 800000])

print()
print("mystery_d")
measure(mystery_d, [1000, 2000, 4000, 8000])

print()
print("mystery_e")
measure(mystery_e, [16, 17, 18, 19])
