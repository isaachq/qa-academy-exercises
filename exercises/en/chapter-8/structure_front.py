from collections import deque

from bench import measure

def insert_at_front_list(data):
    result = []
    for value in data:
        result.insert(0, value)
    return len(result)

def insert_at_front_deque(data):
    result = deque()
    for value in data:
        result.appendleft(value)
    return len(result)

print("insert_at_front_list")
measure(insert_at_front_list, [5000, 10000, 20000, 40000])

print()
print("insert_at_front_deque")
measure(insert_at_front_deque, [200000, 400000, 800000, 1600000])
