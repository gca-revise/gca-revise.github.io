// Points across the whole game: a weekly score (resets every Monday) and a lifetime score (never goes down).
// Saved on the student's own device with the rest of their progress.
//   +1 for a right answer at the first attempt, once per word per week (so easy words cannot be farmed)
//   +1 extra at each streak milestone (5, 10, 20, 50, 100, then every 50 up to 5,000)

//   a perfect Match them round earns +1 if it holds a word that has not earned a point this week
//   +20 once for each set, the first time every step of it is done (the typed steps included, so
//   multiple choice alone cannot earn it); the bonus is remembered for good and never repeats
//   nothing in "Revise everything"; a wrong answer never takes points away
const Points = {
  // Bonus for completing a set. Edit the number to make finishing a set worth more or less.
  SET_BONUS: 20,
  MODEL_BONUS: 15,

  // Ranks by lifetime points: [name, points needed]. Edit the numbers to make ranks easier or harder.
  RANKS: [
    ["Wood", 0], ["Stone", 50], ["Bronze", 150], ["Silver", 300], ["Gold", 500],
    ["Emerald", 800], ["Sapphire", 1200], ["Ruby", 2000], ["Diamond", 3000],
  ],

  // The rank for a lifetime score, and how far through it the student is.
  // {name, number, of, next (name or null), toNext (points), pct (0 to 100)}
  rank(life = this.lifetime()) {
    let i = 0;
    while (i + 1 < this.RANKS.length && life >= this.RANKS[i + 1][1]) i += 1;
    const next = this.RANKS[i + 1];
    const from = this.RANKS[i][1];
    return {
      name: this.RANKS[i][0], number: i + 1, of: this.RANKS.length,
      next: next ? next[0] : null,
      toNext: next ? next[1] - life : 0,
      pct: next ? Math.round(((life - from) / (next[1] - from)) * 100) : 100,
    };
  },

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
      sets: saved.sets || [],   // sets whose completion bonus has been paid (kept for good)
    };
  },

  weekly() { return this.read().wk; },
  lifetime() { return this.read().life; },

  // Adds `n` points (and marks `ids` as having earned this week). Returns n.
  add(n, ids = [], setId = "") {
    const p = this.read();
    const state = Store.load();
    state.pts = {
      life: p.life + n, week: p.week, wk: p.wk + n, earned: Array.from(new Set([...p.earned, ...ids])),
      sets: setId ? Array.from(new Set([...p.sets, setId])) : p.sets,
    };
    Store.save(state);
    // Reaching a new rank gets its own banner (it replaces a streak banner if both happen at once).
    const before = this.rank(p.life).name, after = this.rank(p.life + n);
    if (after.name !== before) Celebrate.display(`New league: <span class="celebrate-num">${after.name} League</span>!`, 100);
    return n;
  },

  // The bonus for completing a set: paid once per set, ever. Returns the points won (0 if already paid).
  // The caller checks that every step of the set is done.
  setBonus(setId) {
    if (this.read().sets.includes(setId)) return 0;
    return this.add(this.SET_BONUS, [], setId);
  },

  // The extra bonus for a set that ends with a model paragraph: paid once per set, when the whole set is done.
  modelBonusPaid(setId) {
    return this.read().sets.includes(setId + ":model");
  },
  modelBonus(setId) {
    const key = setId + ":model";
    if (this.read().sets.includes(key)) return 0;
    return this.add(this.MODEL_BONUS, [], key);
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
    const sets = Array.from(new Set([...(a.sets || []), ...(b.sets || [])]));
    if (newer) return { life, week: newer.week, wk: newer.wk || 0, earned: newer.earned || [], sets };
    return {
      sets, life, week: a.week || b.week || "", wk: Math.max(a.wk || 0, b.wk || 0),
      earned: Array.from(new Set([...(a.earned || []), ...(b.earned || [])])),
    };
  },
};
