from bench import measure

def search_in_list(names):
    for name in names:
        if name in names:
            pass

def search_in_set(names):
    unique_names = set(names)
    for name in names:
        if name in unique_names:
            pass

def make_names(n):
    return [f"test_case_{i}" for i in range(n)]

print("search_in_list")
measure(search_in_list, [2000, 4000, 8000, 16000],
        make_data=make_names)

print()
print("search_in_set")
measure(search_in_set, [100000, 200000, 400000, 800000],
        make_data=make_names)
