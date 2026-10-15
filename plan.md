# Plan: GCA Revise (started as the vocab quiz)

## Goal
A revision game for students, similar to Quizlet, but with features the teacher can change. Around 100 words and definitions, entered by the teacher.

## Decisions so far
- Students use both phones and Chromebooks.
- No logins. Scores stay on the student's own device (at least in the medium term). No student data in any file.
- The teacher supplies words in a spreadsheet, or pastes them into chat for Claude to turn into `vocab.csv`.
- Game modes wanted: typed answer, multiple choice, matching game.

## Added after Version 1 was played (agreed)
- **Mastery:** a word is retired after 1 correct typed answer, or 2 correct multiple-choice answers. Missed words stay in the deck and come back.
- **Completing a set:** when every word is retired, show a "Set complete!" screen with stats.
- **Free practice:** the endless mode stays as an optional mode.
- **Stats (light):** per-word right/wrong counts and a "trickiest words" list at the end. In the web version, saved on the student's device only.

## Version 1: terminal quiz (the "kitchen": rules only)
- Endless: runs until the player types `q`.
- Shows a definition; the player types the word. Capitals and extra spaces ignored; spelling must be correct.
- 1 point per correct answer. A wrong answer shows the right word and scores nothing.
- Every word is used once before any word comes round again. The same word never appears twice in a row.
- Score shows after each answer. On quit, a summary: points, right/wrong counts, best streak.
- Files: `vocab.csv` (columns: word, definition; ~10 sample words), `quiz.py` (a simple `VocabQuiz` class).
- The quiz reads only from `vocab.csv`, so the real 100 words can be swapped in later.

## Version 2: web page (the "dining room")
- A web page that works on phones and Chromebooks, hosted free (e.g. GitHub Pages) so students just open a link.
- Written in JavaScript (the language browsers run), reusing the rules agreed in Version 1.
- Modes: typed answer first, then multiple choice, then matching.
- Reads the same `vocab.csv`.
- Best score and progress saved in the student's own browser only.

## What makes this different from Quizlet (agreed; see `brainstorm-differentiation.md`)
Focus on three things:
1. **Exam-skills quotes:** fill the gap and "who said it?", plus context (to whom, which theme, which character, which technique).
2. **Words tied to the texts:** each word is tagged with the text it helps you write about (e.g. Macbeth), whether or not it appears in the text (hamartia and belittles are examples). Quotes will come from the texts and are dealt with later.
3. **Text-themed sets and school branding:** school crest and colours form the frame; each text (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict) gets its own accent colour. Calm and readable, not childish. The teacher is finding a better crest image and will check the school allows its use.

Order: build the web game with key vocab first; add quotes after that.

## Later ideas
- Character images on quote questions (user has images in mind, or AI generated; check copyright and keep one consistent style).
- **Example sentences (user idea, 14 Oct):** each key vocab word gets a sentence showing it in use, ideally about the text, e.g. "Lady Macbeth belittles Macbeth." Could show after a right or wrong answer, and later power fill-the-gap questions. Needs a sentence per word in `vocab.csv`. Not for the first build.
- Words in context ("which sentence uses it correctly?"), spaced return of learned words, light rewards (per-text badges, daily goal).
- Streak bonuses, retrying missed words.
- A page where the teacher can type in words directly.
- Anonymous class-level insight (which words are hardest). Needs a server and a privacy/school-policy conversation first.
- Teacher-visible scores (same privacy conversation).

## Steps
1. Teacher approves this plan.
2. Build Version 1 with ~10 sample words; teacher tries it.
3. Teacher supplies the real ~100 words; Claude makes `vocab.csv`.
4. **Design the web version first, as an artifact** (a visual mock-up page): home screen with set choice, the typed-answer screen, the "Set complete!" screen, and later multiple choice and matching. Look and feel on phone and Chromebook. The teacher reviews and changes it until happy. It is a picture of the game, not the working game.
5. Update the design with school branding and per-text accent colours (once the teacher has a good crest image).
6. Plan Version 2 in detail from the approved design, then build the key-vocab web game one mode at a time.
7. Then quotes: design, then build.

## App name and structure (agreed 14 Oct)
- **Name:** GCA Revise. It is bigger than a vocab quiz, so the name is no longer "Vocab Quiz".
- **Texts first:** Home shows the texts (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict). Inside a text the student chooses **Quotes** or **Key vocab**, then the question style.
  - Quotes: fill the gap, who said it?
  - Key vocab: type it, choose it, match them.
- **Key vocab can sit in more than one text** (2 or 3), with no separate set of its own. A word learned in one text should count as learned in the others.
- **Techniques** (simile, metaphor, repetition and so on): one section across all texts, with its own screen. Same practice styles as vocab. Later feature: "technique analysis", where students learn which technique is used in each quote.
- **Matching scoring (agreed):** one point in total per matching round, and only if there are no mistakes. Matching does not retire words (practice only).
- **Design status:** phone screens drafted as an artifact (Home, inside a text, Techniques, typed answer, multiple choice, matching, quotes, set complete). Chromebook/laptop layout is drafted too.

## Data we will need (user, 14 Oct)
A lot of content eventually. Three simple files, all checked by the teacher before students see them:
- **`vocab.csv`:** word, definition, texts it is tagged to (one or several), example sentence (optional at first).
- **`quotes.csv`:** quote, the gap word(s) for fill-the-gap, who said it, text, act/scene (or poem title), technique(s) used. A quote can have more than one technique.
- **`vocab.csv` as built (15 Oct, Macbeth):** 44 words from the Year 10 Macbeth lessons (OneDrive: English Year 10 2026 / 7 Macbeth). Columns: id, word, definition, examples_text, examples_general, synonyms, antonyms, notes, texts, topic (the lesson theme), lesson, source, core, teacher_checked. `examples_text` holds example sentences about the English texts; `examples_general` holds the others (kept, but only the text ones go in the final game). `examples_draft` holds sentences about Macbeth written by Claude (15 Oct) for the 15 words that had none; the teacher checks them, and approved ones move into `examples_text`. `core` is empty until the teacher decides which words are core (same idea as `master` for quotes). 31 words come from Key Vocabulary slides; 13 are `defined elsewhere in lesson` (terms the lessons define but do not put on a vocab slide, such as thane, soliloquy and the Freytag act-structure terms). Wording is copied from the slides; two typos were fixed on 15 Oct. The example sentences' names are made up (teacher confirmed). `texts` is `Macbeth`; add other texts with semicolons when a word is shared.
- **Jekyll and Hyde data (15 Oct):** `quotes.csv` now holds Macbeth and Jekyll and Hyde. New/renamed columns: `chapter`, `chapter_title` (novel quotes use these instead of act and scene) and `location_checked` (was `scene_checked`). 42 J&H quotes: 40 from the four homework sheets (ids `jh-<sheet>-<number>`; the sheet's “Red baize door” and “windows barred with iron” entry was split in two) plus “My devil had long been caged, he came out roaring” (`jh-5-01`) from the Year 11 revision document. The five J&H master quotes come from that document: jh-1-06, jh-2-03, jh-2-09, jh-4-07, jh-5-01. Speakers are taken from the sheets' notes; where a sheet only says “describes…”, the speaker is `Narrator`. Chapters and speakers were checked against the novel text in `source/jekyll-hyde.txt` on 15 Oct (`location_checked = yes`). `matches_source = check` marks 14 quotes whose sheet wording is shortened or differs from the novel (for example the sheet says “fell into slavery” but the novel says “fell in slavery”); the teacher's wording is kept. “Windows barred with iron” is in Chapter 5, not Chapter 8. `lesson` and `lesson_techniques` hold labels from the lessons (19 J&H quotes). `vocab.csv` now holds 66 words (Macbeth plus 22 new J&H words); four words appear in both texts (embodiment, façade, hubris, anagnorisis) and have `texts = Macbeth; Jekyll and Hyde`. `lesson` now says which text's lesson, e.g. `Macbeth lesson 17`. `examples_draft` also holds Claude-written J&H sentences for 9 words that had no text-based sentence; the teacher checks them.
- **An Inspector Calls data (15 Oct):** 48 quotes in `quotes.csv` (ids `aic-<sheet>-<number>`; sheets 1-4 are the homework quote sheets, sheet 5 holds five quotes that are only on the mid-point sheet, sheet 6 holds eleven Act 1-3 quotes taken from the lessons on Sheila, Mrs Birling, Eric, the final speech and accountability). Extra columns `midpoint_number` and `midpoint_key`: the mid-point revision sheet numbers 28 quotes and says students must know 12 of them; those rows are flagged `midpoint_key = yes`. For the 31 rows on that sheet, `context`, `techniques` and `technique_notes` hold its context, technique and analysis. **Core (`master = yes`): 20 quotes (22 rows)** chosen with the teacher on 15 Oct: the staging pair (pink/intimate and brighter/harder), Unsinkable, A man has to mind his own business, These girls aren’t cheap labour, A rather cold woman, Easy well-bred young man-about-town, Not quite at ease, the disinfectant line, Inspector Goole, We are members of one body, Public men have responsibilities, the Mrs Birling/Inspector “child”/“young ones” exchange, As if a girl of that sort would refuse money, You were the wonderful fairy prince, You used her… as if she was an animal, You killed her and the child she’d have had too, One Eva Smith has gone… millions, fire and blood and anguish, You’ll be able to divide the responsibility, and I know I’m to blame. Acts and speakers were checked against the play text on 15 Oct; speaker `Stage direction` is used for descriptions in the stage directions. The play (1945) is still in copyright, so its text is kept in `source/inspector-calls.txt` only in the working copy and is **git-ignored (not on GitHub)**; upload it again in a new session if checking is needed. `vocab.csv` now holds 97 words: 31 new Inspector Calls words (25 from Key Vocabulary slides, 6 defined elsewhere) and three words shared with the other texts (façade, anagnorisis, resolution). `examples_draft` holds Claude-written Inspector Calls sentences for the 19 words that had none; the teacher checks them.
- **Power and Conflict poetry data (15 Oct):** 15 poems from the AQA anthology. New files: `poems.csv` (id, poem, poet, text, unit, summary, context, form_notes, teacher_checked; summaries and context come from the Year 11 revision guide for 8 poems and from the lessons for the rest, with the guide’s missing-word blanks filled in by Claude, so the teacher should check them) and `techniques.csv` (17 techniques with the definitions given in the revision sheet and lessons; many techniques used as labels in quotes have no definition yet). `quotes.csv` has 61 poetry quotes (ids `pc-<poem>-<number>`) with new columns `poem`, `poet`, `easter_key`: 33 quotes are from the Easter revision sheet, which gives each a meaning, techniques and analysis (flagged `easter_key = yes`, as a starting point for choosing core quotes; `master` is `no` for all poetry quotes until the teacher chooses). `lesson_techniques` holds labels from the lessons and the guide. Poem wording was checked against an OCR read of the AQA anthology PDF (kept only in the working copy as `source/power-conflict-poems.txt`, git-ignored because most poems are in copyright): 5 quotes differ in spelling or wording and are marked `matches_source = check` (the anthology has “There once was a country…”, “charter’d/chartered”, “mind-forged”, “Some one had blunder’d”, and “It lies down in front of me”). Poetry lessons live in three Year 10 folders (2 Fear and Bravery, 4 Language Paper 1 / 5 Mental Suffering, 6 Power of Nature) and the Year 11 folder 6 Power and Conflict Poetry. `vocab.csv` now holds 131 words: 33 new Power and Conflict words (16 from Key Vocabulary slides, the rest from the Easter sheet or defined in lessons) plus words shared with other texts (omnipotent, hubris, consumed, patriarchal, disempowered, tyrant).
- **`symbols.csv`:** four symbols the lessons name (blood, brandished steel, dagger, milk) and what they represent.
- **`quotes.csv` also has** `lesson` and `lesson_techniques`: technique labels taken from the "Let's Analyse this Quote" slides for 18 quotes (separate from the Year 11 document's labels in `techniques`).
- **`quotes.csv` as built (15 Oct, Macbeth):** 51 quotes from the five homework sheets. Columns: id, text, act, scene, scene_checked, speaker, quote, sheet_note, master, gap_word, techniques, technique_notes, context, folger_ftln, matches_folger. Each quote has a stable id (e.g. `mac-3-05`). Techniques, notes and context are filled for the five master quotes only (from the teacher's Year 11 revision document). Acts, scenes and speakers were checked against the Folger text in `source/macbeth.txt` (Folger scene numbers). `source_line` (was `folger_ftln`) is the Folger line marker where a Macbeth quote starts. `matches_source` (was `matches_folger`) is `check` where the sheet's wording differs from Folger (spelling, abridging, "chaps" vs "chops"); the teacher decided (15 Oct) to keep her sheets' wording, which is deliberately more modern and simpler, so do not "correct" it to Folger; the column is only a record of the difference. Gap words are to be chosen later, when the fill-the-gap mode is built. `gap_word` is empty until chosen. The sheet's four-phrase entry was split into Devilish Macbeth, Black Macbeth and Untitled tyrant; "Sinful Macbeth" is not in the play (the text has "Sinful Macduff", Macduff speaking of himself), so it was left out.
- **`techniques.csv`:** technique name and a short definition (simile, metaphor, repetition...). Quotes point to these names, which later allows "spot the technique".
Claude can draft or tidy the files from lists the teacher supplies; the teacher checks every quote, speaker and technique for accuracy, because students will learn from them.

## Quote levels (agreed 15 Oct)
- **Know it** (all quotes): passive recognition. Who said it, which act, match quote to character or theme, pick the missing word from options. Mostly multiple choice and matching, no typing needed.
- **Master it** (`master = yes`): the few quotes students must use in essays. Typed gap, finish the quote, spot the technique (technique analysis). Starts with the 5 quotes from the Year 11 revision document; more can be added later by changing `master` from no to yes.
- **Model paragraph library (later):** a separate file keyed by quote id. The teacher will supply her own paragraphs (right style). Claude does not draft them.
