# Handoff: GCA Revise (vocab quiz)

Short on purpose. Replace the "Now" and "Next steps" sections each session; do not add a diary. History and the reasons behind old decisions: `handoff-archive.md` (open only when needed). Possible features not yet agreed: `ideas.md`.

## Now
- **Live at https://gca-revise.github.io/** (repo gca-revise/gca-revise.github.io, public). Soft launch with teachers. Pushing to `main` republishes the site in about a minute.
- Plain HTML/CSS/JavaScript in `web/`. Run locally: `cd web && python3 -m http.server 8765`, then http://localhost:8765 (rule checks at /tests.html).
- Change content: edit the CSVs, run `python3 build_data.py` (it reports problems and rewrites `web/data/*.json`), commit, push.
- Built: 5 texts (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict). Key vocab (Type it, Choose it, Match them). 119 techniques in category sets plus "In your quotes". Quotes at Know it (Fill the gap, Who said it? / Which poem?) and Master it (Type the gap, Finish the quote, Spot the technique) for the 95 `master = yes` quotes. "Learn the set" / "Revise everything" switch. "Reset my progress" link.
- Progress is saved on the student's own device only (localStorage). No logins, no student data. Teachers report progress resetting (school computers wipe the browser): feedback #8.
- Plans: `plan.md`, `plan-web-build.md`.

## Rules to keep (privacy)
- Lesson slides contain students' first names (class lists, test scores, "Century" lists). Never copy names from lessons. Also skip the Jekyll and Hyde quotes .docx named after a student and the "Responding to Feedback" sheets.
- Copyrighted full texts (`inspector-calls.txt`, `power-conflict-poems.txt`) are git-ignored and must never be committed.
- The Microsoft 365 connector is read-only; only open the OneDrive folders the user names.

## Waiting on the user (teacher checks, all Claude-drafted, `teacher_checked = no`)
- 241 example sentences (`sentences.csv`), 229 gap words (`quotes.csv`), 30 rewritten vocab definitions (originals in each row's `notes`).
- Technique labels (`techniques` column of `quotes.csv` decides the Spot the technique answer) and technique examples (may swap for GCSE-text examples).
- Whether to trim the 95 core quotes (`master` column), and the vocab `core` list.
- School's OK to show the crest on the public site (swap in a placeholder if refused).

## Where we got to (16 Oct 2026; session of 18 Oct below)
- **Teacher pilot only; no students yet.** Feedback is logged in `feedback.md` (8 comments). Paste new feedback into chat and Claude sorts it there. The user wants to take in all feedback first, then build one batch.
- **Blocker:** the school web filter blocks gca-revise.github.io on school desktops ("Security - Domain Sharing"). The user has emailed the AP (a former head of English, who will mediate with IT). Two requests: (1) allow gca-revise.github.io and *.supabase.co for the teacher pilot, with an offer to buy a domain if IT prefers; (2) agree the route to Microsoft sign-in before students. Waiting on the reply.
- **Supabase project created** (gca-revise, London `eu-west-2`, free plan; ref `flfywjedhwbvdiukvkoo`, URL https://flfywjedhwbvdiukvkoo.supabase.co). Table `user_progress` applied (one row per user, own-row-only rules; security check clean; SQL in `supabase/migrations/`). **Nothing is connected to the site yet.** The public (publishable) key is safe in the repo; never commit the secret/service key.
- **Decisions (user):** aim for Microsoft sign-in (Supabase's Microsoft/Azure login), which needs school IT approval and a school data protection check before any student signs in. Pilot on the free github.io address; buy a **generic, neutral domain** later (not `gcarevise`; school gets a subdomain with "GCA Revise" branding). Name ideas, not checked: revisely (probably taken), revisionapp, topgrades. Fallback if sign-in is refused: class code + nickname (no emails). Before offering beyond the school, agree with the school who owns the content (school lesson materials, crest).
- The user is turning on 2-step login (GitHub, `gca-revise` organisation, Supabase).

## Built this session: email sign-in (hidden)
- `web/js/account.js` + `web/vendor/supabase.js` (library copied into the repo). Switch on in one browser with `/?signin=on` (off: `?signin=off`); nobody else sees it. Email-link login saves progress to `user_progress` and merges with the device copy. Tested: works for the owner's Gmail.
- **Email login is a dead end for school accounts:** (1) school email scanners open the one-time link first, so the user's click fails ("otp_expired"; confirmed in the Supabase logs); (2) Supabase's built-in email sender has a tiny rate limit (429) and is for testing only. A 6-digit code would fix (1) but the user wants login to be easier, so the decision is: go to **Microsoft sign-in** (one click, no email). Keep the email version for testing only.
- Legal summary (UK GDPR, researched in chat, not legal advice): aim for the school as controller and us as processor, with a processor contract; avoid using pupil data for our own purposes (else the ICO Children's Code applies and a DPIA is needed); the school IT admin must approve the app; Supabase offers a DPA covering UK GDPR (check how it handles transfers outside the UK); need a privacy notice in plain English, deletion on request, a breach plan; minimise data (user id only, no analytics or ads); agree content ownership with the school. Ask the school's DPO.
- Supabase Site URL and `http://localhost:8765` are set in the dashboard (Authentication, URL Configuration). Two test accounts exist (Gmail and school address); delete them before real use.
- Branches: only `main` now (two empty leftover branches deleted). Work only on `main`.

## Built 17 Oct (all merged to `main` in PRs #4 and #5, live; user checked the latest build on phone and Chromebook: all good)
- Fonts hosted on the site (`web/fonts/`, no more Google Fonts requests; the page makes no outside requests apart from Supabase when sign-in is on).
- Ding on right answers + Sound button (`web/js/sound.js`, at the foot of every screen; setting kept on the device).
- Fill the gap: wrong options match the answer's word type (`gap_type` column in `quotes.csv`, drafted by Claude for all 229 gap words: **teacher to check**; `build_data.py` reports a missing type).
- "Save or restore my progress" screen (`#/backup`, `web/js/backup.js`, link in the home footer): copy a code or save a file; restore merges (nothing lost).
- Streak celebration (#7): banner + confetti at 5, 10, 20, 50, 100 in a row (`web/js/celebrate.js`; confetti skipped when the device asks for reduced motion; rising cheer when Sound is on). Live.
- Spot the technique (18 Oct): the "About this quote" note now matches the technique asked (notes in `technique_notes` start with the technique name, e.g. "Symbolism – ..."). Oxymoron, Juxtaposition, Antithesis and Paradox never appear as wrong options for each other (`closeTechniques` in `engine.js`). Claude drafted per-technique notes for 28 more quotes and split aic-5-03 and jh-1-06: **teacher to check**. Quotes with one technique still show their one general note.  `tests.html` passes (160 checks) after reinstalling the browser tools.
- Feedback #9 and #10 built (18 Oct, from Naomi): top bar shows learned/total and right so far; each word's latest answer is remembered, missed words come first (not in Match them), and the text screen has a "Got wrong last time" card with a Practise button for vocab. Finish the quote now shows an ellipsis. `/tests.html`: 161 checks pass.
- Master it: the progress bar counts finished games, finished games show ticks, clearer "Set complete" message.
- **Claude CAN test in a browser here (if the Linux container was reset, reinstall first):** `sudo apt-get install -y nodejs npm chromium` (sudo needs no password), then `npm i playwright-core` in the scratchpad, start `python3 -m http.server 8765` in `web/`, and launch `/usr/bin/chromium` with `--no-sandbox`. Re-done on 18 Oct: `/tests.html` passes all 160 checks. Real-device checks by the user are still wanted (phone, school computer, sound).

## Built 19 Oct: sets (lessons by character and theme) - merged to `main` (PRs #6 and #7), live
- User decisions (19 Oct): sets inside each text by **character and theme**; each set is a lesson: **Choose it** (quotes + key vocab) then **Match it** (key vocab) then **Type the gap** then **Finish the quote**, then the set is complete. Sets hold quotes plus key vocab; typed steps cover every quote in the set (core quotes stay as the separate "Master it" card). Claude drafts the sets, the user edits. Backup reminder (old step 2) skipped. "Got wrong last time" card: leave for now. Plan: `plan-sets.md`.
- Data: `sets.csv` (id, text, kind, name, blurb, order, teacher_checked) and a `sets` column (semicolon-separated set ids) on `quotes.csv` and `vocab.csv`. `build_data.py` writes `web/data/sets.json` and prints each set's size. **Drafted for all five texts: Macbeth (12 sets), An Inspector Calls (10), Jekyll and Hyde (10), Frankenstein (13) and Power and Conflict (13: 6 poem groups plus 7 themes).** Poetry: in the Choose it step each poetry quote is asked at random as "fill the gap" or "Which poem is this from?" (quotes with no gap word are always "Which poem?"); other texts ask fill the gap only. Each text has character sets and theme sets of about 5-12 quotes and 5-11 key words (Macbeth also has a vocab-only "Tragic structure" set). **The teacher must check all the sets** (which quotes and words sit where); the choices are Claude's first draft.
- Code: `web/js/lesson-screens.js` (sets list on a text's page, set overview, step-done and set-complete screens), `Data.lessonSteps / lessonProgress / lessonChooseOptions` in `data.js`, `startLessonStep` in `app.js`, `Session` option `onePass` (revising: each item once, nothing saved), `QuoteTools.masterItems(..., only)`. Routes: `#/text/<id>/set/<setId>` (overview) and `.../<step>[/revise]` where step is choose, match, type or finish. A step with nothing to ask is skipped (Match it needs 2+ words; Finish the quote needs 6+ word quotes). Progress is shared with Know it / Master it (same learned ids); the only new saved thing is a "Match it done" flag per set (`lessons` in the saved state, kept by sign-in merge and by the save code).
- Tested in headless Chromium (every set of every text played through all four steps to "Set complete!"): a full lesson (all four steps to "Set complete!") for two sets, revise mode, no console errors; `/tests.html` 170 checks pass.
- Not done yet: points across lessons and a learning path (see `ideas.md`); a "Set complete" celebration; revisit the "Got wrong last time" card once sets are in use.

- 19 Oct (later): Revise everything top bar shows right/wrong, no progress bar; Finish the quote shows the smaller half as the prompt; set page has a "Got wrong last time" card (saved per set and step as `lessonWrong`) and a richer "What is in this set" (quotes with speaker and act/scene, vocab tap-for-meaning); Spot the technique fixes for "Fair is foul" (Fricative, Repetition) and close-technique groups.

- 19 Oct (later): **Set complete celebration** (banner, confetti, cheer; `Celebrate.setComplete`). **Points (stage 1, device only):** `web/js/points.js`. Weekly score (resets Monday) and lifetime score (never falls), shown on the home screen and on the step/game finished screens. Rules (user decided): +1 for a right answer at the first attempt, once per word per week; +1 bonus at streak 5/10/20/50/100, then every 50 up to 5,000 (same list as the celebration); a perfect Match them round +1 if it holds a word that has not scored this week; nothing in Revise everything; wrong answers never lose points (no -1, no hearts: user wanted to stop guessing). In-game "Points" now means points earned this visit. Saved in `pts` in the saved state, merged by sign-in and carried in the save code. `/tests.html` 193 checks pass.
- **Ranks (19 Oct):** Wood, Stone, Bronze, Silver, Gold, Emerald, Sapphire, Ruby, Diamond (materials; user chose) by lifetime points (`Points.RANKS` in `points.js`; thresholds 0/50/150/300/500/800/1200/2000/3000 are Claude's guess, **user to adjust**). Home screen shows the rank with a bar to the next; a "New rank" banner appears on reaching one. 195 checks pass.

## Next steps
1. The user tries the lessons on a phone and Chromebook, then asks teachers what they think of them (length, order of steps, set choices).
2. User/teacher: check all the sets (which quotes and words sit where; Claude's first draft). Every quote and every key word is now in at least one set.
3. Check IT's reply (github.io and *.supabase.co unblocked? route to Microsoft sign-in?). Sign-in cannot start until then.
4. Teacher checks waiting: Claude-drafted technique notes (including the new Fricative note on mac-1-01), the Foil technique, sentences, gap words, word-type labels, definitions.
5. Decide, then build: a learning path (points done, stage 1); leaderboard later (needs sign-in + school OK; weekly points are the number to rank) (`ideas.md`); more blanks per quote (#4); theme tags are now covered by the theme sets (#1).
6. Possible follow-ups: Microsoft sign-in (Entra steps for IT, then a hidden button); "Practise these" for quotes and techniques.
7. Pitch list (see `ideas.md`): model paragraphs (teacher-written), cloze activities, images, dual coding.
