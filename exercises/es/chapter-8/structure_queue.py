from collections import deque

from bench import measure

def drain_list(data):
    queue = list(data)
    processed = 0
    while queue:
        queue.pop(0)
        processed = processed + 1
    return processed

def drain_deque(data):
    queue = deque(data)
    processed = 0
    while queue:
        queue.popleft()
        processed = processed + 1
    return processed

print("drain_list")
measure(drain_list, [5000, 10000, 20000, 40000])

print()
print("drain_deque")
measure(drain_deque, [200000, 400000, 800000, 1600000])
