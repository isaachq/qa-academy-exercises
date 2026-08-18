# Chapter 8: Algorithmic complexity for the SDET

Reference files for Chapter 8 of *Zero to SDET*, exactly as they end up
assembled at the close of each section. The chapter builds several of them in
pieces ("The file starts with...", "Add the optimization to the file:"); if at
any point you are unsure what a finished file looks like, this folder is the
answer.

**Writing them yourself is still the exercise.** These files exist so you can
compare them against what you typed, not so you can skip typing it.

## Environment

- Python 3.12 (standard library only, no dependencies)
- All files live in the same folder: most of them import `bench.py`
  with `from bench import measure`

## How to run

```
python3 file_name.py
```

The absolute timings you get will differ from the ones in the book: they
depend on your machine. What reproduces on any computer is the ratio column,
and that is the number the chapter teaches you to read.

## Files that take a while

Most finish in under a second. These do not, and that is intentional:

| File | Approximate duration | Why |
|---|---|---|
| `curve_factorial.py` | ~80 s | it really does measure O(n!) |
| `merge_intervals.py` | ~30 s | the brute force version is cubic |
| `valid_anagram.py` | ~20 s | the brute force version is quadratic |
| `space_tradeoff.py` | ~13 s | the no-extra-memory sweep over 8,000 |
| `fib.py` | ~7 s | `fib_naive` is exponential |

## Map by section

| Section | Files |
|---|---|
| 1. Why Big O is a requirement for the SDET | `reports.py` |
| 2. The doubling experiment | `naive_bench.py`, `bench.py`, `search_test.py`, `mystery.py`, `fake_growth.py` |
| 3. The minimum vocabulary | `constants.py`, `amortized.py` |
| 4. The catalog of curves | `curve_constant.py`, `curve_logarithmic.py`, `curve_linear.py`, `curve_linearithmic.py`, `curve_quadratic.py`, `fib.py`, `curve_factorial.py` |
| 5. Reading the complexity of a piece of code | `sequence.py`, `hidden_cost.py`, `two_inputs.py`, `call_tree.py`, `recursion_limit.py`, `reading_exercise.py` |
| 6. Space complexity | `space_tradeoff.py`, `space_recursion.py`, `space_batches.py` |
| 7. The real cost of Python data structures | `structure_front.py`, `structure_queue.py`, `structure_strings.py`, `recomputed_lookup.py`, `setup_data.py` |
| 8. The patterns they ask about in interviews | `patterns.py` |
| 9. Twelve interview problems | see the table below |
| 10. Big O applied to your automation suite | `suite_diagnosis.py`, `dom_calls.py` |

## The twelve problems (Section 9)

| ID | File |
|---|---|
| ALG-001 Two Sum | `two_sum.py` |
| ALG-002 Contains Duplicate | `contains_duplicate.py` |
| ALG-003 Valid Anagram | `valid_anagram.py` |
| ALG-004 Group Anagrams | `group_anagrams.py` |
| ALG-005 Top K Frequent | `top_k_frequent.py` |
| ALG-006 First Bad Version | `first_bad_version.py` |
| ALG-007 Binary Search | `binary_search_log.py` |
| ALG-008 Best Time to Buy and Sell | `best_time.py` |
| ALG-009 Longest Substring Without Repeating | `longest_streak.py` |
| ALG-010 Merge Intervals | `merge_intervals.py` |
| ALG-011 Valid Parentheses | `valid_nesting.py` |
| ALG-012 Number of Islands | `failure_islands.py` |

Every Section 9 file includes its own verification block with edge cases:
running it should show `[PASS]` for each function before the measurement
tables.
