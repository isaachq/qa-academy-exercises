import random

from bench import measure

def make_durations(n):
    random.seed(42)
    return [random.random() for _ in range(n)]

def sort_by_duration(durations):
    return sorted(durations)

measure(sort_by_duration, [200000, 400000, 800000, 1600000],
        make_data=make_durations)
