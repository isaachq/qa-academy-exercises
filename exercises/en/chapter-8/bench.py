import gc
import time

def measure(function, sizes, repeats=5, make_data=None):
    """Runs a function with growing input sizes and shows
    how time grows.

    Builds fresh data for every repetition, outside the
    measured region, so a function that modifies its input
    does not distort later repetitions. Keeps the fastest
    run: it is the one with least interference.
    """
    if make_data is None:
        make_data = lambda n: list(range(n))

    print(f"{'n':>10} {'time (s)':>12} {'ratio':>8}")
    previous_time = None

    for n in sizes:
        best = None

        for _ in range(repeats):
            data = make_data(n)
            gc.disable()
            start = time.perf_counter()
            function(data)
            elapsed = time.perf_counter() - start
            gc.enable()

            if best is None or elapsed < best:
                best = elapsed

        if previous_time is None:
            print(f"{n:>10} {best:>12.4f} {'-':>8}")
        else:
            print(f"{n:>10} {best:>12.4f} "
                  f"{best / previous_time:>8.1f}")

        previous_time = best
