import sys

from bench import measure

def build_with_append(data):
    result = []
    for value in data:
        result.append(value)
    return result

measure(build_with_append, [200000, 400000, 800000, 1600000])

print()
print("capacity growth")
previous_size = 0
result = []
for i in range(65):
    size = sys.getsizeof(result)
    if size != previous_size:
        print(f"len={len(result):>4} bytes={size:>6}")
        previous_size = size
    result.append(i)
