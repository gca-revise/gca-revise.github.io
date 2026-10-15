// Works out which screen to show from the address (the part after #), and draws it.
const app = document.getElementById("app");

// The game currently being played (null when not playing).
let run = null;

function pick(list) {
  return list.length ? list[Math.floor(Math.random() * list.length)] : "";
}

function startRun(textId, kind, setId) {
  const session = new Session({
    items: Data.itemsFor(textId, setId),
    mode: Store.getMode(),
    kind,
    retiredIds: Store.retiredIds(),
    choiceCounts: Store.choiceCounts(),
    extraPool: textId === "techniques" ? [] : Data.vocab,
  });
  run = { textId, kind, setId, session, phase: "question", last: null, sentence: "" };
  run.phase = session.next() ? "question" : "complete";
  drawRun();
}

// A quotes game: game is "gap" (pick the missing word) or "who" (who said it / which poem).
function startQuotes(textId, game) {
  const { items, optionsFor } = Data.quoteGame(textId, game);
  const session = new Session({
    items,
    mode: Store.getMode(),
    kind: "choose",
    retiredIds: Store.retiredIds(),
    choiceCounts: Store.choiceCounts(),
    optionsFor,
  });
  run = { textId, kind: "choose", subject: "quote", game, session, phase: "question", last: null, sentence: "" };
  run.phase = session.next() ? "question" : "complete";
  drawRun();
}

function startMatch(textId, setId) {
  const game = new MatchGame({
    items: Data.itemsFor(textId, setId),
    mode: Store.getMode(),
    retiredIds: Store.retiredIds(),
  });
  game.newRound();
  run = { textId, kind: "match", setId, session: game, phase: "question", last: null, sentence: "" };
  drawRun();
}

// A sentence about the text being practised, with the key word in bold when it is drawn.
function pickSentence(word, textId) {
  const forThisText = word.examples_high.filter((e) => e.text === textId).map((e) => e.sentence);
  const forAnyText = word.examples_high.map((e) => e.sentence);
  return pick(forThisText.length ? forThisText : forAnyText.length ? forAnyText : word.examples);
}

function drawRun(keepScroll) {
  app.innerHTML = Screens.run(run);
  if (!keepScroll) window.scrollTo(0, 0);
  // Put the cursor where the student needs it: the answer box, or the Next button.
  const target = app.querySelector("#answer") || app.querySelector("[data-action='next']");
  if (target) target.focus();
}

function route() {
  run = null;
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let html;
  if (parts.length === 0) {
    html = Screens.home();
  } else if (parts[0] === "text" && parts.length === 2) {
    html = Screens.text(parts[1]);
  } else if (parts[0] === "text" && parts[2] === "vocab-type" && Data.text(parts[1])) {
    startRun(parts[1], "type");
    return;
  } else if (parts[0] === "text" && parts[2] === "vocab-choose" && Data.text(parts[1])) {
    startRun(parts[1], "choose");
    return;
  } else if (parts[0] === "text" && ["quotes-gap", "quotes-who"].includes(parts[2]) && Data.text(parts[1])) {
    startQuotes(parts[1], parts[2] === "quotes-gap" ? "gap" : "who");
    return;
  } else if (parts[0] === "text" && parts[2] === "vocab-match" && Data.text(parts[1])) {
    startMatch(parts[1]);
    return;
  } else if (parts[0] === "text" && parts.length === 3) {
    html = Screens.comingSoon(`#/text/${parts[1]}`, "Back to the text");
  } else if (parts[0] === "techniques" && parts.length === 1) {
    html = Screens.techniques();
  } else if (parts[0] === "techniques" && [2, 3].includes(parts.length) && ["type", "choose", "match"].includes(parts[parts.length - 1])) {
    // #/techniques/<set>/<game>  (or the older #/techniques/<game> for all techniques)
    const setId = parts.length === 3 ? parts[1] : "all";
    const game = parts[parts.length - 1];
    if (game === "match") startMatch("techniques", setId);
    else startRun("techniques", game === "type" ? "type" : "choose", setId);
    return;
  } else if (parts[0] === "techniques") {
    html = Screens.comingSoon("#/techniques", "Back to Techniques");
  } else {
    html = Screens.notFound();
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

// Clicks: the Learn the set / Free practice switch, Next word, and Practise again.
app.addEventListener("click", (event) => {
  const modeButton = event.target.closest(".mode-btn");
  if (modeButton) {
    Store.setMode(modeButton.dataset.mode);
    route();
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action || !run) return;
  if (action.dataset.action === "round") {
    run.session.newRound();
    run.phase = "question";
    drawRun();
  } else if (action.dataset.action === "next") {
    run.phase = run.session.next() ? "question" : "complete";
    drawRun();
  } else if (action.dataset.action === "again") {
    // Starting again after finishing a set goes to free practice, so learned words stay learned.
    Store.setMode("free");
    if (run.subject === "quote") startQuotes(run.textId, run.game);
    else startRun(run.textId, run.kind, run.setId);
  }
});

// After an answer: save it, choose a sentence, and show the right/wrong screen.
function finishAnswer(result, choiceCount) {
  const word = run.session.current;
  Store.recordAnswer(word.id, result.correct, result.retiredNow, choiceCount);
  run.last = result;
  run.sentence = pickSentence(word, run.textId);
  run.phase = result.correct ? "right" : "wrong";
  drawRun();
}

// Checking a typed answer (the Check button, or Enter).
app.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!run || run.phase !== "question" || run.kind !== "type") return;
  const typed = app.querySelector("#answer").value;
  if (!typed.trim()) {
    app.querySelector("#answer").focus();
    return;
  }
  finishAnswer(run.session.answer(typed));
});

// Picking a multiple-choice option (tap or click).
function chooseOption(wordId) {
  if (!run || run.phase !== "question" || run.kind !== "choose") return;
  const session = run.session;
  const wordIdBefore = session.current.id;
  const result = session.answerChoice(wordId);
  // Only the learn-the-set mode keeps a running count of right answers.
  finishAnswer(result, session.mode === "learn" ? session.choiceCounts[wordIdBefore] || 0 : undefined);
}

app.addEventListener("click", (event) => {
  const option = event.target.closest("[data-choice]");
  if (option) chooseOption(option.dataset.choice);
  const cell = event.target.closest("[data-m]");
  if (cell && run && run.kind === "match" && run.phase === "question") {
    const [side, id] = cell.dataset.m.split(":");
    run.session.select(side, id);
    if (run.session.roundDone) run.phase = "done";
    drawRun(run.phase === "question");
  }
});

// On a keyboard, 1, 2, 3 or 4 picks that option.
document.addEventListener("keydown", (event) => {
  if (!run || run.phase !== "question" || run.kind !== "choose") return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const index = "1234".indexOf(event.key);
  if (index < 0 || !run.session.options[index]) return;
  chooseOption(run.session.options[index].id);
});

window.addEventListener("hashchange", route);

Data.load().then(route).catch((err) => {
  app.innerHTML = `<main class="wrap"><div class="card"><h2>Sorry, something went wrong</h2><p>${esc(err.message)}</p></div></main>`;
});
