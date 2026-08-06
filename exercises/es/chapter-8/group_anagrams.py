import random
import string

from bench import measure

def group_errors_brute(signatures):
    groups = []
    for signature in signatures:
        placed = False
        for group in groups:
            if sorted(group[0]) == sorted(signature):
                group.append(signature)
                placed = True
                break
        if not placed:
            groups.append([signature])
    return len(groups)

def group_errors_indexed(signatures):
    groups = {}
    for signature in signatures:
        key = "".join(sorted(signature))
        if key not in groups:
            groups[key] = []
        groups[key].append(signature)
    return len(groups)

def check(name, function):
    results = [
        function(["eat", "tea", "tan", "ate", "nat", "bat"]) == 3,
        function([]) == 0,
        function(["one"]) == 1,
        function(["ab", "ab", "ab"]) == 1,
        function(["ab", "cd", "ef"]) == 3,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("group_errors_brute", group_errors_brute)
check("group_errors_indexed", group_errors_indexed)

def make_signatures(n):
    random.seed(11)
    signatures = []
    for _ in range(n):
        letters = [random.choice(string.ascii_lowercase)
                   for _ in range(6)]
        signatures.append("".join(letters))
    return signatures

print()
print("group_errors_brute")
measure(group_errors_brute, [500, 1000, 2000, 4000],
        make_data=make_signatures)

print()
print("group_errors_indexed")
measure(group_errors_indexed, [50000, 100000, 200000, 400000],
        make_data=make_signatures)
