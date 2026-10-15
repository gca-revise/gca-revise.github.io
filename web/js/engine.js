// The rules of the game (the "kitchen"). No screen code in here, so it can be tested on its own.

const Engine = {
  // Make a typed answer comparable: ignore capitals, accents, punctuation, hyphens and extra spaces.
  // ("Façade" and "facade" match; "Self-fulfilling prophecy" and "self fulfilling prophecy" match.)
  normalise(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[-‐-―]/g, " ")
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  // True if the typed answer matches. A word with a bracket, like
  // "Post-traumatic stress disorder (PTSD)", is also accepted without the bracket.
  isCorrect(typed, answer) {
    const given = Engine.normalise(typed);
    if (!given) return false;
    const accepted = [Engine.normalise(answer), Engine.normalise(String(answer).replace(/\(.*?\)/g, ""))];
    return accepted.includes(given);
  },

  // A fair shuffle (Fisher-Yates). `random` can be swapped in for testing.
  shuffle(list, random = Math.random) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },
};

// One go at a set of words, from the first question to "Set complete!".
//   items:      the words ({id, word, definition, ...})
//   mode:       "learn" (words retire when learned, ends when all are retired)
//               or "free" (endless, nothing retires)
//   retiredIds: Set of ids already learned (from earlier visits)
class Session {
  constructor({ items, mode, retiredIds = new Set(), random = Math.random }) {
    this.items = items;
    this.mode = mode;
    this.random = random;
    this.retired = new Set(retiredIds);
    this.bag = [];          // words still to ask in this pass
    this.current = null;
    this.lastId = null;     // so the same word never comes up twice in a row
    this.points = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.right = 0;
    this.wrong = 0;
    this.missed = {};       // word id -> times missed in this session
  }

  // Words that can still be asked.
  active() {
    return this.mode === "learn" ? this.items.filter((w) => !this.retired.has(w.id)) : this.items;
  }

  // How many words in this set are learned (for the progress bar).
  learnedCount() {
    return this.items.filter((w) => this.retired.has(w.id)).length;
  }

  isComplete() {
    return this.mode === "learn" && this.active().length === 0;
  }

  // Every word is asked once before any word comes round again.
  refill() {
    this.bag = Engine.shuffle(this.active(), this.random);
    // Don't start a new pass with the word we just asked.
    if (this.bag.length > 1 && this.bag[0].id === this.lastId) {
      const last = this.bag.length - 1;
      [this.bag[0], this.bag[last]] = [this.bag[last], this.bag[0]];
    }
  }

  // Move on to the next question. Returns the word, or null when the set is complete.
  next() {
    if (this.isComplete()) {
      this.current = null;
      return null;
    }
    while (this.bag.length && this.mode === "learn" && this.retired.has(this.bag[0].id)) {
      this.bag.shift();
    }
    if (this.bag.length === 0) this.refill();
    this.current = this.bag.shift();
    this.lastId = this.current.id;
    return this.current;
  }

  // Check a typed answer for the current word.
  // Returns {correct, retiredNow, expected, typed}.
  answer(typed) {
    const word = this.current;
    const correct = Engine.isCorrect(typed, word.word);
    let retiredNow = false;
    if (correct) {
      this.points += 1;
      this.right += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      // One correct typed answer retires a word (learn mode only).
      if (this.mode === "learn") {
        this.retired.add(word.id);
        retiredNow = true;
      }
    } else {
      this.wrong += 1;
      this.streak = 0;
      this.missed[word.id] = (this.missed[word.id] || 0) + 1;
    }
    return { correct, retiredNow, expected: word.word, typed };
  }

  // The words missed most in this session, worst first.
  trickiest(limit = 3) {
    return this.items
      .filter((w) => this.missed[w.id])
      .sort((a, b) => this.missed[b.id] - this.missed[a.id])
      .slice(0, limit)
      .map((w) => ({ word: w.word, times: this.missed[w.id] }));
  }
}
