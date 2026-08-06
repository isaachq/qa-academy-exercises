import random
import string

from bench import measure

def is_anagram_brute(first, second):
    if len(first) != len(second):
        return False
    for char in first:
        if first.count(char) != second.count(char):
            return False
    return True

def is_anagram_counted(first, second):
    if len(first) != len(second):
        return False
    counts = {}
    for char in first:
        counts[char] = counts.get(char, 0) + 1
    for char in second:
        if char not in counts:
            return False
        counts[char] = counts[char] - 1
        if counts[char] == 0:
            del counts[char]
    return not counts

def check(name, function):
    results = [
        function("listen", "silent") is True,
        function("rat", "car") is False,
        function("a", "ab") is False,
        function("", "") is True,
        function("aab", "abb") is False,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("is_anagram_brute", is_anagram_brute)
check("is_anagram_counted", is_anagram_counted)

def make_pair(n):
    random.seed(3)
    letters = [random.choice(string.ascii_lowercase)
               for _ in range(n)]
    shuffled = letters[:]
    random.shuffle(shuffled)
    return ("".join(letters), "".join(shuffled))

def run_brute(pair):
    return is_anagram_brute(pair[0], pair[1])

def run_counted(pair):
    return is_anagram_counted(pair[0], pair[1])

print()
print("is_anagram_brute")
measure(run_brute, [5000, 10000, 20000, 40000], make_data=make_pair)

print()
print("is_anagram_counted")
measure(run_counted, [200000, 400000, 800000, 1600000],
        make_data=make_pair)
