import time

def measure(function, sizes):
    print(f"{'n':>10} {'time (s)':>12} {'ratio':>8}")
    previous_time = None

    for n in sizes:
        data = list(range(n))
        start = time.perf_counter()
        function(data)
        elapsed = time.perf_counter() - start

        if previous_time is None:
            print(f"{n:>10} {elapsed:>12.4f} {'-':>8}")
        else:
            print(f"{n:>10} {elapsed:>12.4f} "
                  f"{elapsed / previous_time:>8.1f}")

        previous_time = elapsed

def total(data):
    return sum(data)

measure(total, [1000, 2000, 4000, 8000])
