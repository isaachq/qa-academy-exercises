import time
import tracemalloc

def make_ids(n):
    return [f"REC-{i:06d}" for i in range(n)]

def has_duplicate_scanning(ids):
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            if ids[i] == ids[j]:
                return True
    return False

def has_duplicate_with_set(ids):
    seen = set()
    for value in ids:
        if value in seen:
            return True
        seen.add(value)
    return False

def report(name, function, ids):
    tracemalloc.start()
    start = time.perf_counter()
    function(ids)
    elapsed = time.perf_counter() - start
    peak = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    print(f"{name:>22} {elapsed:>10.4f} {peak / 1024:>12.1f}")

ids = make_ids(8000)
print(f"{'function':>22} {'time (s)':>10} {'memory (KB)':>12}")
report("has_duplicate_scanning", has_duplicate_scanning, ids)
report("has_duplicate_with_set", has_duplicate_with_set, ids)
