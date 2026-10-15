// Saving things in the student's own browser (nothing is sent anywhere).
// Every read and write is wrapped so the page still works if the browser blocks saving.
const Store = {
  KEY: "gca-revise-v1",

  // A copy kept in memory, so things still work for this visit if the browser refuses to save.
  memory: {},

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || this.memory;
    } catch (e) {
      return this.memory;
    }
  },

  save(state) {
    this.memory = state;
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (e) {
      // Saving is a convenience; carry on without it.
    }
  },

  // "learn" (Learn the set) or "free" (Free practice)
  getMode() {
    return this.load().mode === "free" ? "free" : "learn";
  },

  setMode(mode) {
    const state = this.load();
    state.mode = mode;
    this.save(state);
  },

  // Ids of words the student has learned (retired).
  retiredIds() {
    return new Set(this.load().retired || []);
  },

  // Save one answer: right/wrong counts per word, and the word as learned if it just retired.
  recordAnswer(id, correct, retiredNow) {
    const state = this.load();
    state.stats = state.stats || {};
    const entry = state.stats[id] || (state.stats[id] = { right: 0, wrong: 0 });
    if (correct) entry.right += 1;
    else entry.wrong += 1;
    if (retiredNow) {
      state.retired = Array.from(new Set([...(state.retired || []), id]));
    }
    this.save(state);
  },
};
