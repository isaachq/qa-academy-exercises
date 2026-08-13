from bench import measure

class ReportBuilder:
    def __init__(self):
        self.text = ""

def make_words(n):
    return [f"line_{i}" for i in range(n)]

def concat_local_variable(words):
    report = ""
    for word in words:
        report = report + word
    return len(report)

def concat_into_attribute(words):
    builder = ReportBuilder()
    for word in words:
        builder.text = builder.text + word
    return len(builder.text)

def concat_with_join(words):
    return len("".join(words))

print("concat_local_variable")
measure(concat_local_variable, [200000, 400000, 800000, 1600000],
        make_data=make_words)

print()
print("concat_into_attribute")
measure(concat_into_attribute, [5000, 10000, 20000, 40000],
        make_data=make_words)

print()
print("concat_with_join")
measure(concat_with_join, [200000, 400000, 800000, 1600000],
        make_data=make_words)
