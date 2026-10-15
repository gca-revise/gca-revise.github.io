# Plan: building the GCA Revise web page (Version 2)

Written 15 Oct 2026. Status: **draft for the teacher to approve.** Follows the approved design (phone and laptop screens in the design artifact) and the rules already agreed in `plan.md`.

## The big idea (restaurant analogy)
- **Pantry:** the CSV files (`vocab.csv`, `quotes.csv`, and so on). The teacher's source of truth. We keep editing these.
- **Prep kitchen:** a small script that turns the pantry into a tidy data file for the web page. It leaves out the teacher-only columns (notes, `examples_general`, `examples_draft` and so on) so students only get what they should see.
- **Kitchen:** the rules (what counts as right, when a word is retired, no repeats). Plain JavaScript, kept separate from how things look so we can test it.
- **Dining room:** the screens students see, copied from the approved design.

## Technology (kept deliberately simple)
- Plain HTML, CSS and JavaScript. No frameworks, no installing anything for students. It is just files in a folder.
- Lives in a new folder `web/` in this project.
- Students' progress is saved in their own browser (called `localStorage`). Nothing is sent anywhere. No logins. No student data in any file.
- To try it: run `python3 -m http.server` in `web/` and open the link on the Chromebook. Claude can also check it in a browser.

## Folder layout
```
web/
  index.html          the one page
  style.css           colours, layout (crest + per-text accent colours)
  js/
    data.js           loads the data file
    engine.js         the rules (kitchen): deck, retiring words, scoring, stats
    storage.js        saving/loading progress in the browser
    screens.js        drawing each screen (dining room)
  data/               made by the prep-kitchen script, not edited by hand
build_data.py         pantry -> web/data/*.json
```

## Rules we are carrying over (all already agreed)
- Typed answer: capitals and extra spaces ignored. A word is retired after **1 correct typed answer** or **2 correct multiple-choice answers**.
- Every word is used once before any repeats; the same word never twice in a row. Missed words stay in the deck.
- Matching: 1 point per round, only if no mistakes. Matching never retires a word.
- A word in 2 or 3 texts is the same word everywhere: learn it once, it counts everywhere. So progress is saved per word `id`, not per text.
- A text's "Set complete!" shows when every key-vocab word tagged to that text is retired. Learn the set / Free practice switch stays.
- Light stats: right/wrong per word, "trickiest words" list.

## Build stages (each ends with something working you can try, then a commit and push)
1. **Prep kitchen.** `build_data.py` turns the CSVs into JSON, split into texts, words, quotes, techniques. It checks for problems (duplicate ids, a word with no definition, a text name that does not match) and tells us.
2. **Shell.** Home screen with the five texts plus Techniques, "inside a text" screen, navigation, crest and colours. Words are real, nothing playable yet. First check of the look on your phone.
3. **Engine + typed answer** for key vocab: the rules, saving progress, right/wrong screen, Set complete with stats. Rules tested with a small automatic test file (like the checks we did on `quiz.py`).
4. **Multiple choice.** Needs wrong options: Claude picks them from other words in the same text so they are believable. Words retire after 2 correct.
5. **Matching.** A round of several pairs, 1 point if perfect.
6. **Techniques section.** Same three practice styles using `techniques.csv`.
7. **Quotes, "Know it" level.** Who said it, which act or chapter, pick the missing word from options. Works for every quote.
8. **Quotes, "Master it" level.** Typed gap and finish-the-quote for `master = yes` quotes only. **Blocked until gap words are chosen** (`gap_word` is empty today).
9. **Go live.** Put it on the internet for students (see the open decision below), test on real phones and Chromebooks.

Stages 1 to 6 need nothing more from the teacher. Stages 7 and 8 need only the gap words and the core flags.

## Choices Claude recommends (teacher can overrule)
- **Typing leniency:** ignore capitals, extra spaces and accents (so "facade" is accepted for "façade"); spelling must otherwise be exact, as agreed. Hyphens and spaces treated the same ("self fulfilling prophecy").
- **While `core` is empty:** the first version uses all words tagged to a text. When the teacher fills `core`, we add a "Core only / All words" choice rather than changing the data.
- **Example sentences:** show `examples_text` after an answer if there is one. `examples_draft` sentences stay hidden until the teacher approves them (moved to `examples_text`). Words with no approved sentence just show the definition.
- **Hidden from students:** anything with `teacher_checked = no` could be shown with a small flag during testing but not at launch. Decide at stage 9.
- **Data stays one-way:** the web page never edits the CSVs. All changes go through the CSVs and the prep script.

## Open decisions (none block stages 1 to 6)
1. **Where to host.** GitHub Pages is free, but for a *private* repo it needs a paid GitHub plan; on the free plan the repo would have to be public, which would also publish the teacher's lesson-derived wording. Options: (a) keep this repo private and publish only the finished `web/` folder to a separate public repo; (b) use a free host that can publish from a private repo (Netlify or Cloudflare Pages); (c) pay for GitHub. Claude suggests (a) or (b). Check what the school allows.
2. **Copyright:** the page will show short quotes from copyrighted texts (An Inspector Calls, most poems). Short quotes for teaching are normal, but the full texts in `source/` must **not** be published. Another reason to publish only `web/`.
3. **Crest image:** still being chosen; use a plain placeholder until then.
4. **Teacher checks** (vocab `core`, `examples_draft`, `matches_source = check` quotes, poem summaries) can happen alongside the build; they do not stop it.

## How we will work
- One stage at a time. Each stage: Claude builds, explains what it did in plain English, the teacher tries it on a phone/Chromebook, then commit and push.
- Re-read the design artifact before each screen is built (the teacher can edit it on the website).
- Handoff updated at the end of each session.
