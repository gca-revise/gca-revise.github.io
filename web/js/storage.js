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

  // Right multiple-choice answers so far for each word: {id: count}.
  choiceCounts() {
    const stats = this.load().stats || {};
    const counts = {};
    for (const id of Object.keys(stats)) {
      if (stats[id].choiceRight) counts[id] = stats[id].choiceRight;
    }
    return counts;
  },

  // Save one answer: right/wrong counts per word, and the word as learned if it just retired.
  // `choiceCount` (multiple choice only) is the word's total right multiple-choice answers.
  recordAnswer(id, correct, retiredNow, choiceCount) {
    const state = this.load();
    state.stats = state.stats || {};
    const entry = state.stats[id] || (state.stats[id] = { right: 0, wrong: 0 });
    if (correct) entry.right += 1;
    else entry.wrong += 1;
    if (choiceCount !== undefined) entry.choiceRight = choiceCount;
    if (retiredNow) {
      state.retired = Array.from(new Set([...(state.retired || []), id]));
    }
    this.save(state);
  },
};
