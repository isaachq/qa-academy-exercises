from bench import measure

def find_entry_scanning(timestamps, target):
    for i in range(len(timestamps)):
        if timestamps[i] == target:
            return i
    return -1

def find_entry_binary(timestamps, target):
    low = 0
    high = len(timestamps) - 1
    while low <= high:
        middle = (low + high) // 2
        if timestamps[middle] == target:
            return middle
        if timestamps[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

def check(name, function):
    results = [
        function([10, 20, 30, 40, 50], 40) == 3,
        function([10, 20, 30], 99) == -1,
        function([], 10) == -1,
        function([10], 10) == 0,
        function([10, 20], 10) == 0,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("find_entry_scanning", find_entry_scanning)
check("find_entry_binary", find_entry_binary)

def make_timestamps(n):
    return [1700000000 + i * 5 for i in range(n)]

def run_scanning(timestamps):
    last = timestamps[-1]
    for _ in range(200):
        find_entry_scanning(timestamps, last)

def run_binary(timestamps):
    last = timestamps[-1]
    for _ in range(200):
        find_entry_binary(timestamps, last)

print()
print("find_entry_scanning")
measure(run_scanning, [50000, 100000, 200000, 400000],
        make_data=make_timestamps)

print()
print("find_entry_binary")
measure(run_binary, [50000, 100000, 200000, 400000],
        make_data=make_timestamps)
