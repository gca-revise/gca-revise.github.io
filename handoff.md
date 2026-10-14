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
First draft of the design is published as a private artifact (a Claude design canvas): https://claude.ai/artifact/RKSbat4AkzENCkGG8DST1m
- Five phone screens: Home (choose set, learn vs free practice), Question (typed answer), Right answer, Wrong answer, Set complete. Screens are linked so they can be clicked through.
- Uses sample topic names ("Character", "Unit 2") and made-up numbers; not real data.
- Version 2 of the design (14 Oct): school crest (`GCA school logo.png`, uploaded privately to the artifact) in the Home header and Set complete screen; school navy `#222C69` and yellow `#FDE006`; Home now lists sample sets for each text with its own accent badge (Macbeth crimson `#8E1F37`, An Inspector Calls brown `#8A5316`, Jekyll and Hyde green-grey `#3E5A4F`, Frankenstein teal `#12707E`, Power and Conflict grey `#555C6B`); Question screen shows a "Macbeth" tag (idea: words tied to texts; a tag means "useful for writing about this text", not "appears in the text", e.g. hamartia, belittles). All numbers and the word-to-text link are samples.
- Waiting for the user's feedback on look and feel. Not yet designed: multiple choice, matching, a wider Chromebook layout.

## Decisions from the design session
- The user likes the design. Branding: combine school branding with per-text themes (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict). The user is finding a better crest image (needs a transparent PNG or SVG) and will check the school allows its use. The artifact can also be edited on the website (user may change it there; re-read the artifact before editing it).
- Differentiators to build first: exam-skills quotes, words tied to texts, text-themed sets. Key-vocab web game first, quotes after. See `plan.md` and `brainstorm-differentiation.md`.
- The user will get the real vocab lists at school.

## Next step
The user sends the real ~100 words (paste or spreadsheet) so Claude can make the real `vocab.csv`. Then plan Version 2 (web page) in detail.

## Separate from this project
The user also has a learning plan (Linux terminal basics, object-oriented Python on Codecademy, later CLAUDE.md practice, handoffs, subagents, skills, MCP). Turn it into a plan file only after the user confirms it.
