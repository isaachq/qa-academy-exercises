from bench import measure

def prepare_and_compare(data):
    cleaned = []
    for value in data:
        cleaned.append(value * 2)

    duplicates = 0
    for first in cleaned:
        for second in cleaned:
            if first == second:
                duplicates = duplicates + 1
    return duplicates

measure(prepare_and_compare, [500, 1000, 2000, 4000])
