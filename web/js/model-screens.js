// "Complete the paragraph": a teacher's model paragraph with some words blanked. The student types the gaps.
// Nothing here is saved; it is practice for reading and using the key words.
Object.assign(Screens, {
  // The card on a text's page listing the model paragraphs to complete (nothing if there are none).
  modelCard(textId) {
    const models = Data.models.filter((m) => m.text === textId);
    if (!models.length) return "";
    const links = models.map((m) =>
      `<a class="pill" href="#/text/${textId}/model/${m.id}">${esc(m.title)}</a>`).join("");
    return `
      <section class="card">
        <div class="card-top"><h2>Model paragraphs</h2></div>
        <p class="level-hint">Read a model, then type the missing words.</p>
        <div class="pills">${links}</div>
      </section>`;
  },

  modelGaps(textId, modelId) {
    const t = Data.text(textId);
    const m = Data.models.find((x) => x.id === modelId && x.text === textId);
    if (!t || !m) return Screens.notFound();
    const look = TEXT_LOOK[textId];
    let n = 0;
    const parts = m.parts.map((p) => {
      const body = p.pieces.map((piece) => {
        if (!("gap" in piece)) return esc(piece.text);
        const size = Math.max(piece.gap.length + 1, 4);
        return `<input class="gap-input" type="text" data-answer="${esc(piece.gap)}" size="${size}" aria-label="Gap ${++n}"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">`;
      }).join("");
      return `<p class="model-part"><span class="model-label">${esc(p.label)}</span>${body}</p>`;
    }).join("");
    const bank = m.gaps.slice().sort((a, b) => a.localeCompare(b)).map((w) => `<span class="bank-word">${esc(w)}</span>`).join("");
    return `
      ${Screens.pageHead("Complete the paragraph", m.title, look.colour, look.tint)}
      <main class="wrap" style="--accent:${look.colour};--tint:${look.tint}">
        <form id="model-form" class="model-box model-gaps" autocomplete="off">
          <p class="model-title">Word bank (in alphabetical order, each used once)</p>
          <p class="word-bank">${bank}</p>
          ${parts}
          <p id="model-result" class="model-result" role="status"></p>
          <div class="model-actions">
            <button type="submit" class="check-btn">Check</button>
            <button type="button" class="pill" data-model-show>Show answers</button>
            <a class="pill" href="#/text/${textId}">Back to ${esc(t.name)}</a>
          </div>
        </form>
      </main>`;
  },
});

app.addEventListener("submit", (event) => {
  const form = event.target.closest("#model-form");
  if (!form) return;
  event.preventDefault();
  const inputs = [...form.querySelectorAll(".gap-input")];
  let right = 0;
  let firstBad = null;
  for (const input of inputs) {
    const typed = input.value;
    const answer = input.dataset.answer;
    const ok = Engine.isCorrect(typed, answer);
    const near = !ok && Engine.isNear(typed, answer);
    const blank = !typed.trim();
    input.classList.toggle("gap-ok", ok);
    input.classList.toggle("gap-near", near);
    input.classList.toggle("gap-bad", !ok && !near && !blank);
    input.readOnly = ok;
    if (ok) right++;
    else if (!firstBad) firstBad = input;
  }
  const result = form.querySelector("#model-result");
  result.textContent = right === inputs.length
    ? `All ${inputs.length} right. Well done! Read the whole paragraph once more, out loud if you can.`
    : `${right} of ${inputs.length} right. Fill any empty gaps and fix the red and orange ones (orange means almost: check the spelling), then check again.`;
  if (firstBad) firstBad.focus();
});

app.addEventListener("click", (event) => {
  const show = event.target.closest("[data-model-show]");
  if (!show) return;
  const form = show.closest("#model-form");
  for (const input of form.querySelectorAll(".gap-input")) {
    if (!Engine.isCorrect(input.value, input.dataset.answer)) input.value = input.dataset.answer;
    input.classList.remove("gap-bad", "gap-near");
    input.classList.add("gap-ok");
    input.readOnly = true;
  }
  form.querySelector("#model-result").textContent = "Here are the answers. Read the paragraph through, then try again another day.";
});
