import tracemalloc

def sum_recursive(values, index=0):
    if index == len(values):
        return 0
    return values[index] + sum_recursive(values, index + 1)

def sum_iterative(values):
    total = 0
    for value in values:
        total = total + value
    return total

values = list(range(900))

tracemalloc.start()
sum_recursive(values)
recursive_peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()

tracemalloc.start()
sum_iterative(values)
iterative_peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()

print(f"sum_recursive peak: {recursive_peak:>7} bytes")
print(f"sum_iterative peak: {iterative_peak:>7} bytes")
