from bench import measure

def make_run(n):
    expected = [{"id": f"TC-{i:05d}", "status": "passed"}
                for i in range(n)]
    actual = [{"id": f"TC-{i:05d}", "status": "passed"}
              for i in range(n)]
    return (expected, actual)

def match_rebuilding_index(run):
    expected, actual = run
    matched = 0
    for row in expected:
        actual_ids = [item["id"] for item in actual]
        if row["id"] in actual_ids:
            matched = matched + 1
    return matched

def match_with_index_outside(run):
    expected, actual = run
    actual_ids = {item["id"] for item in actual}
    matched = 0
    for row in expected:
        if row["id"] in actual_ids:
            matched = matched + 1
    return matched

print("match_rebuilding_index")
measure(match_rebuilding_index, [1000, 2000, 4000, 8000],
        make_data=make_run)

print()
print("match_with_index_outside")
measure(match_with_index_outside, [100000, 200000, 400000, 800000],
        make_data=make_run)
