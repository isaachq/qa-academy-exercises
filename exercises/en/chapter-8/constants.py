from bench import measure

def one_pass(data):
    total = 0
    for value in data:
        total = total + value
    return total

def three_passes_plus_setup(data):
    header = [0] * 100
    total = 0
    for value in header:
        total = total + value
    for value in data:
        total = total + value
    for value in data:
        total = total + value
    for value in data:
        total = total + value
    return total

print("one_pass")
measure(one_pass, [200000, 400000, 800000, 1600000])

print()
print("three_passes_plus_setup")
measure(three_passes_plus_setup, [200000, 400000, 800000, 1600000])
