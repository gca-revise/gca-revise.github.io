# Plan: Vocab quiz

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
2. **Words tied to the texts:** each word linked to the text it helps with, and the quote it appears in.
3. **Text-themed sets and school branding:** school crest and colours form the frame; each text (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict) gets its own accent colour. Calm and readable, not childish. The teacher is finding a better crest image and will check the school allows its use.

Order: build the web game with key vocab first; add quotes after that.

## Later ideas
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
