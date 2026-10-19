# Ideas (not agreed yet)

Open this only when choosing the next feature. Nothing here is decided. When the user decides, move the line to `handoff.md` (as a next step) or mark it "dropped".

## From the teacher pitch (16 Oct)
- Model paragraphs (teacher-written)
- Cloze activities (fill the gaps in a longer passage)
- Images (character pictures on quotes; check copyright, keep one consistent style)
- Dual coding (words paired with visuals; builds on images)

## Duolingo-style redesign (user, 18 Oct): planned for later, in this order
Idea: instead of separate games (Type it, Match them, Choose it...), students do short self-contained lessons that mix those activities, in a path that gets them through each text.
1. **Smaller sets inside each text** (user's 2a). Students cannot learn a whole text at once, so split into sets by character (Macbeth; Lady Macbeth...) or theme, each able to mix key vocab and quotes. First because everything else needs it, it is mostly data work (teacher decides the sets), and it also answers feedback #1 (theme tags) and #4-style requests. Useful on its own, with no redesign yet.
2. **Mixed lessons** (user's idea 1). One short lesson per set that runs a few activity types in a row (for example match, choose, then type), with a clear finish. Start with one lesson type on one set, test it with teachers, then roll out. Reuses the existing games.
3. **Points across everything** (user's 3). One overall score (and perhaps a daily goal) that grows with lessons finished; builds on the points and streak the games already count. Device-only for now, so no student data. Do it with the lessons, so points mean something.
4. **Learning path** (user's 2b). Lessons laid out in order, with later ones unlocking after earlier ones. After lessons exist, since the order depends on how the sets and lessons turn out. Needs decisions on locking (do students have to finish in order?) and on how it fits the existing "Learn the set / Revise everything" switch.
5. **Leaderboard** (user's 4). Only after sign-in and the school data-protection check, and probably class-based, not school-wide. Check with the school first, since comparing pupils needs safeguards (nicknames only, no names, class opt-in). Last.

Why this order: each step builds on the one before. Steps 1 and 3 can be tested early with teachers; steps 4 and 5 should wait until feedback shows students actually use the lessons.

## Leaderboards and leagues: who competes with whom (user unsure, 19 Oct)
Decide after sign-in and the school's data-protection OK; nothing to build before. Options: (1) class leagues (safest, teacher controls, small groups); (2) year-group leagues (more energy, but bottom of a big table is demoralising and raises safeguarding questions); (3) **both**: class board by default, year-group as a second tab, each student sees the top 10 plus their own position (recommended); (4) Duolingo-style small mixed groups of about 30 by similar weekly points, top few move up (fairest for motivation, least teacher control). Prepare now: store each student's class and year group at sign-in (Microsoft may supply them). Any option is then a different view of the same weekly points. Safeguards for all: nicknames or first name plus initial only; school or teacher can switch leaderboards off per class. To decide: ask 2 or 3 teachers "your class's ranking or the whole year's?", and see after a few weeks of points-only whether students ask to compare.

## Quick wins
- "Which act / chapter?" question for Know it
- Technique analysis: after Spot the technique, show the technique's effect (the booklet has an `effect` for each) as a model answer
- Let students tick the quotes they find hard, then drill only those
- Teacher view of the trickiest items (hard without logins; a "hands-up" version could be shown on the board)

## Medium builds
- Spaced repetition: learned items come back after a few days
- Themes and characters linked across texts, for comparison. **Teacher-requested (feedback #1):** tag each quote by theme (so students know which essay to use it in) as well as by character; needs a `themes` column in `quotes.csv` and a theme list per text agreed with the teacher
- Context quiz (Jacobean, Victorian, 1912 vs 1945 facts from the lessons)
- Unseen poetry (that folder has not been read)

## For the pitch
- Pilot with one class: short quote test before and after two weeks
- 60-second phone demo
- Say "no student data" early

## Avoid for now
- Logins before the learning path is decided (the Duolingo-style plan above puts a leaderboard last, after sign-in)
- New content before the teacher checks are done
