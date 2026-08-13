calls = 0

def fib_counted(n):
    global calls
    calls = calls + 1
    if n < 2:
        return n
    return fib_counted(n - 1) + fib_counted(n - 2)

print(f"{'n':>4} {'result':>10} {'calls':>12}")
for n in [5, 10, 20, 30]:
    calls = 0
    result = fib_counted(n)
    print(f"{n:>4} {result:>10} {calls:>12}")
