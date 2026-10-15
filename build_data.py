"""Turn the teacher's CSV files into the JSON files the web page reads.

Run from the project folder:  python3 build_data.py

The CSVs stay the master copy. This script copies only the columns students
should see into web/data/, and reports any problems it finds.
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "web" / "data"

# The five texts, in the order they appear on the home screen.
TEXTS = [
    {"id": "macbeth", "name": "Macbeth"},
    {"id": "inspector", "name": "An Inspector Calls"},
    {"id": "jekyll-hyde", "name": "Jekyll and Hyde"},
    {"id": "frankenstein", "name": "Frankenstein"},
    {"id": "power-conflict", "name": "Power and Conflict"},
]
TEXT_IDS = {t["name"]: t["id"] for t in TEXTS}

problems = []


def read(name):
    with open(ROOT / f"{name}.csv", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def split(value, sep):
    return [p.strip() for p in value.split(sep) if p.strip()]


def text_ids(value, where):
    """'Macbeth; Frankenstein' -> ['macbeth', 'frankenstein'] (unknown names are reported)."""
    ids = []
    for name in split(value, ";"):
        if name == "All texts":
            ids.append("all")
        elif name in TEXT_IDS:
            ids.append(TEXT_IDS[name])
        else:
            problems.append(f"{where}: unknown text '{name}'")
    return ids


def check_unique(rows, key, label):
    seen = set()
    for r in rows:
        value = r[key]
        if value in seen:
            problems.append(f"{label}: duplicate {key} '{value}'")
        seen.add(value)


def build_vocab():
    rows = read("vocab")
    check_unique(rows, "id", "vocab")
    out = []
    for r in rows:
        where = f"vocab '{r['id']}'"
        if not r["word"].strip() or not r["definition"].strip():
            problems.append(f"{where}: missing word or definition")
            continue
        texts = text_ids(r["texts"], where)
        if not texts:
            problems.append(f"{where}: not tagged to any text")
        approved = split(r["examples_text"], "|")
        drafts = split(r["examples_draft"], "|")
        high = split(r.get("examples_high", ""), "|")
        # The game shows `examples_high` (high-level sentences about the text) first,
        # then approved sentences, then drafts. "approved" lets us find unchecked drafts later.
        out.append({
            "id": r["id"],
            "word": r["word"].strip(),
            "definition": r["definition"].strip(),
            "texts": texts,
            "topic": r["topic"].strip(),
            "examples": approved or drafts,
            "examples_high": high,
            "examples_approved": bool(approved),
            "core": r["core"].strip().lower() == "yes",
        })
    return out


def build_quotes():
    rows = read("quotes")
    check_unique(rows, "id", "quotes")
    out = []
    for r in rows:
        where = f"quote '{r['id']}'"
        if not r["quote"].strip():
            problems.append(f"{where}: empty quote")
            continue
        texts = text_ids(r["text"], where)
        out.append({
            "id": r["id"],
            "text": texts[0] if texts else "",
            "act": r["act"],
            "scene": r["scene"],
            "chapter": r["chapter"],
            "chapter_title": r["chapter_title"],
            "poem": r["poem"],
            "poet": r["poet"],
            "speaker": r["speaker"],
            "quote": r["quote"].strip(),
            "master": r["master"].strip().lower() == "yes",
            "gap_word": r["gap_word"].strip(),
            "techniques": split(r["techniques"], ";"),
            "technique_notes": split(r["technique_notes"], "|"),
            "context": r["context"].strip(),
        })
    return out


def build_poems():
    rows = read("poems")
    check_unique(rows, "id", "poems")
    return [{
        "id": r["id"],
        "poem": r["poem"],
        "poet": r["poet"],
        "summary": r["summary"].strip(),
        "context": r["context"].strip(),
    } for r in rows]


def build_techniques():
    rows = read("techniques")
    check_unique(rows, "name", "techniques")
    return [{
        "name": r["name"].strip(),
        "definition": r["definition"].strip(),
        "texts": text_ids(r["texts"], f"technique '{r['name']}'"),
    } for r in rows]


def build_symbols():
    return [{
        "symbol": r["symbol"],
        "represents": r["represents"],
        "text": TEXT_IDS.get(r["text"], ""),
    } for r in read("symbols")]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    data = {
        "texts": TEXTS,
        "vocab": build_vocab(),
        "quotes": build_quotes(),
        "poems": build_poems(),
        "techniques": build_techniques(),
        "symbols": build_symbols(),
    }
    for name, value in data.items():
        with open(OUT / f"{name}.json", "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=1)

    vocab = data["vocab"]
    no_sentence = sum(1 for w in vocab if not w["examples"] and not w["examples_high"])
    print(f"Wrote {len(data)} files to {OUT.relative_to(ROOT)}/")
    print(f"  texts {len(data['texts'])}, vocab {len(vocab)}, quotes {len(data['quotes'])}, "
          f"poems {len(data['poems'])}, techniques {len(data['techniques'])}, symbols {len(data['symbols'])}")
    for t in TEXTS:
        n = sum(1 for w in vocab if t["id"] in w["texts"])
        print(f"  {t['name']}: {n} words")
    print(f"  words with a high-level sentence: {sum(1 for w in vocab if w['examples_high'])}")
    print(f"  words with an approved sentence: {sum(1 for w in vocab if w['examples_approved'])}; "
          f"draft only: {sum(1 for w in vocab if w['examples'] and not w['examples_approved'])}; "
          f"no sentence: {no_sentence}")

    if problems:
        print(f"\n{len(problems)} problem(s) found:")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    print("\nNo problems found.")


if __name__ == "__main__":
    main()
