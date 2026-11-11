#!/usr/bin/env python3
"""문항은행(items_math.js, items_lang.js)과 해설(explanations.py)을 합쳐 Word 생성용 JSON을 만든다. 정답과 해설의 일치를 점검한다."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import explanations as X
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]

def load(fn, var):
    t = open(f"{ROOT}/{fn}", encoding="utf-8").read()
    return json.loads(t[t.index("=") + 1:].rstrip().rstrip(";"))

math, lang = load("items_math.js", "MATH_BANK"), load("items_lang.js", "LANG_BANK")
LET = "①②③④⑤"
def num_of(key):
    m = re.search(r"\d[\d,]*\.?\d*", key)
    return m.group(0).replace(",", "") if m else None

res = {}
for track, items in math.items():
    for b in items:
        if b["no"] <= 10:
            b["ex"] = X.MATH_COMMON[b["form"]][b["no"] - 1]
        else:
            b["ex"] = X.MATH_APP[track][b["form"]][b["no"] - 11]
        key = b["o"][b["a"]]
        n = num_of(key)
        if n:
            assert n in b["ex"].replace(",", ""), (b["id"], key, b["ex"])
    res["math_" + track] = items
for subj, items in lang.items():
    src = X.KOR if subj == "kor" else X.ENG
    for b in items:
        b["ex"] = src[b["form"]][b["no"] - 1]
    res[subj] = items
for k, v in res.items():
    assert len(v) == 60 and all(b.get("ex") for b in v), k
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False)
print("OK", {k: len(v) for k, v in res.items()})
