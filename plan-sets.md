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
- Drafted 19 Oct for Macbeth, An Inspector Calls, Jekyll and Hyde and Frankenstein (all Claude's first draft, teacher to check). Power and Conflict (poems) is left until the user decides how to split it.

## How a lesson works
- Each step is a normal game over the set's items, in "Learn the set" mode (a step is done when all its items are learned: typed correct once, multiple choice right twice). Progress uses the same ids as the existing games, so learning is shared with Know it and Master it.
- Match it is done when every vocab word in the set has been in a finished round.
- A step with nothing to ask is skipped (e.g. fewer than 2 vocab words, or no quote long enough for Finish the quote).
- After each step: "Step done. Next: ..." then the next step. After the last step: "Set complete!".
- A finished set can be revised again (one pass through each step, nothing changes in the saved progress).
- Set progress is worked out from learned items (plus a saved flag for Match it), so there is nothing extra to store apart from that flag.

## Power and Conflict (poetry): plan, 19 Oct (not built yet)
Poems have no characters, and most poems have only 2-7 quotes (Poppies 2; Prelude, Charge, Exposure, Tissue, Kamikaze 3), so one set per poem would be too small for a four-step lesson. The 39 vocab words are general (Trauma, Patriotism, Futile...), not tied to one poem.

**Proposed structure (mirrors the other texts: "by poem group" in place of "by character", plus "by theme")**
- **Poem groups (6 sets, about 7-12 quotes each):**
  1. Ozymandias and London (12 quotes)
  2. My Last Duchess and The Charge of the Light Brigade (7)
  3. The Prelude, Storm on the Island and Exposure (10)
  4. Bayonet Charge and Remains (10)
  5. Poppies, War Photographer and Kamikaze (10)
  6. Tissue, The Emigree and Checking Out Me History (12)
- **Theme sets (about 7, quotes drawn from several poems, so students compare):** the power of rulers; the power of nature; the reality of battle; memory and trauma; duty, honour and patriotism; identity and culture; families, loss and the home front.
- Key vocab is shared out so every set has at least 5 words (Match it needs 2 or more).

**Open decisions for the user**
1. Structure: poem groups plus themes (recommended), or themes only, or single poems.
2. "Which poem is this from?" in the Choose step. Poem recall matters most for poetry. Option: each quote is asked as a gap question or as "Which poem?" (picked at random) in Choose it. Needs a small code change. 12 of the 61 quotes have no gap word, so they could only be asked as "Which poem?".
3. Whether the teacher wants a different grouping of poems (e.g. by anthology cluster, or pairs for comparison questions).
