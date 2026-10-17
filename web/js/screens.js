// Drawing each screen. Each function returns a piece of HTML as text.

// Each text's badge letters and accent colour (from the approved design).
const TEXT_LOOK = {
  "macbeth": { badge: "M", colour: "#8E1F37", tint: "#F6E6EA" },
  "inspector": { badge: "IC", colour: "#8A5316", tint: "#F7EBDD" },
  "jekyll-hyde": { badge: "JH", colour: "#3E5A4F", tint: "#E5EEEA" },
  "frankenstein": { badge: "F", colour: "#12707E", tint: "#DFF0F2" },
  "power-conflict": { badge: "P&C", colour: "#555C6B", tint: "#E8EAEE" },
  "techniques": { badge: "T", colour: "#222C69", tint: "#E3E7F6" },
};
const NAVY = "#222C69";
const NAVY_TINT = "#E3E7F6";

// Make any text safe to put on the page (data can contain & < > and quotes).
function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function progressBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="bar" role="img" aria-label="${done} of ${total} learned"><span style="width:${pct}%"></span></div>`;
}

const backIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>`;
const penIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222C69" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4z"></path></svg>`;

const Screens = {
  home() {
    const retired = Store.retiredIds();
    const cards = Data.texts.map((t) => {
      const look = TEXT_LOOK[t.id];
      const words = Data.wordsFor(t.id);
      const learned = words.filter((w) => retired.has(w.id)).length;
      return `
        <a class="text-card" href="#/text/${t.id}" style="--accent:${look.colour}">
          <div class="badge">${esc(look.badge)}</div>
          <div class="tc-name">${esc(t.name)}</div>
          <div class="tc-tag">Quotes + vocab</div>
          ${progressBar(learned, words.length)}
          <div class="tc-learned">${learned} of ${plural(words.length, "word")} learned</div>
        </a>`;
    }).join("");

    const techItems = Data.techniqueItems();
    const techLearned = techItems.filter((w) => retired.has(w.id)).length;
    return `
      <header class="home-head">
        <a class="home-link" href="#/" aria-label="GCA Revise home">
          <img class="crest" src="img/crest.png" alt="School crest">
          <div>
            <h1>GCA Revise</h1>
            <p class="sub">Pick a text and start revising.</p>
          </div>
        </a>
      </header>
      <main class="wrap">
        <h2 class="label">Your texts</h2>
        <div class="text-grid">${cards}</div>
        <h2 class="label">Across all texts</h2>
        <a class="tech-card" href="#/techniques">
          <div class="tech-icon">${penIcon}</div>
          <div class="tech-name">Techniques</div>
          <div class="tech-tag">simile, metaphor...</div>
          ${progressBar(techLearned, techItems.length)}
          <div class="tc-learned">${techLearned} of ${techItems.length} learned</div>
        </a>
      </main>
      <footer class="home-foot">
        ${typeof Account !== "undefined" && Account.html() || "<span>Your progress is saved only on this device.</span>"}
        <a class="link-btn" href="#/backup">Save or restore my progress</a>
        <button type="button" class="link-btn" data-reset>Reset my progress</button>
      </footer>`;
  },

  // Header shared by "inside a text" and Techniques.
  pageHead(title, subtitle, colour, tint) {
    return `
      <header class="page-head" style="--accent:${colour};--tint:${tint}">
        <div class="wrap head-inner">
          <div class="head-top">
            <a class="back" href="#/" aria-label="Back to all texts">${backIcon}</a>
            <a class="brand-link" href="#/" aria-label="GCA Revise home">
              <img class="crest-small" src="img/crest.png" alt="School crest">
              <span class="head-brand">GCA Revise</span>
            </a>
          </div>
          <h1>${esc(title)}</h1>
          <p class="sub">${esc(subtitle)}</p>
        </div>
      </header>`;
  },

  modeSwitch(mode) {
    const btn = (value, label) =>
      `<button type="button" class="mode-btn${mode === value ? " on" : ""}" data-mode="${value}" aria-pressed="${mode === value}">${label}</button>`;
    const help = mode === "learn"
      ? "Learn the set: asks only about what you haven’t learned yet."
      : "Revise everything: asks about all of them, even ones you know. Your progress isn’t affected.";
    return `<div class="mode-wrap"><div class="mode-switch">${btn("learn", "Learn the set")}${btn("free", "Revise everything")}</div><p class="mode-help">${help}</p></div>`;
  },

  // A card with a heading, a progress bar and a row of practice buttons.
  modeCard(title, learned, total, unit, buttons) {
    const links = buttons.map(([label, href], i) =>
      `<a class="pill${i === 0 ? " primary" : ""}" href="${href}">${esc(label)}</a>`).join("");
    return `
      <section class="card">
        <div class="card-top"><h2>${esc(title)}</h2><span class="count">${learned} of ${plural(total, unit)} learned</span></div>
        ${progressBar(learned, total)}
        <div class="pills">${links}</div>
      </section>`;
  },

  // The Quotes card: Know it (every quote) and Master it (the core quotes).
  quotesCard(id, knowLearned, knowTotal, retired) {
    const master = Data.masterProgress(id, retired);
    const pills = (buttons) => buttons.map(([label, href], i) =>
      `<a class="pill${i === 0 ? " primary" : ""}" href="${href}">${esc(label)}</a>`).join("");
    const block = (title, hint, done, total, unit, buttons) => `
      <div class="level">
        <div class="card-top"><h3>${title}</h3><span class="count">${done} of ${plural(total, unit)} ${unit === "quote" && title === "Master it" ? "mastered" : "learned"}</span></div>
        <p class="level-hint">${hint}</p>
        ${progressBar(done, total)}
        <div class="pills">${pills(buttons)}</div>
      </div>`;
    const know = block("Know it", "Every quote. Pick the answer.", knowLearned, knowTotal, "quote", [
      ["Fill the gap", `#/text/${id}/quotes-gap`],
      [id === "power-conflict" ? "Which poem?" : "Who said it?", `#/text/${id}/quotes-who`],
    ]);
    const mastery = master.total
      ? block("Master it", "Your core quotes. Type your answers.", master.mastered, master.total, "quote", [
        ["Type the gap", `#/text/${id}/master-gap`],
        ["Finish the quote", `#/text/${id}/master-finish`],
        ["Spot the technique", `#/text/${id}/master-tech`],
      ])
      : "";
    return `<section class="card"><div class="card-top"><h2>Quotes</h2></div>${know}${mastery}</section>`;
  },

  text(id) {
    const t = Data.text(id);
    if (!t) return Screens.notFound();
    const look = TEXT_LOOK[id];
    const retired = Store.retiredIds();
    const words = Data.wordsFor(id);
    const quotes = Data.quoteItemsAll(id);
    const quotesLearned = quotes.filter((qi) => retired.has(qi.id)).length;
    const learned = words.filter((w) => retired.has(w.id)).length;
    return `
      ${Screens.pageHead(t.name, "What do you want to practise?", look.colour, look.tint)}
      <main class="wrap" style="--accent:${look.colour};--tint:${look.tint}">
        ${Screens.modeSwitch(Store.getMode())}
        <div class="card-grid">
          ${Screens.quotesCard(id, quotesLearned, quotes.length, retired)}
          ${Screens.modeCard("Key vocab", learned, words.length, "word", [
            ["Type it", `#/text/${id}/vocab-type`],
            ["Choose it", `#/text/${id}/vocab-choose`],
            ["Match them", `#/text/${id}/vocab-match`],
          ])}
        </div>
        <div class="later"><strong>Coming later: technique analysis</strong><span>Learn the technique used in each ${esc(t.name)} quote.</span></div>
      </main>`;
  },

  techniques() {
    const retired = Store.retiredIds();
    const cards = Data.techniqueSets().map((set) =>
      Screens.modeCard(set.name, set.items.filter((t) => retired.has(t.id)).length, set.items.length, "technique", [
        ["Type it", `#/techniques/${set.id}/type`],
        ["Choose it", `#/techniques/${set.id}/choose`],
        ["Match them", `#/techniques/${set.id}/match`],
      ])).join("");
    return `
      ${Screens.pageHead("Techniques", "Useful for every text.", NAVY, NAVY_TINT)}
      <main class="wrap" style="--accent:${NAVY};--tint:${NAVY_TINT}">
        ${Screens.modeSwitch(Store.getMode())}
        <div class="card-grid">${cards}</div>
        <div class="later"><strong>Coming later: spot the technique</strong><span>Name the technique used in a quote from any of your texts.</span></div>
      </main>`;
  },

  // Shown for practice modes that are not built yet.
  comingSoon(backHref, backLabel) {
    return `
      ${Screens.pageHead("Coming soon", "This practice style is being built.", NAVY, NAVY_TINT)}
      <main class="wrap" style="--accent:${NAVY};--tint:${NAVY_TINT}">
        <div class="card"><p>This part of GCA Revise isn't ready yet.</p>
        <div class="pills"><a class="pill primary" href="${backHref}">${esc(backLabel)}</a></div></div>
      </main>`;
  },

  notFound() {
    return Screens.comingSoon("#/", "Back to home");
  },
};
