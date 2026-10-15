// Screens for the typed-answer game: question, right, wrong, and Set complete.
// `run` is the current game: {textId, session, phase, last, sentence}.
// phase is "question", "right", "wrong" or "complete".

const checkIcon = `<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const crossIcon = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const checkIconSmall = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const crossIconSmall = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const flameIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#B8790A" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/></svg>`;

Object.assign(Screens, {
  // Where the back arrow and "Stop for now" go.
  backHref(run) {
    return run.textId === "techniques" ? "#/techniques" : `#/text/${run.textId}`;
  },

  // "word" for key vocab, "technique" on the Techniques screens.
  noun(run) {
    return run.textId === "techniques" ? "technique" : "word";
  },

  // Top strip with the title and how many words are learned.
  runBar(run, withBack) {
    const t = Data.text(run.textId);
    const s = run.session;
    const total = s.items.length;
    const learned = s.learnedCount();
    const pct = total ? Math.round((learned / total) * 100) : 0;
    const title = `${t.name}${run.textId === "techniques" ? "" : " · Key vocab"}${s.mode === "free" ? " (free practice)" : ""}`;
    const back = withBack
      ? `<a class="back-sq" href="${Screens.backHref(run)}" aria-label="Back to ${esc(t.name)}">${backIcon}</a>`
      : "";
    return `
      <div class="run-bar"><div class="run-bar-inner">
        ${back}
        <div class="run-title">
          <div class="run-name">${esc(title)}</div>
          <div class="run-track" role="img" aria-label="${learned} of ${total} learned"><span style="width:${pct}%"></span></div>
        </div>
        <div class="run-count">${learned}/${total}</div>
      </div></div>`;
  },

  question(run) {
    const s = run.session;
    const t = Data.text(run.textId);
    const look = TEXT_LOOK[run.textId];
    const w = s.current;
    const total = s.items.length;
    return `
      <div class="run q" style="--accent:${look.colour};--tint:${look.tint}">
        ${Screens.runBar(run, true)}
        <main class="run-main">
          <div class="run-left">
            <div class="chips chips-phone">
              <span class="chip">${flameIcon}Streak ${s.streak}</span>
              <span class="chip">Points ${s.points}</span>
            </div>
            <section class="q-card">
              <div class="q-label">Which ${Screens.noun(run)} means</div>
              <div class="q-text">${esc(Engine.blankWord(w.definition, w.word))}</div>
              <div class="pill-row"><div class="text-pill"><span class="dot"></span>${esc(t.name)}</div>${Screens.tagPill(w, run.textId)}</div>
            </section>
            <form id="answer-form" class="answer" autocomplete="off">
              <label for="answer">Type the ${Screens.noun(run)}</label>
              <div class="answer-row">
                <input id="answer" name="answer" type="text" placeholder="Your answer"
                  autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
                <button type="submit" class="check-btn">Check</button>
              </div>
              <p class="hint">Capital letters don't matter. Spelling does.</p>
            </form>
          </div>
          <aside class="run-side">
            <div class="side-card"><div class="side-label">Learned</div><div class="side-big">${s.learnedCount()} of ${total}</div></div>
            <div class="side-two">
              <div class="side-card"><div class="side-label">Streak</div><div class="side-num">${s.streak}</div></div>
              <div class="side-card"><div class="side-label">Points</div><div class="side-num">${s.points}</div></div>
            </div>
          </aside>
        </main>
      </div>`;
  },

  feedback(run) {
    const s = run.session;
    const r = run.last;
    const w = s.current;
    const right = r.correct;
    const finished = s.isComplete();
    const near = !right && r.near;
    // The key word is shown in bold, in whatever form the sentence uses it.
    const sentenceHtml = run.sentence
      ? Engine.markWord(run.sentence, w.word)
          .map((p) => (p.bold ? `<strong>${esc(p.text)}</strong>` : esc(p.text)))
          .join("")
      : "";
    const sentence = run.sentence
      ? `<p class="fb-sentence"><span class="fb-sentence-label">In context</span><span class="fb-sentence-body">${sentenceHtml}</span></p>`
      : "";
    const chips = right
      ? `<div class="chips"><span class="chip">+1 point</span><span class="chip">Streak ${s.streak}</span></div>`
      : "";
    let note;
    if (right) {
      note = s.mode === "learn"
        ? "This word is learned. You won't see it again in this set."
        : "Nice one. Free practice keeps going until you stop.";
    } else if (near) {
      note = s.mode === "learn"
        ? "So close. No points this time, and this word will come back later."
        : "So close. No points this time.";
    } else {
      note = s.mode === "learn"
        ? "This word will come back later. No points this time."
        : "No points this time.";
    }
    return `
      <div class="run ${right ? "right" : near ? "near" : "wrong"}">
        ${Screens.runBar(run, false)}
        <main class="fb">
          <div class="fb-icon">${right ? checkIcon : crossIcon}</div>
          <h1>${right ? "Correct!" : near ? "Almost!" : "Not quite"}</h1>
          ${right
            ? `<p class="fb-def">${esc(w.definition)}</p><div class="fb-word">${esc(w.word)}</div>`
            : `<p class="fb-def">You wrote: <del>${esc(r.typed)}</del></p>
               <div class="fb-small">${near ? "Check the spelling" : "The word was"}</div>
               <div class="fb-word">${esc(w.word)}</div>
               <p class="fb-def">${esc(w.definition)}</p>`}
          ${sentence}
          ${chips}
          <p class="fb-note">${note}</p>
          <button type="button" class="fb-btn" data-action="next">${finished ? "See your results" : "Next word"}</button>
          <a class="fb-link" href="${Screens.backHref(run)}">Stop for now</a>
        </main>
      </div>`;
  },

  complete(run) {
    const s = run.session;
    const t = Data.text(run.textId);
    const total = s.items.length;
    const played = s.right + s.wrong > 0;
    const tile = (num, label, colour) =>
      `<div class="tile"><div class="tile-num"${colour ? ` style="color:${colour}"` : ""}>${num}</div><div class="tile-label">${label}</div></div>`;
    const tricky = s.trickiest(3);
    const trickyRows = tricky.length
      ? tricky.map((x) => `<div class="tricky-row"><span>${esc(x.word)}</span><span>missed ${x.times} time${x.times === 1 ? "" : "s"}</span></div>`).join("")
      : `<div class="tricky-none">No mistakes this time. Brilliant.</div>`;
    return `
      <div class="run done">
        <main class="done-main">
          <div class="done-head">
            <img src="img/crest.png" alt="School crest" class="done-crest">
            <div>
              <h1>Set complete!</h1>
              <p>${run.textId === "techniques" ? `You've learned all ${total} techniques.` : `You've learned all ${total} key vocab words in ${esc(t.name)}.`}</p>
            </div>
          </div>
          ${played ? `
          <div class="done-grid">
            <div class="tiles">
              ${tile(s.points, "Points")}
              ${tile(s.bestStreak, "Best streak")}
              ${tile(s.right, "Right", "#17724B")}
              ${tile(s.wrong, "Wrong along the way", "#B42A47")}
            </div>
            <div class="tricky"><div class="side-label">Your trickiest words</div>${trickyRows}</div>
          </div>` : ""}
          <div class="done-btns">
            <button type="button" class="done-main-btn" data-action="again">${run.textId === "techniques" ? "Practise techniques again" : `Practise ${esc(t.name)} vocab again`}</button>
            <a class="done-outline" href="${Screens.backHref(run)}">Back to ${esc(t.name)}</a>
            <a class="done-plain" href="#/">Back to home</a>
          </div>
        </main>
      </div>`;
  },

  // A small label for words that need one, like "Structure · Act 3" (from tags.csv).
  tagPill(word, textId) {
    const found = (word.tags || []).find((t) => t.text === textId);
    return found ? `<div class="text-pill tag-pill">${esc(found.tag)}</div>` : "";
  },

  // Two small dots showing how many right answers a word has (of the two it needs).
  dots(have, needed, filled, empty) {
    let html = "";
    for (let i = 0; i < needed; i++) {
      html += `<span class="dot-sm" style="background:${i < have ? filled : empty}"></span>`;
    }
    return `<span class="dots" aria-hidden="true">${html}</span>`;
  },

  // The "This word needs 2 right answers" card on laptops.
  choiceSide(run, have) {
    const s = run.session;
    const needed = Session.CHOICES_TO_LEARN;
    const learn = s.mode === "learn";
    return `
      <aside class="run-side">
        <div class="side-card">
          <div class="side-label">${learn ? "This word needs" : "Free practice"}</div>
          ${learn
            ? `<div class="side-need">${have} of ${needed} right answers ${Screens.dots(have, needed, "var(--run-fill)", "var(--run-line)")}</div>`
            : `<div class="side-need">No limit, nothing is retired</div>`}
        </div>
        <div class="side-two">
          <div class="side-card"><div class="side-label">Streak</div><div class="side-num">${s.streak}</div></div>
          <div class="side-card"><div class="side-label">Points</div><div class="side-num">${s.points}</div></div>
        </div>
      </aside>`;
  },

  choiceQuestion(run) {
    const s = run.session;
    const t = Data.text(run.textId);
    const look = TEXT_LOOK[run.textId];
    const w = s.current;
    const have = s.choiceCounts[w.id] || 0;
    const learn = s.mode === "learn";
    const buttons = s.options.map((o, i) => `
      <button type="button" class="choice" data-choice="${esc(o.id)}">
        <span class="letter">${i + 1}</span><span class="choice-text">${esc(o.word)}</span>
      </button>`).join("");
    return `
      <div class="run q mc" style="--accent:${look.colour};--tint:${look.tint}">
        ${Screens.runBar(run, true)}
        <main class="run-main">
          <div class="run-left">
            <div class="mc-row">
              <span class="mc-chip">Choose the answer${learn ? Screens.dots(have, Session.CHOICES_TO_LEARN, "var(--run-fill)", "var(--run-line)") : ""}</span>
              <span class="mc-hint">${learn ? "Get it right twice to learn it" : "Free practice"}</span>
            </div>
            <section class="q-card">
              <div class="q-label">Which ${Screens.noun(run)} means</div>
              <div class="q-text">${esc(Engine.blankWord(w.definition, w.word))}</div>
              <div class="pill-row"><div class="text-pill"><span class="dot"></span>${esc(t.name)}</div>${Screens.tagPill(w, run.textId)}</div>
            </section>
            <div class="choices" role="group" aria-label="Choose the answer">${buttons}</div>
            <p class="hint kbd-hint">Tip for laptops: press 1, 2, 3 or 4 on the keyboard.</p>
          </div>
          ${Screens.choiceSide(run, have)}
        </main>
      </div>`;
  },

  choiceFeedback(run) {
    const s = run.session;
    const r = run.last;
    const w = s.current;
    const right = r.correct;
    const learn = s.mode === "learn";
    const finished = s.isComplete();
    const have = s.choiceCounts[w.id] || 0;
    const needed = Session.CHOICES_TO_LEARN;
    const rows = s.options.map((o, i) => {
      const letter = `<span class="letter">${i + 1}</span>`;
      if (o.id === w.id) {
        return `<div class="choice is-right"><span class="letter ok">${checkIconSmall}</span><span class="choice-text">${esc(o.word)}</span>${right ? "" : `<span class="choice-tag">Right answer</span>`}</div>`;
      }
      if (o.id === r.chosenId) {
        return `<div class="choice is-wrong"><span class="letter bad">${crossIconSmall}</span><span class="choice-text">${esc(o.word)}</span><span class="choice-tag">Your answer</span></div>`;
      }
      return `<div class="choice is-dim">${letter}<span class="choice-text">${esc(o.word)}</span></div>`;
    }).join("");
    const sentenceHtml = run.sentence
      ? Engine.markWord(run.sentence, w.word).map((p) => (p.bold ? `<strong>${esc(p.text)}</strong>` : esc(p.text))).join("")
      : "";
    const sentence = run.sentence
      ? `<p class="fb-sentence"><span class="fb-sentence-label">In context</span><span class="fb-sentence-body">${sentenceHtml}</span></p>`
      : "";
    let note;
    if (right && learn) {
      note = r.retiredNow
        ? "This word is learned. You won't see it again in this set."
        : `${needed - have === 1 ? "One more right answer" : `${needed - have} more right answers`} and “${esc(w.word)}” is learned.`;
    } else if (right) {
      note = "Nice one. Free practice keeps going until you stop.";
    } else {
      note = learn ? "This word will come back later. No points this time." : "No points this time.";
    }
    const chips = right
      ? `<div class="chips"><span class="chip">+1 point</span><span class="chip">Streak ${s.streak}</span></div>`
      : "";
    return `
      <div class="run ${right ? "right" : "wrong"} mc-fb">
        ${Screens.runBar(run, false)}
        <main class="run-main">
          <div class="run-left">
            ${learn ? `<div class="mc-row"><span class="mc-chip">Choose the answer${Screens.dots(have, needed, "var(--run-fill)", "var(--run-line)")}</span><span class="mc-hint">${have} of ${needed} right answers</span></div>` : ""}
            <div class="mc-banner">
              <span class="mc-banner-icon">${right ? checkIconSmall : crossIconSmall}</span>
              <span class="mc-banner-text">${right ? "Correct!" : "Not quite"}</span>
              ${right ? `<span class="mc-banner-side">+1 point · Streak ${s.streak}</span>` : `<span class="mc-banner-side">No points this time</span>`}
            </div>
            <p class="mc-def">${esc(w.definition)}</p>
            <div class="choices">${rows}</div>
            ${sentence}
            ${chips}
            <p class="fb-note mc-note">${note}</p>
            <div class="mc-actions">
              <button type="button" class="fb-btn" data-action="next">${finished ? "See your results" : "Next word"}</button>
              <a class="fb-link" href="${Screens.backHref(run)}">Stop for now</a>
            </div>
          </div>
          ${Screens.choiceSide(run, have)}
        </main>
      </div>`;
  },

  run(run) {
    if (run.phase === "complete") return Screens.complete(run);
    if (run.kind === "choose") {
      return run.phase === "question" ? Screens.choiceQuestion(run) : Screens.choiceFeedback(run);
    }
    if (run.phase === "question") return Screens.question(run);
    return Screens.feedback(run);
  },
});
