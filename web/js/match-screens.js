// Screens for the matching game: the board, and "All matched!" / "Round complete".
// run = {textId, kind: "match", session: a MatchGame, phase: "question" or "done"}

Object.assign(Screens, {
  // One tappable cell: a word (left) or a meaning (right).
  matchCell(game, side, w) {
    const done = game.matched.has(w.id);
    const selected = game.pending && game.pending.side === side && game.pending.id === w.id;
    const slipped = game.slip && (side === "w" ? game.slip.wordId === w.id : game.slip.meaningId === w.id);
    const classes = ["m-cell", side === "w" ? "m-word" : "m-meaning", done ? "done" : "", selected ? "sel" : "", slipped ? "slip" : ""].join(" ");
    const text = side === "w" ? w.word : (done ? w.definition : Engine.blankWord(w.definition, w.word));
    const tick = done ? checkIconSmall.replace('stroke="#FFFFFF"', 'stroke="#155E3E"') : "";
    return `<button type="button" class="${classes}" data-m="${side}:${esc(w.id)}" ${done ? "disabled" : ""} aria-pressed="${selected ? "true" : "false"}">${tick}<span>${esc(text)}</span></button>`;
  },

  matching(run) {
    const g = run.session;
    const look = TEXT_LOOK[run.textId];
    let status;
    if (g.slip) {
      status = "That is not a match. This round will not score, but keep going.";
    } else if (g.pending) {
      const found = g.words.find((w) => w.id === g.pending.id);
      status = g.pending.side === "w"
        ? `“${found.word}” is selected. Now pick its meaning.`
        : "A meaning is selected. Now pick its word.";
    } else {
      status = g.slips ? "Keep going. This round will not score." : "Pick a word, then its meaning.";
    }
    const rows = g.left.map((w, i) => Screens.matchCell(g, "w", w) + Screens.matchCell(g, "m", g.right[i])).join("");
    return `
      <div class="run q match" style="--accent:${look.colour};--tint:${look.tint}">
        ${Screens.runBar(run, true)}
        <main class="run-main">
          <div class="run-left">
            <div class="m-head">
              <h1>Match each ${Screens.noun(run)} to its meaning</h1>
              <p>Pick a ${Screens.noun(run)}, then its meaning. No mistakes earns the point. ${g.matched.size} of ${g.words.length} matched.</p>
            </div>
            <div class="m-grid">${rows}</div>
            <div class="m-status${g.slip ? " m-status-slip" : ""}" role="status"><span class="dot-sm" style="background:${g.slip ? "#B42A47" : "var(--navy)"}"></span>${esc(status)}</div>
          </div>
          <aside class="run-side">
            <div class="side-two">
              <div class="side-card"><div class="side-label">Streak</div><div class="side-num">${g.streak}</div></div>
              <div class="side-card"><div class="side-label">Points</div><div class="side-num">${g.points}</div></div>
            </div>
          </aside>
        </main>
      </div>`;
  },

  matchDone(run) {
    const g = run.session;
    const perfect = g.slips === 0;
    const rows = g.left.map((w) =>
      `<div class="md-row"><span class="md-word">${esc(w.word)}</span><span class="md-def">${esc(w.definition)}</span></div>`).join("");
    const slipText = g.slips === 1 ? "1 slip" : `${g.slips} slips`;
    return `
      <div class="run ${perfect ? "right" : "near"} match-done">
        <main class="md-main">
          <div class="fb-icon">${perfect ? checkIcon : `<span class="md-flag">!</span>`}</div>
          <h1>${perfect ? "All matched!" : "Round complete"}</h1>
          <p class="md-sub">${perfect
            ? `All ${g.words.length} pairs, no slips. One point for the whole round.`
            : `All ${g.words.length} pairs found, but with ${slipText}. No point this round.`}</p>
          <div class="md-list">${rows}
            <p class="md-note">No mistakes earns the point. Any slip and the round scores nothing.</p>
          </div>
          <div class="chips">${perfect
            ? `<span class="chip">+1 point</span><span class="chip">Streak ${g.streak}</span>`
            : `<span class="chip">No point this round</span><span class="chip">Streak 0</span>`}</div>
          <div class="md-btns">
            <button type="button" class="fb-btn md-next" data-action="round">Next round</button>
            <a class="md-back" href="${Screens.backHref(run)}">Back to ${esc(Data.text(run.textId).name)}</a>
          </div>
        </main>
      </div>`;
  },

  matchRun(run) {
    return run.phase === "done" ? Screens.matchDone(run) : Screens.matching(run);
  },
});

// Hand matching runs to the matching screens; everything else is unchanged.
(function () {
  const gameScreens = Screens.run;
  Screens.run = (run) => (run.kind === "match" ? Screens.matchRun(run) : gameScreens(run));
})();
