import random

from bench import measure

def max_degradation_brute(durations):
    worst = 0
    for i in range(len(durations)):
        for j in range(i + 1, len(durations)):
            increase = durations[j] - durations[i]
            if increase > worst:
                worst = increase
    return worst

def max_degradation_single_pass(durations):
    if not durations:
        return 0
    lowest = durations[0]
    worst = 0
    for duration in durations[1:]:
        increase = duration - lowest
        if increase > worst:
            worst = increase
        if duration < lowest:
            lowest = duration
    return worst

def check(name, function):
    results = [
        function([7, 1, 5, 3, 6, 4]) == 5,
        function([7, 6, 4, 3, 1]) == 0,
        function([]) == 0,
        function([5]) == 0,
        function([2, 2, 2]) == 0,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("max_degradation_brute", max_degradation_brute)
check("max_degradation_single_pass", max_degradation_single_pass)

def make_durations(n):
    random.seed(9)
    return [random.randint(100, 900) for _ in range(n)]

print()
print("max_degradation_brute")
measure(max_degradation_brute, [1000, 2000, 4000, 8000],
        make_data=make_durations)

print()
print("max_degradation_single_pass")
measure(max_degradation_single_pass,
        [200000, 400000, 800000, 1600000],
        make_data=make_durations)
