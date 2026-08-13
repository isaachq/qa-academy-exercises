from bench import measure

def fake_quadratic(data):
    pairs = 0
    for first in data[:500]:
        for second in data[:500]:
            pairs = pairs + 1
    return pairs

measure(fake_quadratic, [1000, 2000, 4000, 8000])
