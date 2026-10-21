# Brainstorm: model paragraph areas (21 Oct)

Nothing here is decided. No teacher paragraph text is in this file (the source files are private and live on the Chromebook, not in this cloud copy).

## What a "model paragraph" could do for a student
A model paragraph is one good answer to look at. The learning comes from *noticing* what makes it good, then using the same moves. Each option below does that in a different way.

## Options (small to big)

1. **"See a model" button on a quote's answer screen (smallest).**
   After a student answers a quote question, a button shows the teacher's model paragraph that uses that quote, with the quote highlighted. Only quotes that have a model get the button.
   - Needs: model text per quote id (a new `models.csv`: quote id, paragraph).
   - Good: tiny, safe, teacher's own writing, no new game rules.
   - Weak: passive reading; students may skip it.

2. **Colour-coded model (point, evidence, technique, effect).**
   The paragraph is shown with its parts colour-labelled (e.g. Point, Quote, Technique, Effect). Tap a label to see what that part is doing.
   - Needs: the teacher marks the parts of each paragraph (one extra column or a simple marker in the text).
   - Good: teaches structure, which is what students most lack. Links to the technique list we already have.
   - Weak: more teacher marking time.

3. **Fill the gaps in a paragraph (cloze).**
   A model paragraph with 5 to 8 words blanked (technique names, effect words, the key vocab). Choose-from-a-bank first, typed later. Reuses the gap and typing engine.
   - Needs: the paragraph plus which words to blank (the teacher's revealed gap-fill passages are already cloze-ready).
   - Good: active; reinforces the key vocab; the typed version fits the points rules (bonus only if typed).
   - Weak: need to choose gaps well; can feel like a worksheet.

4. **Order the paragraph (sentence sort).**
   The model is cut into 4 to 5 sentences; the student drags or taps them into the right order (Point, Evidence, Technique, Effect, Link).
   - Good: teaches paragraph structure directly; easy on phones with tap-to-place.
   - Weak: only works for models with a clear order.

5. **Spot the weak sentence (before and after).**
   Show a weak version and the model side by side, or a paragraph with one weak sentence to swap for a better one from three choices.
   - Good: shows *why* better writing is better.
   - Weak: needs weak versions written (teacher or Claude drafts, teacher checks).

6. **Build your own, scaffolded.**
   The student writes a paragraph in boxes (Point, Quote, Technique, Effect) with sentence starters; at the end the model appears to compare. The student self-checks against a short list. No marking by the app.
   - Good: the real skill; fits the teacher's writing lessons.
   - Weak: biggest build; typing long text on phones is hard; needs privacy thought if anything is saved (keep it on the device only).

## Suggested order
1 then 3 then 2. Option 1 is a quick win that gets teacher paragraphs into the app. Option 3 follows because it reuses the gap engine and keeps students typing. Option 2 adds structure once we know which paragraphs are best. Options 4 to 6 later.

## Decisions needed from the teacher
- Which text first? (Suggest the one with the most paragraphs and the cleanest quotes.)
- Is each paragraph the teacher's own writing, and fine to publish on the site? Nothing goes live without that approval.
- One paragraph per quote, or one per theme or character set?
- Fix first: the Jekyll and Hyde paragraph that says Jekyll where it should say Lanyon.

## Where the work would happen
The paragraph source files (`model-writing-*.md`) are private and git-ignored on the Chromebook. Building from them needs a session on the Chromebook, or the teacher pastes the chosen text paragraphs into a chat. Published data should hold only what the teacher has approved.
