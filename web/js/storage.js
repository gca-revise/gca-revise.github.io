// Saving things in the student's own browser (nothing is sent anywhere).
// Every read and write is wrapped so the page still works if the browser blocks saving.
const Storage = {
  KEY: "gca-revise-v1",

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  save(state) {
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

  // Ids of words the student has learned (retired). Filled in from stage 3 onwards.
  retiredIds() {
    return new Set(this.load().retired || []);
  },
};
