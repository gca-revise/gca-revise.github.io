# Teacher feedback log

One line per comment. Paste raw feedback into the chat; Claude sorts it here.
Keep the teacher's name or year group (not students' names). No student data.

**Buckets:** content error (fix now) · quick fix (batch) · big change (decide first, see `ideas.md`) · new feature (see `ideas.md`)
**Status:** new · done · waiting on user · dropped

| # | Date | From | Comment | Bucket | Status | What happened |
|---|------|------|---------|--------|--------|---------------|
| 1 | 16 Oct | (teacher) | Quotes should be tagged by theme so students know which essay to use them in, as well as by character | new feature | waiting on user | Added to `ideas.md`. Needs: a `themes` column in `quotes.csv` (teacher decides the theme list per text), shown on the answer screen. Count of teachers asking: 1 |
| 2 | 16 Oct | (teacher, school desktop) | Website does not work on school desktops. Screenshots (Chrome and Edge): the school web filter shows a "Blocked" page saying gca-revise.github.io is categorised as "Security - Domain Sharing". | blocker (not a code bug) | waiting on user | Not fixable in the code. Fix is a school IT request: ask IT to allow gca-revise.github.io (quote the category name). Backup: buy the planned custom domain and ask IT to allow that. Screenshots not saved (they show a staff email address and IP address). |
| 3 | 16 Oct | (teacher) | Funny answers for gap-fill (the wrong options look silly) | quick fix | new | Same cause as #5. Wrong options are other gap words from the same text, picked with no regard to word type (`QuoteTools.optionPool` in `web/js/engine.js`), so a verb gap can get nouns as options. Fix under #5. |
| 4 | 16 Oct | (teacher) | More blanks for quote learning (more than one gap per quote) | big change | waiting on user | Each quote has one `gap_word` today. Needs a second gap word (or more) per quote in the data, plus a game change (type or choose each blank). Claude can draft the extra words; teacher checks. Decide: all quotes or core only? |
| 5 | 16 Oct | (teacher) | Word types need to be the same for quote gap-fills (wrong options should be the same type as the right answer: verb for verb etc.) | quick fix | new | Plan: add a `gap_type` column to `quotes.csv` (noun, verb, adjective, adverb, other), drafted by Claude (229 gap words, teacher checks), and make `optionPool` / `makeChoices` prefer options of the same type. Fixes #3 too. |
| 6 | 16 Oct | (teacher) | Ding noise for a right answer | quick fix | new | Small Web Audio sound on a correct answer (no sound file needed). Suggest an on/off "Sound" switch (classrooms), remembered on the device. |
