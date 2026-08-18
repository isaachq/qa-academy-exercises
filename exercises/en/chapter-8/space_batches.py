import tracemalloc

def make_row(i):
    return {"id": i, "name": f"user_{i}", "amount": i * 3}

def load_all_rows(total):
    rows = [make_row(i) for i in range(total)]
    checked = 0
    for row in rows:
        if row["amount"] >= 0:
            checked = checked + 1
    return checked

def process_in_batches(total, batch_size):
    checked = 0
    for start in range(0, total, batch_size):
        stop = min(start + batch_size, total)
        batch = [make_row(i) for i in range(start, stop)]
        for row in batch:
            if row["amount"] >= 0:
                checked = checked + 1
    return checked

tracemalloc.start()
load_all_rows(200000)
all_peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()

tracemalloc.start()
process_in_batches(200000, 1000)
batch_peak = tracemalloc.get_traced_memory()[1]
tracemalloc.stop()

print(f"load_all_rows peak:      {all_peak / 1024 / 1024:>8.2f} MB")
print(f"process_in_batches peak: {batch_peak / 1024 / 1024:>8.2f} MB")
