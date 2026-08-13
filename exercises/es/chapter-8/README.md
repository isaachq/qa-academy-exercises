# Capítulo 8: Complejidad algorítmica para el SDET

Archivos de referencia del Capítulo 8 de *Zero to SDET*, tal como quedan
armados al final de cada sección. El capítulo construye varios de ellos por
partes ("El archivo arranca con...", "Suma la optimización al archivo:"); si
en algún punto dudas de cómo se ve un archivo ya ensamblado, esta carpeta es
la respuesta.

**Escribirlos tú sigue siendo el ejercicio.** Estos archivos están para
comparar contra lo que tecleaste, no para sustituirlo.

## Entorno

- Python 3.12 (biblioteca estándar únicamente, sin dependencias)
- Todos los archivos viven en la misma carpeta: la mayoría importa `bench.py`
  con `from bench import measure`

## Cómo ejecutar

```
python3 nombre_del_archivo.py
```

Los tiempos absolutos que obtengas serán distintos a los del libro: dependen
de tu máquina. Lo que se reproduce en cualquier equipo es la columna de
razones, que es el dato que el capítulo enseña a leer.

## Archivos que tardan

La mayoría termina en menos de un segundo. Estos no, y es intencional:

| Archivo | Duración aproximada | Por qué |
|---|---|---|
| `curve_factorial.py` | ~80 s | mide O(n!) de verdad |
| `merge_intervals.py` | ~30 s | la fuerza bruta es cúbica |
| `valid_anagram.py` | ~20 s | la fuerza bruta es cuadrática |
| `space_tradeoff.py` | ~13 s | el barrido sin memoria extra sobre 8,000 |
| `fib.py` | ~7 s | `fib_naive` es exponencial |

## Mapa por sección

| Sección | Archivos |
|---|---|
| 1. Por qué Big O es un requisito para el SDET | `reports.py` |
| 2. El experimento de duplicación | `naive_bench.py`, `bench.py`, `search_test.py`, `mystery.py`, `fake_growth.py` |
| 3. El vocabulario mínimo | `constants.py`, `amortized.py` |
| 4. El catálogo de curvas | `curve_constant.py`, `curve_logarithmic.py`, `curve_linear.py`, `curve_linearithmic.py`, `curve_quadratic.py`, `fib.py`, `curve_factorial.py` |
| 5. Leer la complejidad de un código | `sequence.py`, `hidden_cost.py`, `two_inputs.py`, `call_tree.py`, `recursion_limit.py`, `reading_exercise.py` |
| 6. Complejidad espacial | `space_tradeoff.py`, `space_recursion.py`, `space_batches.py` |
| 7. El costo real de las estructuras de Python | `structure_front.py`, `structure_queue.py`, `structure_strings.py`, `recomputed_lookup.py`, `setup_data.py` |
| 8. Los patrones que preguntan en entrevista | `patterns.py` |
| 9. Doce problemas de entrevista | ver tabla siguiente |
| 10. Big O aplicado a tu suite de automation | `suite_diagnosis.py`, `dom_calls.py` |

## Los doce problemas (Sección 9)

| ID | Archivo |
|---|---|
| ALG-001 Two Sum | `two_sum.py` |
| ALG-002 Contains Duplicate | `contains_duplicate.py` |
| ALG-003 Valid Anagram | `valid_anagram.py` |
| ALG-004 Group Anagrams | `group_anagrams.py` |
| ALG-005 Top K Frequent | `top_k_frequent.py` |
| ALG-006 First Bad Version | `first_bad_version.py` |
| ALG-007 Binary Search | `binary_search_log.py` |
| ALG-008 Best Time to Buy and Sell | `best_time.py` |
| ALG-009 Longest Substring sin repetir | `longest_streak.py` |
| ALG-010 Merge Intervals | `merge_intervals.py` |
| ALG-011 Valid Parentheses | `valid_nesting.py` |
| ALG-012 Number of Islands | `failure_islands.py` |

Cada archivo de la Sección 9 incluye su bloque de comprobación con casos
borde: al ejecutarlo debes ver `[PASS]` en cada función antes de las tablas
de medición.
