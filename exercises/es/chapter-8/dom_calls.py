import time

def find_element_in_dom(row_index):
    time.sleep(0.02)
    return f"<td>value_{row_index}</td>"

def read_table_cell_by_cell(rows):
    values = []
    for row_index in range(rows):
        values.append(find_element_in_dom(row_index))
    return values

def read_table_in_one_call(rows):
    time.sleep(0.02)
    return [f"<td>value_{i}</td>" for i in range(rows)]

start = time.perf_counter()
read_table_cell_by_cell(50)
cell_by_cell = time.perf_counter() - start

start = time.perf_counter()
read_table_in_one_call(50)
one_call = time.perf_counter() - start

print(f"50 driver calls: {cell_by_cell:.2f} s")
print(f"1 driver call:   {one_call:.2f} s")
