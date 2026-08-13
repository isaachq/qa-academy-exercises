from collections import deque

from bench import measure

def count_islands(grid):
    if not grid:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    islands = 0

    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == 1 and not visited[row][col]:
                islands = islands + 1
                queue = deque([(row, col)])
                visited[row][col] = True
                while queue:
                    current_row, current_col = queue.popleft()
                    for delta_row, delta_col in (
                            (1, 0), (-1, 0), (0, 1), (0, -1)):
                        next_row = current_row + delta_row
                        next_col = current_col + delta_col
                        if not (0 <= next_row < rows):
                            continue
                        if not (0 <= next_col < cols):
                            continue
                        if grid[next_row][next_col] == 0:
                            continue
                        if visited[next_row][next_col]:
                            continue
                        visited[next_row][next_col] = True
                        queue.append((next_row, next_col))
    return islands

def check(name, function):
    results = [
        function([[1, 1, 0], [0, 1, 0], [0, 0, 1]]) == 2,
        function([[0, 0], [0, 0]]) == 0,
        function([]) == 0,
        function([[1]]) == 1,
        function([[1, 0, 1], [0, 1, 0], [1, 0, 1]]) == 5,
    ]
    label = "[PASS]" if all(results) else "[FAIL]"
    print(f"{label} {name}")

check("count_islands", count_islands)

def make_grid(n):
    side = int(n ** 0.5)
    return [[1 if (row + col) % 3 == 0 else 0
             for col in range(side)]
            for row in range(side)]

print()
print("count_islands")
measure(count_islands, [200000, 400000, 800000, 1600000],
        make_data=make_grid)
