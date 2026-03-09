import json

with open('ml-service/smart-fertilizer-ranker-map-3-xgboost.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells = nb.get('cells', [])
code_cells = [(i, ''.join(c['source'])) for i, c in enumerate(cells) if c['cell_type'] == 'code' and ''.join(c['source']).strip()]

with open('ml-service/notebook_extract.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total code cells: {len(code_cells)}\n\n")
    for i, src in code_cells:
        out.write(f"=== Code Cell {i} ===\n")
        out.write(src[:3000])
        out.write("\n\n")

print(f"Done. Extracted {len(code_cells)} code cells.")
