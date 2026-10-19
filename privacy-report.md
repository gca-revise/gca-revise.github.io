# Privacy and security report: GCA Revise

Date: 19 October 2026
Note: this is a technical check, not legal advice. The school's data protection officer (DPO) must sign off.

## Summary
- Today the live site stores nothing about students on any server. Progress stays in the browser on the student's own device, and the page makes no outside requests unless the hidden sign-in switch is turned on.
- No secrets, no student names and no copyrighted texts were found in the files or the git history. The Supabase database rules are correct (each user reaches only their own row).
- The main gap is paperwork, not code: no privacy notice, no contract with the school, no retention or breach plan yet. These must exist before any student signs in.

## Findings (most serious first)

| What | Where | Risk | What to do |
|---|---|---|---|
| Paperwork for sign-in not yet in place (privacy notice, controller/processor split, school contract, breach plan, retention period, school approval). See "Paperwork still needed". | not in repo | High (only once students sign in; none needed for the device-only version) | Do not let students sign in until the DPO has approved. Draft a one-page plain-English privacy notice first. |
| Two leftover test accounts (one Gmail, one school address) are noted in `handoff.md`. I did not read user data, so I cannot confirm they still exist. The table `user_progress` shows 0 rows. | Supabase Authentication | Medium | Delete both in the Supabase dashboard (Authentication, Users) before real use. A school email address is personal data. |
| Sign-in switch is hidden but the sign-in code and the Supabase library are loaded for everyone. The library only starts if the browser was switched on with `?signin=on`. | `web/js/account.js`, `web/index.html` | Low | Fine as is. The page contacts Supabase only in a browser where sign-in was switched on. Keep it that way until approval. |
| Email sign-in sends the user's email address to Supabase (stored in Supabase's login records, not in our table). Microsoft sign-in (planned) would hold the school account's email and name similarly. | `web/js/account.js` (`signInWithOtp`) | Medium (when sign-in is on) | Treat the login email as personal data. Tell the DPO. Our own table holds only a user id and progress. |
| The progress data saved to Supabase is an open-ended JSON blob (`state`, limited to 200 KB). Today it contains only learning data (see list below), but nothing in the database stops someone adding a name later. | `supabase/migrations/20261016000000_user_progress.sql` | Low | Keep the rule "user id only". Re-check this report after any change to what is saved. |
| Supabase advisor warning: "leaked password protection disabled". | Supabase Auth | Low (not relevant) | The site uses email links, not passwords. Can be ignored, or switched on to clear the warning. |
| The school crest is on a public site (`web/img/crest.png`, `GCA school logo.png`). | repo, public GitHub repo | Low (permission, not privacy) | Already on your waiting list: get the school's OK, or swap in a placeholder. |
| A teacher's first name appears in `feedback.md` and `handoff.md`. Both files are in a public repo. The git commit history also shows your Gmail address as commit author. | `feedback.md`, `handoff.md`, git history | Low | Not student data. Check the teacher is happy to be named, or change to "a teacher". The commit email is public; GitHub can hide it (a "noreply" address) for future commits. |
| The GitHub repo is public, so every file and the whole history is world-readable. | GitHub | OK (informational) | Nothing private should ever go in. Current check found nothing private. |
| Student names and class data in files or history | `git ls-files`, `git log --all --name-only` | OK | No .docx, .pptx, .xlsx or .pdf files were ever committed. No "Responding to Feedback" sheet or student-named Jekyll and Hyde file. Source texts in `source/` are the novels, not lesson slides. |
| Secrets | tracked files and all history | OK | No service-role or secret key, password, token or `.env` found. The only key is the publishable one (`sb_publishable_...`) in `web/js/account.js`. That is meant to be public. Key found there; not repeated here. |
| Copyrighted texts | `.gitignore`, history | OK | `.gitignore` covers `source/inspector-calls.txt` and `source/power-conflict-poems.txt`. `git log --all` shows neither was ever committed. |
| Outside requests | `web/` | OK | See the list below. No analytics, no adverts, no iframes, no outside fonts or images. |
| Supabase rules | migration; live table | OK | Row-level security (a rule that checks who is asking before any row is shown) is on for `user_progress` and confirmed on the live table. All four rules (read, create, update, delete) require `auth.uid() = user_id`, so a user reaches only their own row. Rules apply only to signed-in users (anonymous visitors get nothing). Rows are deleted automatically if the user is deleted. |
| Region | handoff notes | OK, to confirm | Project is recorded as London (`eu-west-2`). I could not verify the region from here. |

## What we store and where

On the student's device (browser `localStorage`, nothing sent anywhere):
- `gca-revise-v1`: learning progress only. Which words and quotes are learned or retired, right and wrong counts and last answers per item, which mode was chosen, the sound on/off setting, per-set lesson flags and "got wrong last time" lists, and points (weekly and lifetime).
- `gca-signin`: a single flag saying sign-in is switched on in this browser (only if someone visited `?signin=on`).
- No cookies, no sessionStorage, no analytics. If sign-in is on, the Supabase library also keeps its login session in the browser.
- The "Save or restore my progress" screen produces a code or file that the student keeps themselves.

Sent to Supabase (only when sign-in is switched on and the user signs in):
- The email address used to sign in (held by Supabase's login system, not in our table).
- One row in `user_progress`: a user id, the progress data above, and a last-updated time. No name, no email, no IP address or device details are written by our code (Supabase's own login records may hold sign-in time and IP; check with their DPA).

Outside requests the page can make:
- Always: none. Fonts, crest, and the Supabase library are all hosted on the site itself.
- Only with sign-in switched on and used: `https://flfywjedhwbvdiukvkoo.supabase.co` (login and progress). The web filter issue on school computers (feedback #2) is about github.io and supabase.co.
- The site itself is hosted by GitHub Pages, so GitHub sees visitors' IP addresses in the normal way (it is the host). Worth stating in the privacy notice.

## Paperwork still needed (UK GDPR)

| Item | Exists? |
|---|---|
| Privacy notice in plain English (for students and parents) | No |
| Who is controller and who is processor (aim: school controller, you as processor) | Planned in `handoff.md`, not agreed or written down |
| Processor contract (DPA) with the school | No |
| Supabase DPA signed and where data is held | Region is London (per handoff); DPA not yet checked. Check the Supabase DPA for transfers outside the UK (for example support staff or sub-processors in the US) |
| Deletion on request | Partly. Deleting a user in Supabase removes their row automatically, but there is no written process or in-app button |
| Breach plan | No |
| Data minimisation | Yes by design (user id and progress only; no analytics or adverts) |
| Retention period | Not set |
| Who approves the app at the school (IT admin, DPO, senior leader) | Not agreed; Microsoft sign-in route awaiting IT's reply |
| Content ownership agreement (lesson material, crest) | No |
| Data protection impact assessment (DPIA) | Not done. Likely needed or at least advisable for a children's service; ask the DPO. Avoiding use of pupil data for your own purposes keeps the ICO Children's Code out of the picture |

## Questions for the school's DPO
1. Will the school be the controller and the app's author the processor? What contract do you want signed?
2. Is a DPIA needed for a revision tool used by under-18s that holds a user id and progress data?
3. Is Supabase (London region, with its DPA) acceptable as a sub-processor? Are its possible transfers outside the UK acceptable?
4. Is the school email address of a signed-in student acceptable to hold in the login system, or do you prefer a class-code and nickname route with no emails?
5. How long should progress be kept (for example until the end of the school year or until the student leaves), and who triggers deletion?
6. Who tells parents and students (privacy notice), and who handles a data request or a breach?
7. Is the pilot with teachers only (no student sign-in, progress on the device) fine to continue as is?
8. Is the school happy for the crest to be used on a public website?
