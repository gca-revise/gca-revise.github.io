# Handoff: Vocab quiz

## Status
Folder, git repo and private GitHub repo are set up. `plan.md` is written and approved. Version 1 (terminal quiz) is built. The web design is finished. Real data is now being loaded, starting with Macbeth quotes.

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
1. (Macbeth vocab done, see above.) Real `vocab.csv` with topic column; quiz asks "Which set?" (terminal version finished).
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
- **Example sentences** for key vocab (e.g. "Lady Macbeth belittles Macbeth"). Added to `plan.md` under later ideas; when making the real `vocab.csv`, leave room for an optional `sentence` column.
- **Character images for quotes** (e.g. a picture of Lady Macbeth on a "who said it?" question). The user has some images in mind; they could also be AI generated. Needs a check on copyright for any existing images, and a consistent style across characters. Do this after the web game and quotes exist.

## Set complete screen (14 Oct)
Shows for a finished key-vocab set: "Practise Macbeth vocab again", "Back to Macbeth" (to choose quotes) and "Back to home". The same screen is needed for finished quotes and Techniques sets, with their own wording; build it that way rather than designing more screens.

## Open questions
- Matching is worth **1 point per round, and only for a round with no mistakes** (agreed 14 Oct). Matching does **not** retire a word; only typing (1 correct) or multiple choice (2 correct) does. (Agreed so far: 1 correct typed answer or 2 correct multiple-choice answers retire a word.)
- School crest: the user is finding a better image and will check the school allows its use.

## Quotes data (15 Oct, Macbeth)
- `quotes.csv` built: 51 quotes from the five homework sheets (OneDrive: Documents / English Year 10 2026 / 7 Macbeth). Columns are listed in `plan.md`. Only 5 are `master = yes` (the 5 in the Year 11 Summer Revision document): mac-1-01, mac-1-06, mac-1-11, mac-3-05, mac-5-01. Techniques, notes and context are filled for those five only.
- Acts, scenes and speakers are checked against the Folger text saved in `source/macbeth.txt`. **Decided 15 Oct:** keep the teacher's sheet wording (deliberately modern and simpler) even where it differs from Folger (`matches_folger = check`); gap words come later, when the fill-the-gap mode is built. **Still open:** "Sinful Macbeth" is not in the play and was left out; the teacher may want a replacement.
- Two levels agreed: Know it (all quotes, recognition) and Master it (core quotes). Model paragraphs: the teacher will supply her own; Claude does not draft them.
- The Microsoft 365 connector is read-only and works in cloud sessions. It can see OneDrive; only open the folders the user names. Other Macbeth folders exist on school shared drives; leave them alone.
- Not yet read: the 25 lesson slideshows (key vocab slides: word, definition, example sentence), the Knowledge Organiser (user does not use it), and the other Year 10 texts.

## Vocab data (15 Oct, Macbeth)
- `vocab.csv` built from the Year 10 Macbeth lessons 01-24 (read through the Microsoft 365 connector, plus Lesson 11 uploaded): 44 words, 31 from Key Vocabulary slides. `core` and `teacher_checked` are empty/no on every row until the teacher decides.
- Decided 15 Oct: the example-sentence names are all made up. Only example sentences about the English texts will go in the final game, so each row has `examples_text` and `examples_general` (kept in case they are useful). Typos fixed (“Women in Jacobean times”, “He chose to commit a crime”). A core / not-core list for vocab is to be decided later, like `master` for quotes.
- **Done 15 Oct:** Claude drafted two Macbeth sentences for each of the 15 words without one, in the `examples_draft` column. **The teacher must check them** (accuracy and wording); approved ones move to `examples_text`. The 15 words were (ambition, free will, inevitable, façade, hallucination, consumed, suppress, paranoid, embodiment, self-fulfilling prophecy, tyrant, hubris, desensitised, nihilistic, anagnorisis). The teacher may want text-based sentences written, which she would check. Also: which of the 13 “defined elsewhere” terms join the game.
- Not read: Lessons 12, 14, 14a, 19, 25 have no vocab slides; the printable worksheet PDFs were not read.
- Also saved: `symbols.csv`, and lesson technique labels in `quotes.csv` (19 quotes). “So foul and fair a day I have not seen” (Macbeth’s first line) is analysed in Lesson 04 but is not in `quotes.csv`.
- Lessons also hold material not yet captured: comprehension questions and answers, the “Ideal Jacobean woman” word sort (Lesson 06), PETAL paragraph models (Lesson 25), and context facts. Ask the teacher before adding any of it.

## Jekyll and Hyde data (15 Oct)
- Lessons live in OneDrive: Documents / 2025-6 / Y10 Lessons / 1 Jekyll & Hyde (25 lessons, 4 homework quote sheets). Read through the Microsoft 365 connector. Quote sheets 1-4 and lessons 01-02, 04-09, 12-19, 21, 23 were read; lessons 03, 10, 11, 20, 22, 24, 25 (PETAL/assessment) were not.
- `quotes.csv`: 42 J&H quotes, 5 master (from the Year 11 document). `vocab.csv`: 22 new J&H words (17 from Key Vocabulary slides, 5 defined elsewhere), 4 shared with Macbeth. `examples_draft` has Claude-written J&H sentences for 9 words; the teacher must check them.
- **Privacy:** many lesson slides contain class lists and test scores with students' first names. None were copied. Do not copy names from lessons. Also skip “Jekyll & Hyde Key Quotes …docx” (named after a student) and the “Responding to Feedback” sheets.
- **Done 15 Oct:** the novel text is saved in `source/jekyll-hyde.txt` and every J&H quote's chapter and speaker were checked against it. “Windows barred with iron” moved to Chapter 5. **Decided 15 Oct:** use the novel’s wording for “fell in slavery” and “My devil had been long caged”. **Still to do for J&H:** (done) decide which wording of “My devil had been long caged…” to keep. Decide core lists. Also not read: `Full Novel Quote Sheet.docx` (may hold more quotes) and the revision booklet.

## An Inspector Calls data (15 Oct)
- Folder: OneDrive, Documents / English Year 11 2026 / 1 An Inspector Calls (17 lessons, homework quote sheets 1-4, mid-point quote sheets). All 17 lessons except 12 (assessment prep) were read.
- `quotes.csv`: 48 AIC quotes, **20 core quotes (22 rows)** agreed with the teacher (listed in `plan.md`), 12 mid-point key quotes flagged. `vocab.csv`: 97 words in total now.
- The play text is git-ignored on purpose (copyright), so it is not on GitHub. Upload it again for any future checking.
- **Privacy:** lessons 07 and 11 contain lists of students' first names (“Century” lists). None were copied. The teacher said there is no student data in the files; that is true of the data files, but the lesson slides do contain names. Do not copy names from slides.
- **Teacher to check:** drafted sentences in `examples_draft` (AIC has 19), quote wording marked `matches_source = check`, and which vocab is core.
- Not read: Lesson 12 (assessment prep), the extra resources folder, the printable PDFs.

## Power and Conflict poetry data (15 Oct)
- Sources: the teacher's Easter revision sheet (vocab list plus 33 key quotes with analysis), the Power and Conflict Poetry Revision Guide (8 poems: summaries, context, key quotes), the AQA anthology PDF (scanned; OCR text kept locally and git-ignored), and the poetry lessons for all 15 poems.
- New: `poems.csv` (15 poems), `techniques.csv` (17 defined techniques), 61 poetry quotes in `quotes.csv`, 33 new poetry words in `vocab.csv` (131 words in total).
- **Decided 15 Oct:** the 33 Easter-sheet quotes are core (`master = yes`); target is 3 core quotes per poem plus the title as an extra item (`title_analysis` in `poems.csv`). **Final core list agreed 15 Oct (44 poetry quotes):** all 33 Easter-sheet quotes plus 11 more (Charge, Exposure, Emigree one each; Storm and Checking Out Me History three each; Tissue two, with the title as the third item). Poppies stays at two because only two quotes appear on its slides. Ozymandias keeps four. (Earlier gap list, now resolved:) Storm on the Island, Tissue and Checking Out Me History have none yet; Charge, Poppies, Exposure and The Emigree each need one more (Ozymandias has 4). Suggested: Charge “Someone had blundered”; Exposure “All their eyes are ice”; Emigree “There was once a country…”; Poppies “All my words flattened, rolled, turned into felt”. **Still to decide:** check the poem summaries and context in `poems.csv` (Claude filled the revision guide's blanks); the `check` quote wordings; the vocab core list.
- Gaps: no revision guide pages for Remains, War Photographer, Poppies, Tissue, Kamikaze, Charge, Bayonet Charge (their data comes from lessons and the Easter sheet); Tissue and Storm on the Island have few labelled techniques; the Unseen Poetry folder was not read.
- Privacy: no class-list names were copied from the poetry lessons.

## Frankenstein data (15 Oct)
- Sources: the five character quote sheets plus the midpoint list (`1 Quote Sheets`), lessons 1–7, 11 and 14–18 in OneDrive > English Year 10 2026 > 1 Frankenstein, and the Project Gutenberg 1818 text (`source/frankenstein.txt`, public domain, so it is in git).
- New: 78 Frankenstein quotes in `quotes.csv` (`fk-<sheet>-<nn>`), each with speaker, chapter (letters are "Letter 1" to "Letter 4"; chapters 1 to 24 follow the 1818 numbering), the sheet's note, and `midpoint_number` / `midpoint_key = yes` for the 14 items on the midpoint list. `matches_source = check` on 15 quotes where the teacher's wording differs from the 1818 text (the novel's wording is recorded in `context`).
- Speaker fix: "I was the slave, not the master, of an impulse…" is Victor in the novel (Chapter 24), though the sheet says the Creature. Changed to Victor and flagged `check`.
- Chapter note: single words ("Monster", "Fiend", "Demon") are used many times; chapter is "Various". The 1818 text spells "demon" as "dæmon".
- Vocab: 83 new rows and 5 merged rows in `vocab.csv` (214 words in total): 13 Key Vocabulary slide words, 8 terms defined in lessons (e.g. Gothic literature, Romantic Movement, Enlightenment, cautionary tale, dehumanise), and 62 words from the "Glossary" boxes on the reading slides. Shared words (Ambition, Embodiment, Transgress, Traumatised, Pivotal moment) now also list Frankenstein. Claude's example sentences are in `examples_draft`. `core` still blank.
- Also added: 8 techniques in `techniques.csv`, 4 symbols (eyes x3, fire) in `symbols.csv`, technique labels on 15 quotes (`lesson_techniques`).
- **Read later (15 Oct):** shortened lessons 9 and 10 added 7 words (justice word family, miscarriage of justice, the justice system, humanity) and updated Dehumanise; no new core quotes beyond fk-4-10. Earlier note, now resolved:  `Lesson 09 & 10 Crime and Justice.pptx` (153 MB) and `Lesson 10 The Creature.pptx` (140 MB) are over the connector's 100 MB limit; Lesson 08 William, 12, 13 (assessment) and the MTP folder were skimmed or skipped. "Miscarriage of justice" is on the lesson 11 slide but its definition is in lessons 9–10. To add it: the teacher can upload a smaller copy of those two lessons, or paste the vocab slides.
- **Decided 15 Oct:** core Frankenstein quotes = the ones shown as quote explosions or analysed in the slides; the teacher's wording stays where it differs from the novel. Core (19 rows, now including “Men appear to me as monsters”; `master = yes`) comes from lessons 1–7, 11 and 14–18; **re-check once lessons 9, 10 and the Creature lesson are read** (the teacher is downloading shorter copies). Still to decide: the vocab core list.
- Privacy: no student names copied.

## Next step
All five texts' data is loaded (Macbeth, Jekyll and Hyde, An Inspector Calls, Power and Conflict, Frankenstein). The cloud branch was merged into `main` (pull request #1), so work on `main`. **Web build plan `plan-web-build.md` approved 15 Oct** (stages 1-9). Decided: example sentences show `examples_text`, else `examples_draft`; host on GitHub Pages by making the repo public at stage 9 (ask the user first).
**Stage 1 done:** `build_data.py` turns the CSVs into `web/data/*.json` (run `python3 build_data.py` after any CSV change; it reports problems). **Stage 2 (shell) written 15 Oct, NOT yet seen in a browser** (no browser or JS runtime in Claude's environment, so the user must look and report problems). Files: `web/index.html`, `style.css`, `js/{storage,data,screens,app}.js`, `img/crest.png` (placeholder copy of `GCA school logo.png`). Home, inside-a-text and Techniques screens are one responsive page (phone and laptop layouts); practice buttons go to a "Coming soon" screen. To view: `cd web && python3 -m http.server 8765`, open http://localhost:8765 (or penguin.linux.test:8765). Small known differences from the design: laptop text cards use a coloured top strip instead of a coloured header band; no Streak/Points chips yet (not needed until scoring exists). Stage 2 checked by the user (looks good, mode switch works).
**Stage 3 (typed game) checked by the user 15 Oct: all rule checks passed.** User asked for more leniency and for a high-level sentence about the text on every answer screen. **Done 16 Oct, NOT yet run in a browser:** (1) matching now ignores lead-in the/a/an/to and word endings (stems), and a near-miss spelling shows an amber "Almost!" screen (no point, word comes back); see `plan-web-build.md`; new checks added to `web/tests.html`. (2) New `examples_high` column in `vocab.csv` with 44 Claude-drafted high-level Macbeth sentences (**teacher must check**); the feedback screen shows one, with the key word in bold. Other texts' `examples_high` are not written yet: do them after the user has judged the Macbeth sample. **16 Oct follow-up (also not yet run in a browser):** more cognate forms accepted (nihilist/nihilism/nihilistic, patriarchy/patriarchal, ambition/ambitious, power/powerful; a stem may also match if it is the start of the other with 2-3 extra letters, but not 1, so "ambigous" stays an "Almost"); sentence box layout fixed (bold word was breaking onto its own line); "unravel" removed from the Psychological unravelling definition. Other definitions that still contain the answer (or a form of it), for the teacher to reword if she wants: Disposable (dispose), Demoniacal (demon), Satanic (Satan), Humanity (human), Scientific ambition (scientific), Absolute power / Abuse of power (power), Direct victims of war (directly), The natural order (naturally), Subvert gender expectations (expect), Imagery (images), Nationalism (nations), PTSD (traumatic), Photojournalist (photographer), Enlightenment (the word itself). **Done 16 Oct (not yet run in a browser): the question screen now blanks any form of the answer in the definition (`Engine.blankWord`, shown as _____); the right/wrong screens show the full definition. The teacher said blanking is fine for now.**
**17 Oct (not yet run in a browser):** high-level sentences now live in `sentences.csv` (id, text, sentence, teacher_checked), one per word per text; ALL 241 word/text pairs written (Macbeth 44, Inspector Calls 34, Jekyll and Hyde 27, Frankenstein 97, Power and Conflict 39) and the old `examples_high` column was removed from `vocab.csv`. **Teacher must check them** (quotes and plot details were chosen carefully but need her eye; poem and novel quotes especially). `build_data.py` reports missing pairs and bad rows. Also fixed: stems no longer trim "s" from words ending in "ss" (transgress/transgresses). 3 earlier-listed items remain: Imagery is not blanked in its definition; "Loaded me with epithets" sentence has no bold (phrase cannot appear naturally). **Stage 4 (multiple choice) written 17 Oct, NOT yet run in a browser:** route `#/text/<id>/vocab-choose`; `Engine.makeChoices` (3 wrong options from the same text, preferring the same length, never a cognate of the right answer, borrowing from all words if the set is small); `Session.answerChoice` (needs 2 right multiple-choice answers to retire a word in Learn the set; the count is saved per word and a wrong answer does not reset it; Free practice never changes counts); screens `choiceQuestion` / `choiceFeedback` in `typed-screens.js`; keys A-D on a keyboard; new checks in `tests.html`. Set complete / "Practise again" are shared with the typed game. **Next: user re-runs tests.html and tries Choose it on Macbeth (phone + laptop widths); then stage 5 (matching).** (Superseded:) **Next: user re-runs tests.html and plays Macbeth; then write `examples_high` for the other texts (or adjust the style) and move to stage 4 (multiple choice).**
1. Teacher checks (she does these, Claude helps): choose the vocab `core` list for every text; read the `examples_draft` sentences; check the poem summaries and context in `poems.csv`; look at the `matches_source = check` quotes.
2. Then plan Version 2 (the working web page) in detail and build it one mode at a time: key vocab first, quotes after. Design is finished (phone and laptop).
3. Not yet read: Frankenstein lessons 12 and 13 (assessment) and the `MTP Frankenstein` folder; the Unseen Poetry folder.

## Separate from this project
The user also has a learning plan (Linux terminal basics, object-oriented Python on Codecademy, later CLAUDE.md practice, handoffs, subagents, skills, MCP). Turn it into a plan file only after the user confirms it.
