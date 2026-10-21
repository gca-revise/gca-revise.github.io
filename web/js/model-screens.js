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

  // `lesson` (optional) is the set's lesson step: then the page is a step, and finishing it moves the lesson on.
  modelGaps(textId, modelId, lesson = null) {
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
      return `<p class="model-part">${p.label ? `<span class="model-label">${esc(p.label)}</span>` : ""}${body}</p>`;
    }).join("");
    const bank = m.gaps.slice().sort((a, b) => a.localeCompare(b)).map((w) => `<button type="button" class="bank-word" data-word="${esc(w)}">${esc(w)}</button>`).join("");
    return `
      ${Screens.pageHead("Complete the paragraph", m.title, look.colour, look.tint)}
      <main class="wrap" style="--accent:${look.colour};--tint:${look.tint}">
        <form id="model-form" class="model-box model-gaps" autocomplete="off"${lesson ? " data-lesson" : ""}>
          <p class="model-title">Word bank (alphabetical, each used once)</p>
          <p class="bank-help">Type into the gaps, or drag a word into a gap, or tap a word and then tap a gap. Tap a placed word to take it back.</p>
          <p class="word-bank">${bank}</p>
          ${parts}
          <p id="model-result" class="model-result" role="status"></p>
          <div class="model-actions">
            <button type="submit" class="check-btn">Check</button>
            <button type="button" class="pill" data-model-show>${lesson ? "Show answers (the step stays to do)" : "Show answers"}</button>
            ${lesson
              ? `<button type="button" class="check-btn" data-model-continue hidden>Finish this step</button>
                 <a class="pill" href="#/text/${textId}/set/${lesson.setId}">Back to the set</a>`
              : `<a class="pill" href="#/text/${textId}">Back to ${esc(t.name)}</a>`}
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
  // In a lesson, getting every gap right finishes the step.
  const cont = form.querySelector("[data-model-continue]");
  if (cont && right === inputs.length && !form.dataset.shown) cont.hidden = false;
});

app.addEventListener("click", (event) => {
  if (event.target.closest("[data-model-continue]")) {
    finishModelStep();
    return;
  }
  const show = event.target.closest("[data-model-show]");
  if (!show) return;
  const form = show.closest("#model-form");
  form.dataset.shown = "yes";  // answers were revealed, so this try cannot finish a lesson step
  for (const input of form.querySelectorAll(".gap-input")) {
    if (!Engine.isCorrect(input.value, input.dataset.answer)) input.value = input.dataset.answer;
    input.classList.remove("gap-bad", "gap-near");
    input.classList.add("gap-ok");
    input.readOnly = true;
  }
  form.querySelector("#model-result").textContent = "Here are the answers. Read the paragraph through, then try again another day.";
});

// The word bank: drag a word into a gap, or tap a word and then tap a gap. Typing in a gap still works.
(function () {
  let selected = null;
  let drag = null;
  let justDragged = false;

  const free = (chip) => chip && chip.classList.remove("used");
  const choose = (chip) => {
    if (selected) selected.classList.remove("picked");
    selected = chip;
    if (chip) chip.classList.add("picked");
  };
  // Put a bank word in a gap. The gap's old word goes back to the bank; so does this word's old gap.
  const place = (chip, input) => {
    if (!chip || !input || input.readOnly) return;
    const form = input.closest("#model-form");
    free(input._chip);
    for (const other of form.querySelectorAll(".gap-input")) {
      if (other !== input && other._chip === chip) { other.value = ""; other._chip = null; other.classList.remove("gap-bad", "gap-near"); }
    }
    input.value = chip.dataset.word;
    input._chip = chip;
    input.classList.remove("gap-bad", "gap-near");
    chip.classList.add("used");
    choose(null);
  };
  const gapAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest(".gap-input") : null;
  };
  const overGap = (x, y) => {
    for (const g of app.querySelectorAll(".gap-over")) g.classList.remove("gap-over");
    const g = gapAt(x, y);
    if (g && !g.readOnly) g.classList.add("gap-over");
  };

  app.addEventListener("pointerdown", (event) => {
    const chip = event.target.closest(".bank-word");
    if (chip && !chip.classList.contains("used") && event.button === 0) {
      drag = { chip, x: event.clientX, y: event.clientY, ghost: null, id: event.pointerId };
      return;
    }
    // A word is picked and a gap is tapped: fill it (and keep the keyboard closed).
    const input = event.target.closest(".gap-input");
    if (input && selected && !input.readOnly) {
      event.preventDefault();
      place(selected, input);
    }
  });

  document.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.ghost) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
      drag.ghost = document.createElement("div");
      drag.ghost.className = "bank-ghost";
      drag.ghost.textContent = drag.chip.dataset.word;
      document.body.appendChild(drag.ghost);
      drag.chip.classList.add("dragging");
    }
    drag.ghost.style.left = event.clientX + "px";
    drag.ghost.style.top = event.clientY + "px";
    overGap(event.clientX, event.clientY);
  });

  const endDrag = (event, dropped) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { chip, ghost } = drag;
    drag = null;
    for (const g of app.querySelectorAll(".gap-over")) g.classList.remove("gap-over");
    if (!ghost) return;  // it was a tap: the click handler deals with it
    ghost.remove();
    chip.classList.remove("dragging");
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
    if (dropped) place(chip, gapAt(event.clientX, event.clientY));
  };
  document.addEventListener("pointerup", (event) => endDrag(event, true));
  document.addEventListener("pointercancel", (event) => endDrag(event, false));

  app.addEventListener("click", (event) => {
    const chip = event.target.closest(".bank-word");
    if (!chip || justDragged) return;
    if (chip.classList.contains("used")) {
      // Tap a placed word to take it back out of its gap.
      for (const g of app.querySelectorAll(".gap-input")) {
        if (g._chip === chip && !g.readOnly) { g.value = ""; g._chip = null; g.classList.remove("gap-bad", "gap-near"); }
      }
      free(chip);
      return;
    }
    choose(selected === chip ? null : chip);
  });

  // Typing over a placed word sends that word back to the bank.
  app.addEventListener("input", (event) => {
    const input = event.target.closest(".gap-input");
    if (input && input._chip) { free(input._chip); input._chip = null; }
  });
})();
