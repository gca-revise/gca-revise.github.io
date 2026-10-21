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
    """(name, regex) for every technique in techniques.csv, to find them in a quote's labels.
    A technique can have other names in the `also_called` column (e.g. Symbol: Symbolism)."""
    patterns = []
    for r in read("techniques"):
        name = r["name"].strip()
        names = [name] + split(r.get("also_called", ""), ";")
        parts = []
        for n in names:
            bare = re.sub(r"\(.*?\)", "", n).strip().lower()
            parts.append(re.escape(bare))
        patterns.append((name, re.compile(r"\b(?:" + "|".join(parts) + r")s?\b")))
    return patterns


def specific_matches(patterns, text):
    """Techniques named in `text`, keeping only the most specific: "extended metaphor" counts as
    Extended metaphor, not also as Metaphor; "religious imagery" is not also Imagery."""
    found = []
    for name, rx in patterns:
        for m in rx.finditer(text):
            found.append((m.start(), m.end(), name))
    keep = []
    for start, end, name in found:
        inside_longer = any(
            (s2 <= start and end <= e2) and (e2 - s2) > (end - start) for s2, e2, n2 in found
        )
        if not inside_longer and name not in keep:
            keep.append(name)
    order = [n for n, _ in patterns]
    return sorted(keep, key=order.index)


# Word types for gap words: the wrong options in "Fill the gap" are of the same type as the right answer.
GAP_TYPES = {"noun", "verb", "adjective", "adverb", "other"}


def build_quotes():
    rows = read("quotes")
    check_unique(rows, "id", "quotes")
    out = []
    patterns = technique_patterns()
    for r in rows:
        where = f"quote '{r['id']}'"
        labels = " ; ".join([r["techniques"], r["lesson_techniques"]]).lower()
        official = r["techniques"].lower()
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
            "gap_type": r.get("gap_type", "").strip().lower(),
            # Optional: the words shown in "Finish the quote" (otherwise the first half of the quote).
            "finish_prompt": r.get("finish_prompt", "").strip(),
            "techniques": split(r["techniques"], ";"),
            "technique_notes": split(r["technique_notes"], "|"),
            "context": r["context"].strip(),
            "note": r["student_note"].strip(),
            # Techniques from techniques.csv named in this quote's labels (for "Spot the technique").
            "technique_matches": [name for name, rx in patterns if rx.search(labels)],
            # The ones in the `techniques` column (the teacher's own analysis) are the answers in
            # Spot the technique when there are any; otherwise all the matches are.
            "technique_primary": specific_matches(patterns, official) or specific_matches(patterns, labels),
        })
        gap = r["gap_word"].strip()
        if gap and gap.lower() not in [t.lower() for t in re.findall(r"[^\W_]+", r["quote"])]:
            problems.append(f"{where}: gap word '{gap}' is not in the quote")
        fp = r.get("finish_prompt", "").strip()
        if fp:
            quote_words = r["quote"].split()
            fp_words = fp.split()
            if fp_words != quote_words[:len(fp_words)] or len(fp_words) >= len(quote_words):
                problems.append(f"{where}: finish_prompt '{fp}' must be the start of the quote and shorter than it")
        gap_type = r.get("gap_type", "").strip().lower()
        if gap and gap_type not in GAP_TYPES:
            problems.append(f"{where}: gap word '{gap}' needs a gap_type (noun, verb, adjective, adverb or other)")
    set_default_finish_prompts(out)
    return out


def set_default_finish_prompts(quotes):
    """Finish the quote shows only enough of the start to identify the quote, so students type as much as possible.
    Default: the first two words, or more if another quote in the same text starts the same way.
    A teacher's own finish_prompt (in quotes.csv) always wins."""
    def norm(words):
        return [re.sub(r"[^\w]", "", w).lower() for w in words]
    for q in quotes:
        if q["finish_prompt"]:
            continue
        words = q["quote"].split()
        if len(words) < 6:
            continue
        others = [norm(o["quote"].split()) for o in quotes if o["text"] == q["text"] and o is not q]
        most = len(words) // 2
        n = min(2, most)
        while n < most and any(o[:n] == norm(words)[:n] for o in others):
            n += 1
        q["finish_prompt"] = " ".join(words[:n])


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
    by_name = dict(technique_patterns())
    out = []
    for r in rows:
        name = r["name"].strip()
        pattern = by_name[name]
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


def build_sets(vocab, quotes):
    """Sets (lessons) inside each text: by character or theme. Each lists its quote ids and vocab ids.
    Membership comes from the `sets` column (semicolon-separated set ids) of quotes.csv and vocab.csv."""
    rows = read("sets")
    check_unique(rows, "id", "sets")
    sets = []
    by_id = {}
    for r in rows:
        where = f"set '{r['id']}'"
        text = TEXT_IDS.get(r["text"], r["text"])
        if text not in {t["id"] for t in TEXTS}:
            problems.append(f"{where}: unknown text '{r['text']}'")
        if r["kind"].strip() not in ("character", "theme"):
            problems.append(f"{where}: kind must be character or theme")
        entry = {
            "id": r["id"], "text": text, "kind": r["kind"].strip(), "name": r["name"].strip(),
            "blurb": r["blurb"].strip(), "order": int(r["order"] or 0), "quotes": [], "vocab": [],
        }
        sets.append(entry)
        by_id[r["id"]] = entry
    for r in read("quotes"):
        for sid in split(r.get("sets", ""), ";"):
            entry = by_id.get(sid)
            if entry is None:
                problems.append(f"quote '{r['id']}': unknown set '{sid}'")
            elif TEXT_IDS.get(r["text"].split(";")[0].strip(), r["text"]) != entry["text"]:
                problems.append(f"quote '{r['id']}': set '{sid}' belongs to another text")
            else:
                entry["quotes"].append(r["id"])
    ids = {w["id"]: w for w in vocab}
    for r in read("vocab"):
        for sid in split(r.get("sets", ""), ";"):
            entry = by_id.get(sid)
            word = ids.get(r["id"])
            if entry is None:
                problems.append(f"vocab '{r['id']}': unknown set '{sid}'")
            elif word is None or entry["text"] not in word["texts"]:
                problems.append(f"vocab '{r['id']}': set '{sid}' belongs to a text the word is not tagged to")
            else:
                entry["vocab"].append(r["id"])
    for entry in sets:
        if not entry["quotes"] and not entry["vocab"]:
            problems.append(f"set '{entry['id']}': has no quotes and no vocab")
    sets.sort(key=lambda e: (e["text"], e["order"]))
    return sets


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


def build_models(quotes, drafts):
    """The teacher's model paragraphs, keyed by quote id. models.csv is private (git-ignored); only rows
    marked teacher_approved = yes are published, unless the script is run with --drafts (local testing only)."""
    path = ROOT / "models.csv"
    if not path.exists():
        return []
    rows = read("models")
    check_unique(rows, "id", "models")
    quote_ids = {q["id"] for q in quotes}
    out = []
    for r in rows:
        where = f"model '{r['id']}'"
        approved = r["teacher_approved"].strip().lower() == "yes"
        if not approved and not drafts:
            continue
        ids = split(r["quote_ids"], ";")
        for qid in ids:
            if qid not in quote_ids:
                problems.append(f"{where}: unknown quote id '{qid}'")
        parts = []
        for seg in split(r["parts"], "|"):
            label, sep, text = seg.partition("::")
            if not sep or not label.strip() or not text.strip():
                problems.append(f"{where}: each part needs 'Label :: text'")
                continue
            parts.append({"label": label.strip(), "text": text.strip()})
        out.append({"id": r["id"], "text": r["text"].strip(), "title": r["title"].strip(),
                    "quotes": ids, "parts": parts})
    return out


def main():
    drafts = "--drafts" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    vocab = build_vocab()
    missing_sentences = attach_sentences(vocab)
    attach_tags(vocab)
    quotes = build_quotes()
    data = {
        "texts": TEXTS,
        "vocab": vocab,
        "quotes": quotes,
        "sets": build_sets(vocab, quotes),
        "poems": build_poems(),
        "techniques": build_techniques(read("quotes")),
        "symbols": build_symbols(),
        "characters": build_characters(),
        "models": build_models(quotes, drafts),
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
    for st in data["sets"]:
        note = " (check: 2+ vocab words make a Match it step)" if len(st["vocab"]) < 2 else ""
        print(f"  set {st['id']}: {len(st['quotes'])} quotes, {len(st['vocab'])} words{note}")
    if drafts:
        print("  WARNING: --drafts used, so models.json holds unapproved paragraphs. Do not commit or publish it.")
    print(f"  model paragraphs published: {len(data['models'])}")
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
