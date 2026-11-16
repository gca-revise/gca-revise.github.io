// Screens for sets (lessons by character or theme): the list on a text's page, a set's overview,
// and the "Step done" / "Set complete" screens between steps.
// A set is a lesson of up to four steps: Choose it, Match it, Type the gap, Finish the quote.

// Help text for each section of a lesson (by section id).
const STEP_HELP = {
  choose: "Pick the right answer for each quote and key vocab word, then match each key word to its meaning.",
  qmatch: "Match each quote to who said it, where it is from, or what it shows.",
  type: "Type the missing word in each quote.",
  typeit: "Finish each quote from memory, then type each key vocab word from its meaning.",
  model: "Read a model paragraph and type the missing words. Get every gap right to finish.",
};

Object.assign(Screens, {
  // Where a student is in a set: steps done, which step is next.
  setStatus(set) {
    const progress = Data.lessonProgress(set, Store.retiredIds(), Store.lessonFlags());
    const nextIndex = progress.steps.findIndex((s) => !s.done);
    return { ...progress, nextIndex, next: nextIndex >= 0 ? progress.steps[nextIndex] : null };
  },

  setCard(set) {
    const status = Screens.setStatus(set);
    const pct = status.total ? Math.round((status.done / status.total) * 100) : 0;
    const label = status.complete ? "Complete" : status.done === 0 ? "Not started" : `Next: step ${status.nextIndex + 1}, ${status.next.name}`;
    const counts = [
      set.quotes.length ? plural(set.quotes.length, "quote") : "",
      set.vocab.length ? plural(set.vocab.length, "key word") : "",
    ].filter(Boolean).join(" · ");
    return `
      <a class="set-card${status.complete ? " is-complete" : ""}" href="#/text/${set.text}/set/${set.id}">
        <div class="set-name">${esc(set.name)}</div>
        <div class="set-blurb">${esc(set.blurb)}</div>
        <div class="bar" role="img" aria-label="${status.done} of ${status.total} steps done"><span style="width:${pct}%"></span></div>
        <div class="set-meta"><span>${esc(counts)}</span><span class="set-status">${status.complete ? checkIconSmall.replace('stroke="#FFFFFF"', 'stroke="#17724B"') : ""}${esc(label)}</span></div>
      </a>`;
  },

  // The sets on a text's page, grouped by character and by theme.
  setsSection(textId) {
    const sets = Data.setsFor(textId);
    if (!sets.length) return "";
    const group = (title, kind) => {
      const list = sets.filter((s) => s.kind === kind);
      return list.length ? `<h2 class="label">${title}</h2><div class="set-grid">${list.map(Screens.setCard).join("")}</div>` : "";
    };
    return `
      <p class="sets-intro">Work through a set one step at a time: choose it and match it, match the quotes, type the gap, then type it. Sets with a model paragraph finish with that.</p>
      ${group("Lessons by character", "character")}
      ${group("Lessons by theme", "theme")}`;
  },

  setHead(set) {
    const look = TEXT_LOOK[set.text];
    return `
      <header class="page-head" style="--accent:${look.colour};--tint:${look.tint}">
        <div class="wrap head-inner">
          <div class="head-top">
            <a class="back" href="#/text/${set.text}" aria-label="Back to ${esc(Data.text(set.text).name)}">${backIcon}</a>
            <a class="brand-link" href="#/" aria-label="GCA Revise home">
              <img class="crest-small" src="img/crest.png" alt="School crest">
              <span class="head-brand">GCA Revise</span>
            </a>
          </div>
          <h1>${esc(set.name)}</h1>
          <p class="sub">${esc(set.blurb)}</p>
        </div>
      </header>`;
  },

  // The "do the earlier step first?" screen, or "" if no earlier step is waiting (or this step is not in the set).
  stepNudge(textId, setId, stepKey) {
    const set = Data.setById(setId);
    if (!set || set.text !== textId) return "";
    const part = Data.lessonSteps(set).find((x) => x.key === stepKey);
    if (!part) return "";
    const status = Screens.setStatus(set);
    const waiting = status.steps.findIndex((s, i) => i < part.section && !s.done);
    if (waiting < 0) return "";
    const look = TEXT_LOOK[set.text];
    const base = `#/text/${set.text}/set/${set.id}`;
    const earlier = status.steps[waiting];
    return `
      ${Screens.pageHead("Before you start", set.name, look.colour, look.tint)}
      <main class="wrap" style="--accent:${look.colour};--tint:${look.tint}">
        <div class="card">
          <p>Step ${waiting + 1}, <strong>${esc(earlier.name)}</strong>, is not finished yet. It introduces the key words and quotes that this step asks about, so it works best in order.</p>
          <div class="pills">
            <a class="pill primary big" href="${base}/${earlier.key}">Go to step ${waiting + 1}, ${esc(earlier.name)}</a>
            <a class="pill" href="${base}/${stepKey}/go">Carry on with this step</a>
          </div>
        </div>
      </main>`;
  },

  setOverview(setId) {
    const set = Data.setById(setId);
    const look = TEXT_LOOK[set.text];
    const status = Screens.setStatus(set);
    // Every step can be opened in any order. A finished step opens as a revision pass (nothing saved).
    const base = `#/text/${set.text}/set/${set.id}`;
    const rows = status.steps.map((st, i) => `
      <li class="step-row${st.done ? " is-done" : ""}${i === status.nextIndex ? " is-next" : ""}">
        <a class="step-link" href="${base}/${st.key}${st.done ? "/revise" : ""}">
          <span class="step-num">${st.done ? checkIconSmall : i + 1}</span>
          <span class="step-body">
            <span class="step-name">${esc(st.name)}</span>
            <span class="step-help">${esc(STEP_HELP[st.id])}</span>
          </span>
          <span class="step-count">${st.id === "model" ? (st.done ? "Done" : "To do") : `${st.learned} of ${st.total}`}</span>
        </a>
      </li>`).join("");
    const first = status.steps[0] ? status.steps[0].parts[0] : "choose";
    const action = status.complete
      ? `<a class="pill primary big" href="#/text/${set.text}/set/${set.id}/${first}/revise">Revise this set again</a>
         <p class="set-note">One quick pass through each step. Your progress is not changed.</p>`
      : `<a class="pill primary big" href="#/text/${set.text}/set/${set.id}/${status.next.key}">${status.done === 0 ? "Start" : "Continue"}: step ${status.nextIndex + 1}, ${esc(status.next.name)}</a>`;
    const words = set.vocab.map((id) => Data.vocab.find((w) => w.id === id)).filter(Boolean);
    const quotes = set.quotes.map((id) => Data.quotes.find((q) => q.id === id)).filter(Boolean);
    return `
      ${Screens.setHead(set)}
      <main class="wrap" style="--accent:${look.colour};--tint:${look.tint}">
        <section class="card">
          <div class="card-top"><h2>Your lesson</h2><span class="count">${status.done} of ${status.total} steps done</span></div>
          <ol class="steps">${rows}</ol>
          <p class="set-note">You can open any step, but the bonus points come only when every step is done. Doing them in order works best.</p>
          ${action}
        </section>
        ${Screens.setWrongCard(set)}
        <section class="card">
          <details class="set-contents">
            <summary>What is in this set</summary>
            ${Screens.setItems(words, quotes)}
          </details>
        </section>
      </main>`;
  },

  // The quotes (with who said them and where) and the key vocab (tap a word for its meaning).
  setItems(words, quotes) {
    const quoteRows = quotes.map((q) => {
      // Everything in a set is from the same text, so the text's name is left out.
      const place = q.poem ? `${q.poem}${q.poet ? ", " + q.poet : ""}`
        : q.act ? `Act ${q.act}${q.scene ? " Scene " + q.scene : ""}`
        : q.chapter && q.chapter !== "Various" ? (/^\d+$/.test(q.chapter) ? "Chapter " + q.chapter : q.chapter)
        : "";
      const who = q.text === "power-conflict" ? "" : q.speaker;
      const source = [who, place].filter(Boolean).join(", ");
      return `<li class="set-quote"><span class="set-quote-text">“${esc(q.quote)}”</span>${source ? `<span class="set-quote-src">${esc(source)}</span>` : ""}</li>`;
    }).join("");
    const wordRows = words.map((w) =>
      `<details class="set-word-item"><summary>${esc(w.word)}</summary><p>${esc(w.definition)}</p></details>`).join("");
    return `
      ${wordRows ? `<p class="revisit-title">Key vocab <span class="set-tip">(tap a word to see its meaning)</span></p><div class="set-word-list">${wordRows}</div>` : ""}
      ${quoteRows ? `<p class="revisit-title">Quotes</p><ul class="set-quotes">${quoteRows}</ul>` : ""}`;
  },

  // What was got wrong the last time each step of the lesson was finished.
  setWrongCard(set) {
    const saved = Store.lessonWrong(set.id);
    if (!saved) return "";
    const ids = new Set();
    for (const list of Object.values(saved)) {
      for (const id of list) ids.add(id.replace(/^(mg|mf|tv|qm):/, ""));
    }
    const quotes = set.quotes.filter((id) => ids.has(id)).map((id) => Data.quotes.find((q) => q.id === id)).filter(Boolean);
    const words = set.vocab.filter((id) => ids.has(id)).map((id) => Data.vocab.find((w) => w.id === id)).filter(Boolean);
    const count = quotes.length + words.length;
    return `
      <section class="card">
        <div class="card-top"><h2>Got wrong last time</h2><span class="count">${count ? `${count} to look at` : "none"}</span></div>
        ${count
          ? `<p class="level-hint">What you missed the last time you finished a step in this lesson.</p>${Screens.setItems(words, quotes)}`
          : `<p class="level-hint">Nothing missed the last time. Brilliant.</p>`}
      </section>`;
  },

  // The things got wrong, as a hidden box that the Wrong tile (or the button) opens.
  // `ids` are item ids; `items` (optional) are the game's own items, used for anything that is not a quote
  // or key word (e.g. techniques).
  missedBox(ids, items = []) {
    const unique = Array.from(new Set(ids));
    const quotes = [], words = [], others = [];
    for (const id of unique) {
      const entry = Data.entryFor(id);
      if (entry && entry.quote) quotes.push(entry.quote);
      else if (entry && entry.word) words.push(entry.word);
      else {
        const item = items.find((i) => i.id === id);
        if (item && item.word) others.push(item);
      }
    }
    const extra = others.length
      ? `<p class="revisit-title">Also</p><div class="set-word-list">${others.map((o) => `<details class="set-word-item"><summary>${esc(o.word)}</summary><p>${esc(o.definition || "")}</p></details>`).join("")}</div>`
      : "";
    const count = quotes.length + words.length + others.length;
    return {
      count,
      html: `<section class="wrong-box" id="wrong-box" hidden><p class="wrong-title">What you got wrong (${count})</p>${Screens.setItems(words, quotes)}${extra}</section>`,
    };
  },

  // Between steps: "Step done!" with a button to the next step, or "Set complete!" after the last.
  lessonStepDone(run) {
    const s = run.session;
    const lesson = run.lesson;
    const set = Data.setById(lesson.setId);
    const isModel = run.kind === "model";
    const isMatch = run.kind === "match";
    // Steps can be played in any order, so what comes next is the first step still to do. The set is
    // complete when none is left. (Revision just walks on through the steps.)
    let next = lesson.next, nextName = lesson.nextName || "";
    let last = !lesson.next;
    if (!lesson.revise) {
      const pending = Screens.setStatus(set).steps.find((x) => !x.done);
      last = !pending;
      if (pending) { next = pending.key; nextName = pending.name; }
    }
    const c = run.carry || {};
    const played = isMatch ? s.rounds > 0 : s.right + s.wrong > 0;
    const wrongIds = (c.missed || []).concat(isMatch ? Array.from(run.wrongIds) : Object.keys(s.missed));
    const missed = played ? Screens.missedBox(wrongIds, s.items) : { count: 0, html: "" };
    // Finishing every step of a set (typed steps included) pays a one-off bonus.
    if (last && !lesson.revise && !run.bonusChecked) {
      run.bonusChecked = true;
      if (Screens.setStatus(set).complete) {
        // Both bonuses are paid once the whole set is done: the set bonus, and the model paragraph's.
        run.bonus = Points.setBonus(set.id);
        if (Data.modelForSet(set.id)) run.bonus += Points.modelBonus(set.id);
      }
    }
    const bonus = run.bonus || 0;
    const tile = (num, label, colour, tappable) =>
      tappable && missed.count
        ? `<button type="button" class="tile tile-tap" data-toggle-wrong aria-label="Show what you got wrong"><div class="tile-num" style="color:${colour}">${num}</div><div class="tile-label">${label} <span class="tile-more">tap to see</span></div></button>`
        : `<div class="tile"><div class="tile-num"${colour ? ` style="color:${colour}"` : ""}>${num}</div><div class="tile-label">${label}</div></div>`;
    const tiles = !played ? "" : !isMatch
      ? `${tile(s.points + (c.earned || 0) + bonus, "Points")}${tile(Math.max(s.bestStreak, c.bestStreak || 0), "Best streak")}${tile(s.right + (c.right || 0), "Right", "#17724B")}${tile(s.wrong + (c.wrong || 0), "Wrong along the way", "#B42A47", true)}`
      : `${tile(s.points + (c.earned || 0) + bonus, "Points")}${tile(Math.max(s.bestStreak, c.bestStreak || 0), "Best streak")}${tile(s.perfectRounds, "Perfect rounds", "#17724B")}${tile(s.rounds, "Rounds")}`;
    const base = `#/text/${run.textId}/set/${lesson.setId}`;
    const tail = lesson.revise ? "/revise" : "";
    // Celebrate once per run (the screen can be drawn more than once).
    if (!lesson.revise && !run.celebrated && (last || isModel)) {
      run.celebrated = true;
      if (last) Celebrate.display(run.bonus ? `Set complete! <span class="celebrate-num">+${run.bonus} points</span>` : "Set complete!", 50);
      else Celebrate.modelComplete();
    }
    const heading = last ? (lesson.revise ? "Revision finished!" : "Set complete!") : `Step ${lesson.section + 1} done!`;
    const message = last
      ? (lesson.revise
        ? `That was one more pass through ${esc(set.name)}.`
        : `You've finished every step of ${esc(set.name)}. Well done.${bonus ? ` Bonus: +${bonus} points for completing the set!` : ""}`)
      : (isModel
        ? `You completed the paragraph. Next up: ${esc(nextName)}.`
        : played
        ? `${esc(lesson.name)} is finished. Next up: ${esc(nextName)}.`
        : `You already know all of these, so there was nothing to ask. Next up: ${esc(nextName)}.`);
    const buttons = last
      ? `<a class="done-main-btn" href="${base}/choose/revise">Revise this set again</a>
         <a class="done-outline" href="#/text/${run.textId}">Back to ${esc(Data.text(run.textId).name)}</a>
         <a class="done-plain" href="${base}">See the set</a>`
      : `<a class="done-main-btn" href="${base}/${next}${tail}">Next: ${esc(nextName)}</a>
         <a class="done-outline" href="${base}">Back to the set</a>
         <a class="done-plain" href="#/text/${run.textId}">Back to ${esc(Data.text(run.textId).name)}</a>`;
    return `
      <div class="run done">
        <main class="done-main">
          <div class="done-head">
            <a href="#/" aria-label="GCA Revise home"><img src="img/crest.png" alt="School crest" class="done-crest"></a>
            <div>
              <h1>${heading}</h1>
              <p>${message}</p>
            </div>
          </div>
          ${isModel && !last && !lesson.revise && !Points.modelBonusPaid(set.id)
            ? `<p class="bonus-sign">+${Points.MODEL_BONUS} points waiting! Finish the other steps to win them.</p>` : ""}
          ${isModel && last && run.bonus ? `<p class="bonus-sign">+${run.bonus} points for finishing the set!</p>` : ""}
          ${tiles ? `<div class="done-grid"><div class="tiles">${tiles}</div></div>` : ""}
          ${missed.count ? `<button type="button" class="wrong-toggle" data-toggle-wrong>See what you got wrong (${missed.count})</button>${missed.html}` : ""}
          ${lesson.revise ? "" : `<p class="points-line">Points this week: <b>${Points.weekly()}</b> · Lifetime: <b>${Points.lifetime()}</b></p>`}
          <div class="done-btns">${buttons}</div>
        </main>
      </div>`;
  },
});

// Hand lesson runs to the lesson screens where needed; everything else is unchanged.
(function () {
  const otherScreens = Screens.run;
  Screens.run = (run) => {
    if (!run.lesson) return otherScreens(run);
    if (run.phase === "complete") return Screens.lessonStepDone(run);
    if (run.kind === "model") return Screens.modelGaps(run.textId, run.model.id, run.lesson);
    // Choose it mixes quotes and key vocab: draw each question with the right kind of screen.
    if (run.lesson.key === "choose" && run.session.current) {
      const isQuote = !!run.session.current.quote;
      return otherScreens({ ...run, subject: isQuote ? "quote" : undefined, game: isQuote ? (run.session.current.variant === "who" ? "who" : "gap") : undefined });
    }
    return otherScreens(run);
  };
})();
