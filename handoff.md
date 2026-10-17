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

## Built this session: email sign-in (hidden)
- `web/js/account.js` + `web/vendor/supabase.js` (library copied into the repo). Switch on in one browser with `/?signin=on` (off: `?signin=off`); nobody else sees it. Email-link login saves progress to `user_progress` and merges with the device copy. Tested: works for the owner's Gmail.
- **Email login is a dead end for school accounts:** (1) school email scanners open the one-time link first, so the user's click fails ("otp_expired"; confirmed in the Supabase logs); (2) Supabase's built-in email sender has a tiny rate limit (429) and is for testing only. A 6-digit code would fix (1) but the user wants login to be easier, so the decision is: go to **Microsoft sign-in** (one click, no email). Keep the email version for testing only.
- Legal summary (UK GDPR, researched in chat, not legal advice): aim for the school as controller and us as processor, with a processor contract; avoid using pupil data for our own purposes (else the ICO Children's Code applies and a DPIA is needed); the school IT admin must approve the app; Supabase offers a DPA covering UK GDPR (check how it handles transfers outside the UK); need a privacy notice in plain English, deletion on request, a breach plan; minimise data (user id only, no analytics or ads); agree content ownership with the school. Ask the school's DPO.
- Supabase Site URL and `http://localhost:8765` are set in the dashboard (Authentication, URL Configuration). Two test accounts exist (Gmail and school address); delete them before real use.
- Branches: only `main` now (two empty leftover branches deleted). Work only on `main`.

## Built 17 Oct (quick fixes merged to `main` in PR #4, live; streak celebration on branch, see below)
- Fonts hosted on the site (`web/fonts/`, no more Google Fonts requests; the page makes no outside requests apart from Supabase when sign-in is on).
- Ding on right answers + Sound button (`web/js/sound.js`, at the foot of every screen; setting kept on the device).
- Fill the gap: wrong options match the answer's word type (`gap_type` column in `quotes.csv`, drafted by Claude for all 229 gap words: **teacher to check**; `build_data.py` reports a missing type).
- "Save or restore my progress" screen (`#/backup`, `web/js/backup.js`, link in the home footer): copy a code or save a file; restore merges (nothing lost).
- Streak celebration (#7): banner + confetti at 5, 10, 20, 50, 100 in a row (`web/js/celebrate.js`; confetti skipped when the device asks for reduced motion; rising cheer when Sound is on). On the branch until merged.
- **Claude CAN test in a browser here:** Node and Chromium are installed. `npm i playwright-core` in the scratchpad, start `python3 -m http.server 8765` in `web/`, launch `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with `--no-sandbox`. Used this session for screenshots and checks (tests.html: 157 checks pass). Real-device checks by the user are still wanted (phone, school computer, sound).

## Next steps
1. User tries the branch build on phone and Chromebook, then merge to `main` (the site republishes). Then check IT's reply (github.io and *.supabase.co unblocked? route to Microsoft sign-in?).
2. Microsoft sign-in: Claude writes the Entra app registration steps for IT, then adds a hidden "Sign in with Microsoft" button (Supabase Azure provider). Needs IT admin approval.
3. Merge the streak celebration (PR open), then ask teachers for the next batch of feedback.
4. Decisions waiting on the user: more blanks per quote and for which quotes (#4); theme tags (#1); a learning path; points system changes.
5. Pitch list (see `ideas.md`): model paragraphs (teacher-written), cloze activities, images, dual coding.
