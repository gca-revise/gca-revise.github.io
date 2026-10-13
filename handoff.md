# Handoff: Vocab quiz

## Status
Folder, git repo and private GitHub repo are set up. No code and no `plan.md` yet. The next step is to finish planning the quiz with the user and get their confirmation before writing anything.

## Quiz plan (Version 1, agreed so far)
- Endless terminal quiz: runs until the player types `q`. Never ends on its own.
- Shows a definition; the player types the word.
- Capitals and extra spaces are ignored; spelling must be correct.
- Correct answer = 1 point. Wrong answer shows the right word and earns nothing.
- Score shows after each answer. On quit, show a summary: points, right/wrong counts, best streak.
- Files: `vocab.csv` (columns: word, definition; ~10 sample words), `quiz.py` (a simple `VocabQuiz` class). The quiz reads only from `vocab.csv`, so real vocab can be swapped in later.
- Version 2 ideas: streak bonuses, retrying missed words, quiz by unit.
- Real vocab: the user will upload lesson slides to Claude in chat and ask for a CSV. No extraction script.

## Still open (ask the user)
1. Repeats: suggested that a word can't appear twice in a row and every word is used before any repeats.
2. Points: suggested 1 point per correct answer; streak bonuses left for Version 2.

## Next step
Confirm the two open choices, write `plan.md` for the quiz, get the user's OK, then build Version 1 (plan first, no code until confirmed).

## Separate from this project
The user also has a learning plan (Linux terminal basics, object-oriented Python on Codecademy, later CLAUDE.md practice, handoffs, subagents, skills, MCP). Turn it into a plan file only after the user confirms it.
