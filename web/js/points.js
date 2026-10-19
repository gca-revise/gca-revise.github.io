// Points across the whole game: a weekly score (resets every Monday) and a lifetime score (never goes down).
// Saved on the student's own device with the rest of their progress.
//   +1 for a right answer at the first attempt, once per word per week (so easy words cannot be farmed)
//   +1 extra at each streak milestone (5, 10, 20, 50, 100, then every 50 up to 5,000)

//   a perfect Match them round earns +1 if it holds a word that has not earned a point this week
//   nothing in "Revise everything"; a wrong answer never takes points away
const Points = {
  // The Monday of the current week as "YYYY-MM-DD", using the device's own clock.
  weekKey(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  // The saved points, with the weekly part reset if a new week has started.
  read() {
    const saved = Store.load().pts || {};
    const week = this.weekKey();
    const sameWeek = saved.week === week;
    return {
      life: saved.life || 0,
      week,
      wk: sameWeek ? saved.wk || 0 : 0,
      earned: sameWeek ? saved.earned || [] : [],
    };
  },

  weekly() { return this.read().wk; },
  lifetime() { return this.read().life; },

  // Adds `n` points (and marks `ids` as having earned this week). Returns n.
  add(n, ids = []) {
    const p = this.read();
    const state = Store.load();
    state.pts = { life: p.life + n, week: p.week, wk: p.wk + n, earned: Array.from(new Set([...p.earned, ...ids])) };
    Store.save(state);
    return n;
  },

  // A right answer: 1 point if it was the first attempt and the word has not scored this week.
  // Plus 1 if the streak has just reached a milestone. Returns the points won.
  forAnswer(wordId, correct, firstAttempt, streak) {
    if (!correct) return 0;
    let n = 0;
    const ids = [];
    if (firstAttempt && !this.read().earned.includes(wordId)) {
      n += 1;
      ids.push(wordId);
    }
    if (Celebrate.MILESTONES.includes(streak)) n += 1;
    return n ? this.add(n, ids) : 0;
  },

  // A perfect Match them round: 1 point if any of its words has not scored this week.
  forMatchRound(wordIds, streak) {
    const earned = this.read().earned;
    const fresh = wordIds.filter((id) => !earned.includes(id));
    let n = fresh.length ? 1 : 0;
    if (Celebrate.MILESTONES.includes(streak)) n += 1;
    return n ? this.add(n, fresh) : 0;
  },

  // Joins two saved point records (used when progress from two places is merged).
  merge(a = {}, b = {}) {
    const newer = (a.week || "") === (b.week || "") ? null : ((a.week || "") > (b.week || "") ? a : b);
    const life = Math.max(a.life || 0, b.life || 0);
    if (newer) return { life, week: newer.week, wk: newer.wk || 0, earned: newer.earned || [] };
    return {
      life, week: a.week || b.week || "", wk: Math.max(a.wk || 0, b.wk || 0),
      earned: Array.from(new Set([...(a.earned || []), ...(b.earned || [])])),
    };
  },
};
