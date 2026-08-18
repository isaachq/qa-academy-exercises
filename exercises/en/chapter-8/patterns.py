from collections import deque

def count_by_key(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts

def find_pair_sorted(values, target):
    left = 0
    right = len(values) - 1
    while left < right:
        total = values[left] + values[right]
        if total == target:
            return (left, right)
        if total < target:
            left = left + 1
        else:
            right = right - 1
    return None

def longest_window(values, limit):
    start = 0
    best = 0
    current = 0
    for end in range(len(values)):
        current = current + values[end]
        while current > limit:
            current = current - values[start]
            start = start + 1
        if end - start + 1 > best:
            best = end - start + 1
    return best

def binary_search(values, target):
    low = 0
    high = len(values) - 1
    while low <= high:
        middle = (low + high) // 2
        if values[middle] == target:
            return middle
        if values[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

def merge_ranges(ranges):
    ordered = sorted(ranges)
    merged = [ordered[0]]
    for start, end in ordered[1:]:
        last_start, last_end = merged[-1]
        if start <= last_end:
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged

def is_balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for char in text:
        if char in "([{":
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return not stack

def reachable_from(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)
    return order

print(count_by_key(["a", "b", "a", "c", "a"]))
print(find_pair_sorted([1, 3, 5, 8, 12], 13))
print(longest_window([2, 1, 5, 1, 3, 2], 8))
print(binary_search([10, 20, 30, 40, 50], 40))
print(merge_ranges([(5, 7), (1, 3), (2, 6), (9, 10)]))
print(is_balanced("{[()]}"), is_balanced("{[(])}"))
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
print(reachable_from(graph, "a"))
