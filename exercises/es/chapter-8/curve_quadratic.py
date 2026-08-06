from bench import measure

def make_ids(n):
    return [f"REC-{i:06d}" for i in range(n)]

def cross_check(expected):
    actual = expected
    missing = 0
    for expected_id in expected:
        if expected_id not in actual:
            missing = missing + 1
    return missing

measure(cross_check, [2000, 4000, 8000, 16000], make_data=make_ids)
