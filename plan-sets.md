# Plan: sets and lessons (decided 19 Oct 2026)

## What the user decided
- Inside each text, students work through **sets** based on **theme** and **character** (e.g. "Lady Macbeth", "Ambition and power").
- Each set is a **lesson** with four steps in a fixed order, then the set is complete:
  1. **Choose it** (multiple choice): the set's quotes (fill the gap) and key vocab.
  2. **Match it**: match the set's key vocab to meanings.
  3. **Type the gap**: type the missing word in the set's quotes (every quote in the set, not only core quotes).
  4. **Finish the quote**: type the rest of the quote (quotes of 6+ words).
- A set contains **quotes plus key vocab**. Claude drafts the sets from the data; the user edits them.
- The existing "Master it" (core quotes) and "Key vocab" cards stay as a separate section below the sets.
- "Got wrong last time" card: leave for now.

## Data
- `sets.csv`: id, text, kind (character or theme), name, blurb, order, teacher_checked.
- A `sets` column (semicolon-separated set ids) on `quotes.csv` and `vocab.csv`. A quote or word can be in several sets.
- `build_data.py` writes `web/data/sets.json` and checks that every set id exists and that sets have enough items.
- Macbeth is drafted first; the other texts follow once the user has looked at Macbeth.

## How a lesson works
- Each step is a normal game over the set's items, in "Learn the set" mode (a step is done when all its items are learned: typed correct once, multiple choice right twice). Progress uses the same ids as the existing games, so learning is shared with Know it and Master it.
- Match it is done when every vocab word in the set has been in a finished round.
- A step with nothing to ask is skipped (e.g. fewer than 2 vocab words, or no quote long enough for Finish the quote).
- After each step: "Step done. Next: ..." then the next step. After the last step: "Set complete!".
- A finished set can be revised again (one pass through each step, nothing changes in the saved progress).
- Set progress is worked out from learned items (plus a saved flag for Match it), so there is nothing extra to store apart from that flag.
