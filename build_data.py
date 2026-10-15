"""Turn the teacher's CSV files into the JSON files the web page reads.

Run from the project folder:  python3 build_data.py

The CSVs stay the master copy. This script copies only the columns students
should see into web/data/, and reports any problems it finds.
"""
import csv
import json
import re
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
        # The game shows the high-level sentences from sentences.csv first (one per text the word
        # belongs to), then approved sentences, then drafts. "approved" lets us find unchecked drafts later.
        out.append({
            "id": r["id"],
            "word": r["word"].strip(),
            "definition": r["definition"].strip(),
            "texts": texts,
            "topic": r["topic"].strip(),
            "examples": approved or drafts,
            "examples_high": [],  # filled in from sentences.csv below
            "examples_approved": bool(approved),
            "core": r["core"].strip().lower() == "yes",
        })
    return out


def attach_sentences(vocab):
    """Add the high-level sentences from sentences.csv to each word: [{text, sentence}, ...]."""
    by_id = {w["id"]: w for w in vocab}
    seen = set()
    for r in read("sentences"):
        where = f"sentence for '{r['id']}' ({r['text']})"
        word = by_id.get(r["id"])
        text = TEXT_IDS.get(r["text"], r["text"])
        if word is None:
            problems.append(f"{where}: no such word id")
            continue
        if text not in word["texts"]:
            problems.append(f"{where}: the word is not tagged to that text")
            continue
        if (r["id"], text) in seen:
            problems.append(f"{where}: duplicate")
            continue
        if not r["sentence"].strip():
            problems.append(f"{where}: empty sentence")
            continue
        seen.add((r["id"], text))
        word["examples_high"].append({"text": text, "sentence": r["sentence"].strip()})
    # Report any word/text pair that has no high-level sentence yet.
    missing = [(w["id"], t) for w in vocab for t in w["texts"] if (w["id"], t) not in seen]
    return missing


def attach_tags(vocab):
    """Add the small labels from tags.csv (e.g. "Structure · Act 1") to words: [{text, tag}, ...]."""
    by_id = {w["id"]: w for w in vocab}
    for w in vocab:
        w["tags"] = []
    for r in read("tags"):
        where = f"tag for '{r['id']}' ({r['text']})"
        word = by_id.get(r["id"])
        text = TEXT_IDS.get(r["text"], r["text"])
        if word is None:
            problems.append(f"{where}: no such word id")
        elif text not in word["texts"]:
            problems.append(f"{where}: the word is not tagged to that text")
        elif not r["tag"].strip():
            problems.append(f"{where}: empty tag")
        else:
            word["tags"].append({"text": text, "tag": r["tag"].strip()})


def technique_patterns():
    """(name, regex) for every technique in techniques.csv, to find them in a quote's labels."""
    patterns = []
    for r in read("techniques"):
        name = r["name"].strip()
        bare = re.sub(r"\(.*?\)", "", name).strip().lower()
        patterns.append((name, re.compile(r"\b" + re.escape(bare) + r"s?\b")))
    return patterns


def build_quotes():
    rows = read("quotes")
    check_unique(rows, "id", "quotes")
    out = []
    patterns = technique_patterns()
    for r in rows:
        where = f"quote '{r['id']}'"
        labels = " ; ".join([r["techniques"], r["lesson_techniques"]]).lower()
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
            "note": r["sheet_note"].strip(),
            # Techniques from techniques.csv named in this quote's labels (for "Spot the technique").
            "technique_matches": [name for name, rx in patterns if rx.search(labels)],
        })
        gap = r["gap_word"].strip()
        if gap and gap.lower() not in [t.lower() for t in re.findall(r"[^\W_]+", r["quote"])]:
            problems.append(f"{where}: gap word '{gap}' is not in the quote")
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


def build_techniques(quotes):
    rows = read("techniques")
    check_unique(rows, "name", "techniques")
    labels = [" ".join([q["techniques"], q["lesson_techniques"]]).lower() for q in quotes]
    out = []
    for r in rows:
        name = r["name"].strip()
        bare = re.sub(r"\(.*?\)", "", name).strip().lower()
        pattern = re.compile(r"\b" + re.escape(bare) + r"s?\b")
        out.append({
            "name": name,
            "category": r.get("category", "").strip(),
            "definition": r["definition"].strip(),
            "example": r.get("example", "").strip(),
            "effect": r.get("effect", "").strip(),
            "texts": text_ids(r["texts"], f"technique '{name}'"),
            "in_quotes": sum(1 for label in labels if pattern.search(label)),
            # "no" keeps terms that are not devices (Theme, Speaker, Act...) out of the Spot the technique game.
            "spot": r.get("spot_the_technique", "yes").strip().lower() != "no",
        })
    return out


def build_characters():
    """Extra character names for 'Who said it?' wrong options: {text id: [names]}."""
    out = {}
    for r in read("characters"):
        text = TEXT_IDS.get(r["text"])
        if not text:
            problems.append(f"characters: unknown text '{r['text']}'")
            continue
        out.setdefault(text, []).append(r["name"].strip())
    return out


def build_symbols():
    return [{
        "symbol": r["symbol"],
        "represents": r["represents"],
        "text": TEXT_IDS.get(r["text"], ""),
    } for r in read("symbols")]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    vocab = build_vocab()
    missing_sentences = attach_sentences(vocab)
    attach_tags(vocab)
    data = {
        "texts": TEXTS,
        "vocab": vocab,
        "quotes": build_quotes(),
        "poems": build_poems(),
        "techniques": build_techniques(read("quotes")),
        "symbols": build_symbols(),
        "characters": build_characters(),
    }
    for name, value in data.items():
        with open(OUT / f"{name}.json", "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=1)

    tech = data["techniques"]
    print(f"  techniques: {len(tech)}, of which {sum(1 for t in tech if t['in_quotes'])} are named in at least one quote label")
    no_sentence = sum(1 for w in vocab if not w["examples"] and not w["examples_high"])
    print(f"Wrote {len(data)} files to {OUT.relative_to(ROOT)}/")
    print(f"  texts {len(data['texts'])}, vocab {len(vocab)}, quotes {len(data['quotes'])}, "
          f"poems {len(data['poems'])}, techniques {len(data['techniques'])}, symbols {len(data['symbols'])}")
    for t in TEXTS:
        n = sum(1 for w in vocab if t["id"] in w["texts"])
        print(f"  {t['name']}: {n} words")
    print(f"  high-level sentences: {sum(len(w['examples_high']) for w in vocab)} "
          f"(word/text pairs still without one: {len(missing_sentences)})")
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
