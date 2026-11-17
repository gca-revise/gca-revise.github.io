// "Due today": bringing learned items back for a quick review after a gap.
// The gaps form a simple ladder: 1 day, 3 days, 1 week, 3 weeks, 2 months.
// A right answer moves an item up one step (it stays on the top step once there);
// a wrong answer sends it back to the bottom step (1 day).
// Saved in the progress save as `review`: { itemId: { s: step 1-5, d: "YYYY-MM-DD" } }.
// Items learned before this feature have no entry, so they are never due.

const Review = {
  // Days to wait at each step (step 1 is the first number). Edit to change the ladder.
  STEPS: [1, 3, 7, 21, 60],
  // The most questions in one day's review.
  DAILY_CAP: 10,

  // ---- Small functions that never touch the save (so they can be tested on their own) ----

  // A date as "YYYY-MM-DD", using the device's own (local) clock, not UTC.
  today(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  },

  // "YYYY-MM-DD" plus `n` days (works across month and year ends).
  addDays(day, n) {
    const [y, m, d] = day.split("-").map(Number);
    return Review.today(new Date(y, m - 1, d + n));
  },

  // Whole days from `from` to `to` (both "YYYY-MM-DD"); negative if `to` is earlier.
  daysBetween(from, to) {
    const at = (day) => { const [y, m, d] = day.split("-").map(Number); return Date.UTC(y, m - 1, d); };
    return Math.round((at(to) - at(from)) / 86400000);
  },

  // The entry for an item that has just been learned: step 1, due tomorrow.
  learnedEntry(day) {
    return { s: 1, d: Review.addDays(day, Review.STEPS[0]) };
  },

  // The entry after a review answer given on `day`.
  nextEntry(entry, correct, day) {
    const top = Review.STEPS.length;
    const step = correct ? Math.min(((entry && entry.s) || 1) + 1, top) : 1;
    return { s: step, d: Review.addDays(day, Review.STEPS[step - 1]) };
  },

  // The ids due on `day` (due date that day or earlier), most overdue first; ties in random order.
  dueIds(review, day, limit = Infinity, random = Math.random) {
    const due = Object.keys(review || {}).filter((id) => review[id] && review[id].d && review[id].d <= day);
    return Engine.shuffle(due, random)
      .sort((a, b) => (review[a].d < review[b].d ? -1 : review[a].d > review[b].d ? 1 : 0))
      .slice(0, limit);
  },

  // The next date anything is due, or null if nothing is saved.
  nextDue(review) {
    const dates = Object.values(review || {}).map((e) => e && e.d).filter(Boolean).sort();
    return dates[0] || null;
  },

  // Joins two saved review lists (used when progress from two places is merged): every item is kept;
  // if both have the same item, the one further up the ladder wins (then the later date).
  merge(a = {}, b = {}) {
    const out = Object.assign({}, a);
    for (const [id, y] of Object.entries(b)) {
      const x = out[id];
      if (!x || (y.s || 0) > (x.s || 0) || ((y.s || 0) === (x.s || 0) && (y.d || "") > (x.d || ""))) out[id] = y;
    }
    return out;
  },

  // ---- Reading and writing the save ----

  read() {
    return Store.load().review || {};
  },

  // Has the student learned anything since this feature started? (If not, the home card is hidden.)
  hasAny() {
    return Object.keys(this.read()).length > 0;
  },

  // Start the clock for an item that has just been learned. Pass `state` to change a save that the
  // caller is about to save itself (as Store.recordAnswer does); otherwise this saves on its own.
  // An item that already has a review date keeps it.
  onLearned(id, state) {
    const target = state || Store.load();
    target.review = target.review || {};
    if (!target.review[id]) target.review[id] = Review.learnedEntry(Review.today());
    if (!state) Store.save(target);
  },

  // A review answer: move the item up the ladder (right) or back to the bottom (wrong).
  onReviewAnswer(id, correct) {
    const state = Store.load();
    state.review = state.review || {};
    state.review[id] = Review.nextEntry(state.review[id], correct, Review.today());
    Store.save(state);
  },

  // Take an item off the review list (its data can no longer be found).
  drop(ids) {
    const state = Store.load();
    if (!state.review) return;
    for (const id of ids) delete state.review[id];
    Store.save(state);
  },

  // Today's due ids, most overdue first, capped at `limit`. Items whose data is missing are dropped quietly.
  dueItems(limit = this.DAILY_CAP) {
    const ids = Review.dueIds(this.read(), Review.today());
    const ready = [], missing = [];
    for (const id of ids) {
      if (Review.buildItem(id)) ready.push(id);
      else missing.push(id);
    }
    if (missing.length) Review.drop(missing);
    return ready.slice(0, limit);
  },

  // How many items are due today in all (before the daily cap), not counting missing ones.
  dueCount() {
    return this.dueItems(Infinity).length;
  },

  // ---- Turning an id back into a question (the same game it was learned in) ----

  // The question for an item id, or null if its data cannot be found. The item carries `review`:
  // {textId, kind ("type" or "choose"), subject, game, level, optionsFor}.
  //   key words (and tv: typed words), techniques: Type it
  //   quote ids (mac-2-02): Fill the gap (or "Who said it?" / "Which poem?" if the quote has no gap word)
  //   mg: / mf: / mt: : the matching Master it game
  buildItem(id) {
    const master = /^(mg|mf|mt):(.+)$/.exec(id);
    if (master) {
      const game = { mg: "mgap", mf: "mfinish", mt: "mtech" }[master[1]];
      const q = Data.quotes.find((x) => x.id === master[2]);
      if (!q) return null;
      const item = QuoteTools.masterItems(Data.quotes, q.text, game, Data.techniques, new Set([q.id]))[0];
      if (!item) return null;
      return Object.assign(item, { review: {
        textId: q.text, kind: game === "mtech" ? "choose" : "type", subject: "quote", level: "master", game,
        optionsFor: game === "mtech" ? QuoteTools.techOptionsFor(Data.techniques) : null,
      } });
    }
    if (id.startsWith("tech-")) {
      const t = Data.techniqueItems().find((x) => x.id === id);
      return t ? { ...t, review: { textId: "techniques", kind: "type" } } : null;
    }
    const bare = id.replace(/^tv:/, "");
    const q = id.startsWith("tv:") ? null : Data.quotes.find((x) => x.id === id);
    if (q) {
      for (const game of ["gap", "who"]) {
        const found = QuoteTools.items(Data.quotes, q.text, game).find((x) => x.id === id);
        if (found) {
          return Object.assign(found, { review: {
            textId: q.text, kind: "choose", subject: "quote", level: "know", game, optionsFor: Data.quoteGame(q.text, game).optionsFor,
          } });
        }
      }
      return null;
    }
    const w = Data.vocab.find((x) => x.id === bare);
    if (!w || !w.texts || !w.texts.length) return null;
    return { ...w, id, review: { textId: w.texts[0], kind: "type" } };
  },
};

// One Due today review: each item asked once, in the order given, each in its own game.
// `mode` is "review": nothing is retired (learned stays learned) and every answer earns normal points.
class ReviewSession extends Session {
  constructor({ items, random = Math.random }) {
    super({ items, mode: "review", kind: "type", onePass: true, random });
    this.index = 0;
  }

  next() {
    if (this.index >= this.items.length) {
      this.current = null;
      this.options = null;
      return null;
    }
    this.current = this.items[this.index++];
    this.asked.add(this.current.id);
    this.lastId = this.current.id;
    const r = this.current.review || {};
    this.kind = r.kind || "type";
    this.options = this.kind === "choose" && r.optionsFor ? r.optionsFor(this.current) : null;
    return this.current;
  }

  // In a review the bar counts questions answered, not items learned.
  learnedCount() {
    return this.right + this.wrong;
  }
}
