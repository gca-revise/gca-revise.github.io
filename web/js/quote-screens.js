// Screens for the quotes games (Know it level): "Fill the gap", "Who said it?" and "Which poem?".
// A quotes run is a multiple-choice run (kind "choose") with run.subject === "quote".

Object.assign(Screens, {
  // Where a quote comes from, e.g. "Macbeth, Act 5 Scene 1" or "Jekyll and Hyde, Chapter 2".
  quoteSource(q) {
    const name = Data.text(q.text).name;
    if (q.poem) return `${q.poem}${q.poet ? ", " + q.poet : ""}`;
    if (q.act) return `${name}, Act ${q.act}${q.scene ? " Scene " + q.scene : ""}`;
    if (q.chapter && q.chapter !== "Various") return `${name}, ${/^\d+$/.test(q.chapter) ? "Chapter " + q.chapter : q.chapter}`;
    return name;
  },

  // The quote as a question (gaps blank) or as an answer (the missing part in bold).
  quoteHtml(q, run, reveal) {
    if (run.game === "gap" || run.game === "mgap") {
      return QuoteTools.gapPieces(q.quote, q.gap_word).map((p) => {
        if (!p.gap) return esc(p.text);
        return reveal ? `<strong class="gap-filled">${esc(p.text)}</strong>` : `<span class="gap-blank">&nbsp;</span>`;
      }).join("");
    }
    if (run.game === "mfinish") {
      const { prompt, rest } = QuoteTools.splitQuote(q.quote);
      return reveal
        ? `${esc(prompt)} <strong class="gap-filled">${esc(rest)}</strong>`
        : `${esc(prompt)} <span class="gap-blank gap-long">&nbsp;</span>`;
    }
    return esc(q.quote);
  },

  quoteLabel(run) {
    if (run.game === "gap") return "Fill the gap";
    if (run.game === "mgap") return "Type the missing word";
    if (run.game === "mfinish") return "Finish the quote";
    if (run.game === "mtech") return "Which technique does this quote use?";
    return run.textId === "power-conflict" ? "Which poem is this from?" : "Who said it?";
  },

  // The pill under the quote: where it is from (not shown if that would give the answer away).
  quotePill(run, q) {
    const look = TEXT_LOOK[run.textId];
    const text = run.game === "who" && run.textId === "power-conflict" ? Data.text(run.textId).name : Screens.quoteSource(q);
    return `<div class="text-pill"><span class="dot"></span>${esc(text)}</div>`;
  },

  quoteQuestion(run) {
    const s = run.session;
    const look = TEXT_LOOK[run.textId];
    const item = s.current;
    const have = s.choiceCounts[item.id] || 0;
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
              <span class="mc-hint">${learn ? "Get it right twice to learn it" : "Revising everything"}</span>
            </div>
            <section class="q-card">
              <div class="q-label">${Screens.quoteLabel(run)}</div>
              <div class="q-quote">“${Screens.quoteHtml(item.quote, run, false)}”</div>
              ${Screens.quotePill(run, item.quote)}
            </section>
            <div class="choices" role="group" aria-label="Choose the answer">${buttons}</div>
            <p class="hint kbd-hint">Tip for laptops: press 1, 2, 3 or 4 on the keyboard.</p>
          </div>
          ${Screens.choiceSide(run, have)}
        </main>
      </div>`;
  },

  quoteFeedback(run) {
    const s = run.session;
    const r = run.last;
    const item = s.current;
    const q = item.quote;
    const right = r.correct;
    const learn = s.mode === "learn";
    const finished = s.isComplete();
    const have = s.choiceCounts[item.id] || 0;
    const needed = Session.CHOICES_TO_LEARN;
    const rows = s.options.map((o, i) => {
      const letter = `<span class="letter">${i + 1}</span>`;
      if (o.id === item.answerId) {
        return `<div class="choice is-right"><span class="letter ok">${checkIconSmall}</span><span class="choice-text">${esc(o.word)}</span>${right ? "" : `<span class="choice-tag">Right answer</span>`}</div>`;
      }
      if (o.id === r.chosenId) {
        return `<div class="choice is-wrong"><span class="letter bad">${crossIconSmall}</span><span class="choice-text">${esc(o.word)}</span><span class="choice-tag">Your answer</span></div>`;
      }
      return `<div class="choice is-dim">${letter}<span class="choice-text">${esc(o.word)}</span></div>`;
    }).join("");
    const speaker = run.textId === "power-conflict" ? "" : (q.speaker ? `${esc(q.speaker)}, ` : "");
    const source = `${speaker}${esc(Screens.quoteSource(q))}`
      + (run.game === "mtech" && (q.technique_matches || []).length ? `<br>Techniques labelled: ${esc(q.technique_matches.map((n) => QuoteTools.techniqueLabel(Data.techniques.find((t) => t.name === n) || { name: n })).join(", "))}` : "");
    const note = run.sentence
      ? `<p class="fb-sentence"><span class="fb-sentence-label">About this quote</span><span class="fb-sentence-body">${esc(run.sentence)}</span></p>`
      : "";
    let message;
    if (right && learn) {
      message = r.retiredNow
        ? `This quote is ${run.level === "master" ? "mastered" : "learned"}. You won't see it again in this set.`
        : `${needed - have === 1 ? "One more right answer" : `${needed - have} more right answers`} and you know this quote.`;
    } else if (right) {
      message = "Nice one. Revise everything keeps going until you stop.";
    } else {
      message = learn ? "This quote will come back later. No points this time." : "No points this time.";
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
            <div class="fb-quote">
              <p class="q-quote">“${Screens.quoteHtml(q, run, true)}”</p>
              <p class="fb-source">${source}</p>
            </div>
            <div class="choices">${rows}</div>
            ${note}
            ${chips}
            <p class="fb-note mc-note">${message}</p>
            <div class="mc-actions">
              <button type="button" class="fb-btn" data-action="next">${finished ? "See your results" : "Next quote"}</button>
              <a class="fb-link" href="${Screens.backHref(run)}">Stop for now</a>
            </div>
          </div>
          ${Screens.choiceSide(run, have)}
        </main>
      </div>`;
  },
});

Object.assign(Screens, {
  // Master it, typed: "Type the missing word" and "Finish the quote".
  quoteTypedQuestion(run) {
    const s = run.session;
    const look = TEXT_LOOK[run.textId];
    const item = s.current;
    const total = s.items.length;
    const finish = run.game === "mfinish";
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
              <div class="q-label">${Screens.quoteLabel(run)}</div>
              <div class="q-quote">“${Screens.quoteHtml(item.quote, run, false)}”</div>
              ${Screens.quotePill(run, item.quote)}
            </section>
            <form id="answer-form" class="answer" autocomplete="off">
              <label for="answer">${finish ? "Type the rest of the quote" : "Type the missing word"}</label>
              <div class="answer-row">
                <input id="answer" name="answer" type="text" placeholder="Your answer"
                  autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
                <button type="submit" class="check-btn">Check</button>
              </div>
              <p class="hint">${finish ? "Capital letters and punctuation don't matter. A word or two out is fine." : "Capital letters don't matter. Spelling does."}</p>
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

  quoteTypedFeedback(run) {
    const s = run.session;
    const r = run.last;
    const item = s.current;
    const q = item.quote;
    const right = r.correct;
    const near = !right && r.near;
    const learn = s.mode === "learn";
    const finished = s.isComplete();
    const finish = run.game === "mfinish";
    const speaker = run.textId === "power-conflict" ? "" : (q.speaker ? `${esc(q.speaker)}, ` : "");
    const note = run.sentence
      ? `<p class="fb-sentence"><span class="fb-sentence-label">About this quote</span><span class="fb-sentence-body">${esc(run.sentence)}</span></p>`
      : "";
    let message;
    if (right) {
      message = learn ? "This quote is mastered. You won't see it again in this set." : "Nice one. Revise everything keeps going until you stop.";
    } else if (near) {
      message = finish ? "So close. A few words are off. " : "So close. Check the spelling. ";
      message += learn ? "No points this time, and this quote will come back later." : "No points this time.";
    } else {
      message = learn ? "This quote will come back later. No points this time." : "No points this time.";
    }
    const chips = right
      ? `<div class="chips"><span class="chip">+1 point</span><span class="chip">Streak ${s.streak}</span></div>`
      : "";
    return `
      <div class="run ${right ? "right" : near ? "near" : "wrong"}">
        ${Screens.runBar(run, false)}
        <main class="fb">
          <div class="fb-icon">${right ? checkIcon : crossIcon}</div>
          <h1>${right ? "Correct!" : near ? "Almost!" : "Not quite"}</h1>
          ${right ? "" : `<p class="fb-def">You wrote: <del>${esc(r.typed)}</del></p>`}
          <div class="fb-quote fb-quote-wide">
            <p class="q-quote">“${Screens.quoteHtml(q, run, true)}”</p>
            <p class="fb-source">${speaker}${esc(Screens.quoteSource(q))}</p>
          </div>
          ${note}
          ${chips}
          <p class="fb-note">${message}</p>
          <button type="button" class="fb-btn" data-action="next">${finished ? "See your results" : "Next quote"}</button>
          <a class="fb-link" href="${Screens.backHref(run)}">Stop for now</a>
        </main>
      </div>`;
  },
});

// Hand quote runs to the quote screens; everything else is unchanged.
(function () {
  const otherScreens = Screens.run;
  Screens.run = (run) => {
    if (run.subject === "quote" && run.phase !== "complete") {
      if (run.kind === "type") return run.phase === "question" ? Screens.quoteTypedQuestion(run) : Screens.quoteTypedFeedback(run);
      return run.phase === "question" ? Screens.quoteQuestion(run) : Screens.quoteFeedback(run);
    }
    return otherScreens(run);
  };
})();
