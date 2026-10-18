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

  // `fromSync` is true when the save comes from signing in (it is uploaded separately).
  save(state, fromSync) {
    this.memory = state;
    if (!fromSync && typeof Account !== "undefined") Account.queuePush(state);
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (e) {
      // Saving is a convenience; carry on without it.
    }
  },

  // Forget everything saved on this device (learned words, counts, the chosen mode).
  reset() {
    this.memory = {};
    try {
      localStorage.removeItem(this.KEY);
    } catch (e) {
      // Nothing saved, nothing to clear.
    }
    if (typeof Account !== "undefined") Account.queuePush({});
  },

  // "learn" (Learn the set) or "free" (Revise everything)
  getMode() {
    return this.load().mode === "free" ? "free" : "learn";
  },

  setMode(mode) {
    const state = this.load();
    state.mode = mode;
    this.save(state);
  },

  // Is the "ding" for right answers on? (On unless the student turned it off.)
  getSound() {
    return this.load().sound !== false;
  },

  setSound(on) {
    const state = this.load();
    state.sound = !!on;
    this.save(state);
  },

  // Ids of words the student has learned (retired).
  retiredIds() {
    return new Set(this.load().retired || []);
  },

  // Ids of words whose latest answer was wrong and that are not learned yet.
  missedIds() {
    const state = this.load();
    const retired = new Set(state.retired || []);
    return new Set(Object.keys(state.stats || {}).filter((id) => state.stats[id].last === "w" && !retired.has(id)));
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
    entry.last = correct ? "r" : "w";   // the latest answer, so we know what to revisit
    if (choiceCount !== undefined) entry.choiceRight = choiceCount;
    if (retiredNow) {
      state.retired = Array.from(new Set([...(state.retired || []), id]));
    }
    this.save(state);
  },
};
