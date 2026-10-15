# GCA Revise

A free revision website for GCSE English Literature students: key vocabulary, quotes and literary
techniques for *Macbeth*, *An Inspector Calls*, *Jekyll and Hyde*, *Frankenstein* and the *Power and
Conflict* poetry. It works on phones and Chromebooks and needs no account.

**Privacy:** there are no logins and nothing is sent anywhere. A student's progress is saved only in
their own browser, on their own device, and can be cleared with "Reset my progress" on the home
screen. No student data is kept in this project.

## What is in here
- `web/` is the website itself (plain HTML, CSS and JavaScript, nothing to install).
- The `.csv` files in the top folder are the content: `vocab.csv`, `quotes.csv`, `sentences.csv`,
  `techniques.csv`, `poems.csv`, `symbols.csv`, `characters.csv` and `tags.csv`.
- `build_data.py` turns the `.csv` files into the data files in `web/data/` and reports any problems.
  Run `python3 build_data.py` after changing a `.csv` file.
- `source/` holds public reference texts used to check quotes (see `source/README.md`).
- `handoff.md` and the `plan*.md` files are working notes.

## Running it on your own computer
```
python3 build_data.py        # only needed after changing a .csv file
cd web
python3 -m http.server 8765
```
Then open http://localhost:8765. The page http://localhost:8765/tests.html checks the game rules and
should say that all checks passed.

## Credits
- *Macbeth* reference text: Folger Shakespeare Library (https://shakespeare.folger.edu/), used to
  check quotes and scene numbers.
- *Jekyll and Hyde* and *Frankenstein* reference texts: Project Gutenberg (public domain).
- Short quotations from *An Inspector Calls* and the poems are used for teaching and revision.
- Fonts: Bricolage Grotesque and Figtree (Google Fonts, open licence).
- The vocabulary, quote notes and technique list come from the teacher's own lesson materials.
