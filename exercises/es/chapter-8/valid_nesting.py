from bench import measure

def is_balanced_brute(text):
    remaining = text
    reduced = True
    while reduced:
        reduced = False
        for pair in ("()", "[]", "{}"):
            if pair in remaining:
                remaining = remaining.replace(pair, "")
                reduced = True
    return remaining == ""

def is_balanced_stack(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for char in text:
        if char in "([{":
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return not stack

def check(name, function):
    results = [
        function("{[()]}") is True,
        function("{[(])}") is False,
        function("") is True,
        function("(") is False,
        function(")(") is False,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("is_balanced_brute", is_balanced_brute)
check("is_balanced_stack", is_balanced_stack)

def make_deeply_nested(n):
    half = n // 2
    return "([{" * (half // 3) + "}])" * (half // 3)

print()
print("is_balanced_brute")
measure(is_balanced_brute, [2000, 4000, 8000, 16000],
        make_data=make_deeply_nested)

print()
print("is_balanced_stack")
measure(is_balanced_stack, [200000, 400000, 800000, 1600000],
        make_data=make_deeply_nested)
