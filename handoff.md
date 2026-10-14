# Handoff: Vocab quiz

## Status
Folder, git repo and private GitHub repo are set up. `plan.md` is written and the user has approved it. No code yet.

## What's decided
See `plan.md` for the full plan. In short:
- Version 1: endless terminal quiz (`quiz.py` with a `VocabQuiz` class, `vocab.csv` with ~10 sample words). 1 point per correct answer; every word used once before any repeats; the same word never twice in a row.
- Version 2: web page for students on phones and Chromebooks, hosted free. Typed answer first, then multiple choice, then matching. No logins; scores stay on the student's device.
- Real vocab (~100 words): the user pastes it into chat or sends a spreadsheet; Claude makes the CSV. No extraction script.

## Done
Version 1 is built and committed (`vocab.csv` with 10 sample words, `quiz.py`). The user played it and likes it. Mastery ("learn the set" vs "free practice" modes, set-complete screen) and light stats (trickiest words) were then added and tested. The user played this newer version and is happy with it.

## Ideas below are now AGREED (user confirmed; recorded in `plan.md`), including: retire a word after 1 correct typed answer or 2 correct multiple-choice answers. Built in the terminal quiz (typed mode, so words retire after 1 correct answer). The 2-correct rule for multiple choice waits until that mode exists.
## Original notes on the ideas
- Stats: keep light. Per-word right/wrong counts, and a "trickiest words" list at the end. Saved on the student's device in the web version.
- Mastery / completing a set: a word is retired once answered correctly; missed words stay in the deck; when all are retired, show a "Set complete!" screen with stats. Keep the endless mode as "free practice". This changes the plan (the quiz is no longer endless by default), so update `plan.md` once agreed.
- Open choice: how many correct answers retire a word? Claude suggests once for typed answers, twice for multiple choice.

## Future ideas (discussed, not yet agreed)
- Topic sets: add a `topic` column to `vocab.csv` (semicolons if a word is in several topics). The quiz asks "Which set?" (all key vocab, or one topic). Each set tracks its own learned progress. Do this when making the real `vocab.csv`.
- Quote learning: separate `quotes.csv` (quote, gap word(s), source, topic). Test styles: fill the gap, "who said it?", finish the quote (multiple choice). Better suited to the web version than the terminal. User answered: both fill-the-gap and "who said it?"; about 50 quotes from multiple texts and poems. User agreed quotes come after the web version exists. With several texts, the `source` column (text/poem title) can double as the topic so students can learn one text at a time.

## Agreed order of work
1. Real `vocab.csv` with topic column; quiz asks "Which set?" (terminal version finished).
2. Design the web version as an artifact (visual mock-up) and refine it with the user.
3. Build the working web game (JavaScript) from the approved design.
4. Quotes later.

## Web design (step 2) in progress
The design is a private artifact (a Claude design canvas): https://claude.ai/artifact/RKSbat4AkzENCkGG8DST1m
It was renamed on 14 Oct: the app is now **GCA Revise** (not "Vocab Quiz"). The user can edit the artifact on the website, so always re-read it before changing it.

**Structure (agreed 14 Oct, recorded in `plan.md`):**
- Home shows the texts first (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict), plus a separate **Techniques** card (simile, metaphor, repetition...) across all texts. Word "Techniques" throughout, not "methods" or "writer's techniques".
- Inside a text: **Quotes** (fill the gap, who said it?) and **Key vocab** (type it, choose it, match them), with a Learn the set / Free practice switch.
- Key vocab words can sit in 2 or 3 texts; learning one counts everywhere.
- Later feature: "technique analysis", learning which technique each quote uses.

**Phone screens done (sample data only):** Home, Inside a text, Techniques, typed question + right/wrong + Set complete, multiple choice + right/wrong, matching + round complete, quote fill-the-gap and who-said-it (their answer screens reuse the vocab ones for now).
**Laptop/Chromebook screens done (14 Oct, sample data):** a second section of the canvas to the right of the phone screens. Home, Inside a text, Techniques, typed question + right/wrong, multiple choice + right/wrong, matching + round complete, quote fill-the-gap and who-said-it, Set complete. All linked so they can be clicked through. The user has seen the first four and likes them; the rest are not yet reviewed.

## Future idea (not agreed yet)
- **Character images for quotes** (e.g. a picture of Lady Macbeth on a "who said it?" question). The user has some images in mind; they could also be AI generated. Needs a check on copyright for any existing images, and a consistent style across characters. Do this after the web game and quotes exist.

## Open questions
- How does matching score points, and does matching retire a word? (Agreed so far: 1 correct typed answer or 2 correct multiple-choice answers retire a word.)
- School crest: the user is finding a better image and will check the school allows its use.

## Next step
1. User looks at the laptop screens and gives feedback (Chrome extension cannot connect from the Chromebook's Linux container, so the user opens the artifact link themselves; screenshots pasted into chat work).
2. Adjust the design from feedback.
3. The user sends the real vocab lists (from school) so Claude can make the real `vocab.csv` with a text/topic column. Then plan Version 2 (the working web page) in detail.

## Separate from this project
The user also has a learning plan (Linux terminal basics, object-oriented Python on Codecademy, later CLAUDE.md practice, handoffs, subagents, skills, MCP). Turn it into a plan file only after the user confirms it.
