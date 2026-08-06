from bench import measure

def make_rows(n):
    return [{"id": i, "amount": i * 2} for i in range(n)]

def validate_rows(rows):
    invalid = 0
    for row in rows:
        if row["amount"] < 0:
            invalid = invalid + 1
    return invalid

measure(validate_rows, [200000, 400000, 800000, 1600000],
        make_data=make_rows)
