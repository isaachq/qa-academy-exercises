import random

from bench import measure

def merge_windows_brute(windows):
    merged = [list(window) for window in windows]
    changed = True
    while changed:
        changed = False
        for i in range(len(merged)):
            for j in range(i + 1, len(merged)):
                if (merged[i][0] <= merged[j][1]
                        and merged[j][0] <= merged[i][1]):
                    merged[i] = [min(merged[i][0], merged[j][0]),
                                 max(merged[i][1], merged[j][1])]
                    del merged[j]
                    changed = True
                    break
            if changed:
                break
    return sorted(tuple(window) for window in merged)

def merge_windows_sorted(windows):
    if not windows:
        return []
    ordered = sorted(windows)
    merged = [list(ordered[0])]
    for start, end in ordered[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return [tuple(window) for window in merged]

def check(name, function):
    results = [
        function([(1, 3), (2, 6), (8, 10), (15, 18)])
        == [(1, 6), (8, 10), (15, 18)],
        function([(1, 4), (4, 5)]) == [(1, 5)],
        function([]) == [],
        function([(1, 2)]) == [(1, 2)],
        function([(5, 7), (1, 3), (2, 6)]) == [(1, 7)],
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("merge_windows_brute", merge_windows_brute)
check("merge_windows_sorted", merge_windows_sorted)

def make_windows(n):
    random.seed(13)
    windows = []
    for _ in range(n):
        start = random.randint(0, n * 10)
        windows.append((start, start + random.randint(1, 8)))
    return windows

print()
print("merge_windows_brute")
measure(merge_windows_brute, [125, 250, 500, 1000],
        make_data=make_windows)

print()
print("merge_windows_sorted")
measure(merge_windows_sorted, [50000, 100000, 200000, 400000],
        make_data=make_windows)
