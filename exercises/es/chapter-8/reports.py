import time

def build_records(n):
    return [{"id": f"REC-{i:06d}", "amount": i * 3} for i in range(n)]

def compare_nested(expected, actual):
    mismatches = 0
    for expected_record in expected:
        for actual_record in actual:
            if actual_record["id"] == expected_record["id"]:
                if (actual_record["amount"]
                        != expected_record["amount"]):
                    mismatches = mismatches + 1
                break
    return mismatches

def compare_indexed(expected, actual):
    index = {record["id"]: record for record in actual}
    mismatches = 0
    for expected_record in expected:
        actual_record = index.get(expected_record["id"])
        if actual_record is not None:
            if actual_record["amount"] != expected_record["amount"]:
                mismatches = mismatches + 1
    return mismatches

expected = build_records(5000)
actual = build_records(5000)
actual.reverse()

start = time.perf_counter()
compare_nested(expected, actual)
nested_time = time.perf_counter() - start

start = time.perf_counter()
compare_indexed(expected, actual)
indexed_time = time.perf_counter() - start

print(f"compare_nested   {nested_time:.4f} s")
print(f"compare_indexed  {indexed_time:.4f} s")
print(f"faster by        {nested_time / indexed_time:.0f}x")
