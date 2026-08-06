import sys

def countdown(n):
    if n == 0:
        return 0
    return countdown(n - 1)

print(f"recursion limit: {sys.getrecursionlimit()}")
print(f"countdown(900): {countdown(900)}")

try:
    print(f"countdown(5000): {countdown(5000)}")
except RecursionError as error:
    print(f"countdown(5000): RecursionError: {error}")
