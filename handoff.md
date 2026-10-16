# Handoff: GCA Revise (vocab quiz)

Short on purpose. Replace the "Now" and "Next steps" sections each session; do not add a diary. History and the reasons behind old decisions: `handoff-archive.md` (open only when needed). Possible features not yet agreed: `ideas.md`.

## Now
- **Live at https://gca-revise.github.io/** (repo gca-revise/gca-revise.github.io, public). Soft launch with teachers. Pushing to `main` republishes the site in about a minute.
- Plain HTML/CSS/JavaScript in `web/`. Run locally: `cd web && python3 -m http.server 8765`, then http://localhost:8765 (rule checks at /tests.html).
- Change content: edit the CSVs, run `python3 build_data.py` (it reports problems and rewrites `web/data/*.json`), commit, push.
- Built: 5 texts (Macbeth, An Inspector Calls, Jekyll and Hyde, Frankenstein, Power and Conflict). Key vocab (Type it, Choose it, Match them). 119 techniques in category sets plus "In your quotes". Quotes at Know it (Fill the gap, Who said it? / Which poem?) and Master it (Type the gap, Finish the quote, Spot the technique) for the 95 `master = yes` quotes. "Learn the set" / "Revise everything" switch. "Reset my progress" link.
- Progress is saved on the student's own device only (localStorage). No logins, no student data.
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

## Next steps
0. Teacher feedback is logged in `feedback.md` (2 comments so far; paste new feedback into chat and Claude sorts it there).
   - **Blocker (feedback #2):** the school web filter blocks gca-revise.github.io on school desktops ("Security - Domain Sharing"). The user needs to ask school IT to allow it; if they refuse or it drags on, buy the custom domain sooner and ask IT to allow that.
1. Collect the teachers' feedback from the soft launch and turn it into fixes.
   - Quick fix: technique spotting in quotes (tidy the labels).
   - Big fixes needing a design decision: a learning path instead of free choice; changes to the game, sets and points system.
2. Build next (pitch list): model paragraphs (teacher-written; Claude does not draft them), cloze activities, images, dual coding.
3. Later: buy a domain and point it at the same site; Supabase logins (needs a proper plan first: progress moves from the device to the account, and "Reset my progress" needs rethinking).
