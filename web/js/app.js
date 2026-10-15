// Works out which screen to show from the address (the part after #), and draws it.
const app = document.getElementById("app");

// The game currently being played (null when not playing).
let run = null;

function pick(list) {
  return list.length ? list[Math.floor(Math.random() * list.length)] : "";
}

function startTyped(textId) {
  const session = new Session({
    items: Data.wordsFor(textId),
    mode: Store.getMode(),
    retiredIds: Store.retiredIds(),
  });
  run = { textId, session, phase: "question", last: null, sentence: "" };
  run.phase = session.next() ? "question" : "complete";
  drawRun();
}

function drawRun() {
  app.innerHTML = Screens.run(run);
  window.scrollTo(0, 0);
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
    startTyped(parts[1]);
    return;
  } else if (parts[0] === "text" && parts.length === 3) {
    html = Screens.comingSoon(`#/text/${parts[1]}`, "Back to the text");
  } else if (parts[0] === "techniques" && parts.length === 1) {
    html = Screens.techniques();
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
  if (action.dataset.action === "next") {
    run.phase = run.session.next() ? "question" : "complete";
    drawRun();
  } else if (action.dataset.action === "again") {
    // Starting again after finishing a set goes to free practice, so learned words stay learned.
    Store.setMode("free");
    startTyped(run.textId);
  }
});

// Checking a typed answer (the Check button, or Enter).
app.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!run || run.phase !== "question") return;
  const typed = app.querySelector("#answer").value;
  if (!typed.trim()) {
    app.querySelector("#answer").focus();
    return;
  }
  const result = run.session.answer(typed);
  Store.recordAnswer(run.session.current.id, result.correct, result.retiredNow);
  run.last = result;
  run.sentence = pick(run.session.current.examples);
  run.phase = result.correct ? "right" : "wrong";
  drawRun();
});

window.addEventListener("hashchange", route);

Data.load().then(route).catch((err) => {
  app.innerHTML = `<main class="wrap"><div class="card"><h2>Sorry, something went wrong</h2><p>${esc(err.message)}</p></div></main>`;
});
