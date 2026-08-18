import time

from bench import measure

def make_number(n):
    return n

def fib_naive(n):
    if n < 2:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

def fib_memo(n, known=None):
    if known is None:
        known = {}
    if n < 2:
        return n
    if n in known:
        return known[n]
    known[n] = fib_memo(n - 1, known) + fib_memo(n - 2, known)
    return known[n]

print("fib_naive")
measure(fib_naive, [32, 33, 34, 35, 36], repeats=1,
        make_data=make_number)

start = time.perf_counter()
naive_result = fib_naive(35)
naive_time = time.perf_counter() - start

start = time.perf_counter()
memo_result = fib_memo(35)
memo_time = time.perf_counter() - start

print()
print(f"fib_naive(35) = {naive_result} in {naive_time:.4f} s")
print(f"fib_memo(35)  = {memo_result} in {memo_time:.6f} s")
print(f"faster by     {naive_time / memo_time:.0f}x")

start = time.perf_counter()
big_result = fib_memo(500)
big_time = time.perf_counter() - start
print()
print(f"fib_memo(500) took {big_time:.6f} s "
      f"and has {len(str(big_result))} digits")
