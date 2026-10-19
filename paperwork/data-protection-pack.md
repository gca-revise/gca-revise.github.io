# GCA Revise: data protection pack for the school's DPO (DRAFT)

*Written by Claude from the project's code and `privacy-report.md`. A technical description plus proposals, not legal advice. Square brackets = for the school to fill in or confirm. Items marked **VERIFY** are things I believe but have not confirmed with the supplier.*

## 1. What it is
A free revision website for GCSE English Literature (vocabulary and quotes, quizzes, points). Static website hosted on GitHub Pages at gca-revise.github.io. Built and run by [name, role] for [School]. Teacher pilot only so far; **no students use it yet**.

## 2. Two modes
| | Device-only (live now) | Sign-in (not live, hidden) |
|---|---|---|
| Account needed | No | Yes, school Microsoft account (planned) |
| Where progress is kept | Browser localStorage on the student's device | Supabase database (London, eu-west-2), plus a device copy |
| Personal data held by us | None | See section 3 |
| Outside requests from the page | None | Microsoft (login) and Supabase |

## 3. Data map (sign-in mode)
| Data | Source | Where | Purpose | Needed? |
|---|---|---|---|---|
| Email address, display name, Microsoft account ID | Microsoft sign-in, passed to Supabase Auth | Supabase `auth` tables | Identify the student | Yes. Cannot be avoided with Supabase Auth, but we ask for the minimum Microsoft details |
| Random user ID | Supabase | `user_progress` | Link the progress row to the account | Yes |
| Progress record (items learned, last-answer right/wrong, points, rank, last-used time) | The student's answers | `user_progress`, one row per user | Continue across devices | Yes |
| Sign-in logs: IP address, time, device/browser | Supabase Auth | Supabase logs | Security | **VERIFY** what Supabase keeps and for how long |
| Nothing else | | | | No analytics, adverts, cookies, free text, names in content |

No special-category data. No marks or grades. Quiz answers are not attached to any teacher assessment.

## 4. Roles
Proposed: **School = controller; project owner = processor; Supabase = sub-processor; Microsoft = the school's own existing provider.** If the project is ever used for the owner's own purposes (for example offering it to other schools, or analysing pupil data for product work), the owner becomes a controller too, and the ICO Children's Code applies. **Decision needed from the school:** whether it is content the school owns, and whether other schools may ever use it.

## 5. Legal basis (school to confirm)
Public task (UK GDPR Art 6(1)(e)): supporting pupils' learning. Not consent, because a pupil cannot freely refuse a school tool. Because students are under 16 the school's usual rules for online services apply.

## 6. Security measures in place (checked 19 Oct 2026, see `privacy-report.md`)
- Row-level security on `user_progress`: a user can read, create, update and delete only their own row. Table was empty on 19 Oct.
- Only the public (publishable) database key is in the code. The secret key is not in the repo or its history.
- No third-party scripts, fonts, analytics or cookies. Fonts hosted on the site.
- Hosting: GitHub (public repository: code and quiz content only, no student data). Two-step login is switched on for GitHub and Supabase. [Confirm.]
- Copyrighted set texts are kept out of the repository.

## 7. Risks and what reduces them
| Risk | Level | Mitigation |
|---|---|---|
| Student data held outside the school's control | Medium | Written processor agreement; only school Microsoft accounts allowed to sign in |
| Supabase is a US company | Medium | Data held in London; **VERIFY** Supabase's DPA and UK transfer mechanism (UK Addendum / IDTA) for support access and sub-processors |
| Progress record is a free-form blob, so a name could be put in later | Low | Code only writes answer data; add a database check that rejects unexpected fields |
| Single person runs the system | Medium | Name a deputy; keep the access list in section 9 |
| Free Supabase plan: limited support and backups, project pauses if unused | Low-Medium | Decide whether paid plan is needed before students rely on it. Progress is also kept on the device |
| Test accounts left in the database | Low | Delete before real use (owner action) |
| Student attempts to enter personal data into the site | Low | The site has no free-text fields except answers that are checked and not stored |

**DPIA:** a full DPIA is probably not needed if the school is controller and the data is the minimal set above, but the school's DPO should decide and record the reason. If the owner uses data for its own purposes, a DPIA is required.

## 8. Retention, deletion, breach
- **Retention (proposed):** delete the account and progress when the student leaves, or after [12 months] without use. Run a yearly clear-out each [July].
- **Deletion on request:** the owner deletes the user in Supabase (Authentication, Users); the row in `user_progress` is removed with it [VERIFY the table is set to delete with the user; if not, add this]. Target: within [5 working days]. The student's device copy can be cleared with "Reset my progress".
- **Breach plan:** (1) stop the leak (disable sign-in, rotate keys); (2) tell the school DPO the same day; (3) the DPO decides on telling the ICO (within 72 hours if risk to individuals) and the students/parents; (4) write down what happened and what was changed.
- **Subject access:** the owner exports the person's row and sends it to the DPO.

## 9. Access
Who can reach the live data: [owner]. [Deputy]. Supabase staff only under their DPA. List and review each term.

## 10. Questions for the school's DPO
1. Is the school the controller, and will it sign a processor agreement with the project owner? Does the school have a template?
2. Will the school's IT allow Microsoft sign-in for an outside app (Entra "enterprise application" consent)? Which details may it receive (email and name only)?
3. Does the school accept Supabase (London data, US company) as a sub-processor? What transfer checks does it want?
4. Is a DPIA required? Who completes it?
5. What retention period and deletion process does the school require?
6. Who at the school is the named contact for requests and breaches?
7. Does the school want this notice also given to parents? Any consent or opt-out needed?
8. Who owns the content (school lesson materials, crest), and may the owner ever offer it elsewhere?
9. Should a teacher view of class progress be built? (Would add a purpose and a new access route.)

## 11. Things the owner must do (not the DPO)
- [ ] Delete the two test accounts before real use
- [ ] Add a database rule rejecting unexpected data in the progress record
- [ ] Confirm what Supabase logs and for how long; check its DPA and transfers
- [ ] Make sure "Reset my progress" also deletes the saved online copy when signed in
- [ ] Add a link to the privacy notice on the sign-in screen and home footer
- [ ] Decide on a paid plan if students will rely on it
