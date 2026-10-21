# Project instructions

## About the user
- English teacher, complete beginner at coding. They don't need to learn to write code; they need to understand how it works so they can direct Claude and spot when something is wrong.
- Chromebook (Linux "penguin"), VS Code + Claude Code.
- Explain in plain English with analogies. Keep jargon to a minimum and define any new term the first time it is used.

## Plan and brainstorming files
- Always create plan files and brainstorming files inside this project folder (`/home/awhrathmell/vocab-quiz`), never in a scratchpad, `/tmp`, or `~/.claude`.

## Working rules
- Only read the files you need; don't browse the computer (token cost).
- Keep context use low. Suggest a handoff when the session is getting long.
- Commit after each working step with a sensible message, and tell the user what you did.
- Push to GitHub after every commit, and tell the user it was pushed.
- At the end of a session, update `handoff.md` with what was done and the next step.
- No student data in any file.
- Two projects (from the 21 Oct switch, see `handoff.md`): this working project is private; the website is published from a separate public project with `python3 publish_public.py <clone of the public project>`. After changing anything under `web/` or any `.csv`, publish with the script (pushing here does not update the live site). Never copy notes, paperwork, `.csv` source files or reports into the public project.
