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

## Where we got to (end of session, 16 Oct 2026)
- **Teacher pilot only; no students yet.** Feedback is logged in `feedback.md` (8 comments). Paste new feedback into chat and Claude sorts it there. The user wants to take in all feedback first, then build one batch.
- **Blocker:** the school web filter blocks gca-revise.github.io on school desktops ("Security - Domain Sharing"). The user has emailed the AP (a former head of English, who will mediate with IT). Two requests: (1) allow gca-revise.github.io and *.supabase.co for the teacher pilot, with an offer to buy a domain if IT prefers; (2) agree the route to Microsoft sign-in before students. Waiting on the reply.
- **Supabase project created** (gca-revise, London `eu-west-2`, free plan; ref `flfywjedhwbvdiukvkoo`, URL https://flfywjedhwbvdiukvkoo.supabase.co). Table `user_progress` applied (one row per user, own-row-only rules; security check clean; SQL in `supabase/migrations/`). **Nothing is connected to the site yet.** The public (publishable) key is safe in the repo; never commit the secret/service key.
- **Decisions (user):** aim for Microsoft sign-in (Supabase's Microsoft/Azure login), which needs school IT approval and a school data protection check before any student signs in. Pilot on the free github.io address; buy a **generic, neutral domain** later (not `gcarevise`; school gets a subdomain with "GCA Revise" branding). Name ideas, not checked: revisely (probably taken), revisionapp, topgrades. Fallback if sign-in is refused: class code + nickname (no emails). Before offering beyond the school, agree with the school who owns the content (school lesson materials, crest).
- The user is turning on 2-step login (GitHub, `gca-revise` organisation, Supabase).

## Next steps
1. Check the reply from IT / the AP. If github.io is refused, buy the generic domain and ask IT to allow that instead.
2. Build the sign-in (hidden from students until the school approves): "Sign in" button, progress saved to `user_progress` (the app's state is one object in `web/js/storage.js`), test with an email-link login, switch to Microsoft when IT has approved (Claude writes the step-by-step setup for IT). Copy the supabase-js file into the repo instead of loading it from a CDN. Rethink "Reset my progress".
3. Build the batch of quick fixes: gap-fill wrong options of the same word type (feedback #3, #5: add a `gap_type` column to `quotes.csv`, Claude drafts for 229 gap words, teacher checks); a "Save my progress" code or file as a short-term fix for progress resets (#8); a ding on a right answer with an on/off Sound switch (#6); a streak celebration (#7, milestones and look to be decided). Host Google Fonts ourselves so the site has no outside resources.
4. Decisions waiting on the user: more blanks per quote and whether for all quotes or core only (#4); theme tags on quotes (#1, theme list per text to agree with the teacher); a learning path; changes to the points system.
5. Pitch list (see `ideas.md`): model paragraphs (teacher-written), cloze activities, images, dual coding.
6. Branch note: `claude/vocab-quiz-token-saving-n0u1d9` has commits not yet merged into `main` (feedback.md, this handoff, `supabase/`). Open a pull request and merge (docs only; the site does not change).
