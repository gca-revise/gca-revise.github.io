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

  // Lead-in words ignored at the start of an answer ("the natural order" = "natural order").
  ARTICLES: ["the", "a", "an", "to"],

  // Word endings trimmed when comparing, so different forms of a word match
  // (subvert / subverting, ambiguous / ambiguity, conjure / conjuration).
  SUFFIXES: ["ations", "ation", "nesses", "ness", "ments", "ment", "ities", "ity", "ings", "ing",
             "istic", "ists", "ist", "isms", "ism", "ical", "ic", "ions", "ion",
             "ious", "ous", "ives", "ive", "ally", "ly", "al", "ed", "es", "s", "e", "y"],

  // Cut one ending off a single word. A stem is never shorter than 4 letters,
  // so short words like "fate" and "fat" are not mixed up.
  stem(token) {
    let word = token;
    if (word.endsWith("ies") && !word.endsWith("ities") && word.length - 3 >= 3) {
      word = word.slice(0, -3) + "y";
    }
    const ordered = Engine.SUFFIXES.slice().sort((a, b) => b.length - a.length);
    for (const suffix of ordered) {
      // A plain "s" is not trimmed from words that end in "ss" (transgress, stress).
      if (suffix === "s" && word.endsWith("ss")) continue;
      if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  },

  // The words of an answer, with lead-in words dropped (not stemmed).
  plainTokens(text) {
    const tokens = Engine.normalise(text).split(" ").filter(Boolean);
    while (tokens.length > 1 && Engine.ARTICLES.includes(tokens[0])) tokens.shift();
    return tokens;
  },

  // The stems of an answer: what we compare.
  keyTokens(text) {
    return Engine.plainTokens(text).map(Engine.stem);
  },

  // Words with a bracket, like "Post-traumatic stress disorder (PTSD)", are also accepted without it.
  variants(answer) {
    return [String(answer), String(answer).replace(/\(.*?\)/g, "")];
  },

  // Two word stems count as the same word if they are equal, or if one is the start of the
  // other (at least 5 letters shared, 2 or 3 extra): power / powerful. One extra letter is not
  // enough, so a slip like "ambigous" for "ambiguous" is still a spelling mistake.
  sameStem(a, b) {
    if (a === b) return true;
    const [short, long] = a.length <= b.length ? [a, b] : [b, a];
    const extra = long.length - short.length;
    return short.length >= 5 && long.startsWith(short) && extra >= 2 && extra <= 3;
  },

  // True if the typed answer matches, ignoring lead-in words and the form of the word.
  isCorrect(typed, answer) {
    const given = Engine.keyTokens(typed);
    if (given.length === 0) return false;
    return Engine.variants(answer).some((v) => {
      const target = Engine.keyTokens(v);
      return target.length === given.length && target.every((t, i) => Engine.sameStem(t, given[i]));
    });
  },

  // How many single-letter changes (add, remove, change, swap neighbours) turn a into b.
  distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  },

  // True if the answer is wrong but only slightly misspelt ("Almost!").
  isNear(typed, answer) {
    if (Engine.isCorrect(typed, answer)) return false;
    const plain = Engine.plainTokens(typed).join(" ");
    if (!plain) return false;
    const stemmed = Engine.keyTokens(typed).join(" ");
    return Engine.variants(answer).some((v) => {
      const target = Engine.plainTokens(v).join(" ");
      const targetStem = Engine.keyTokens(v).join(" ");
      const allowed = target.length <= 4 ? 0 : target.length <= 9 ? 1 : 2;
      return Engine.distance(plain, target) <= allowed || Engine.distance(stemmed, targetStem) <= allowed;
    });
  },

  // Split a sentence into pieces so the key word can be shown in bold:
  // [{text, bold}, ...]. Any form of the word counts ("subverts" for "subvert").
  markWord(sentence, word) {
    const text = String(sentence);
    const keys = Engine.keyTokens(Engine.variants(word)[1].trim() ? Engine.variants(word)[1] : word);
    const found = [];
    const re = /[\p{L}\p{N}]+/gu;
    let m;
    while ((m = re.exec(text))) {
      found.push({ start: m.index, end: m.index + m[0].length, stem: Engine.stem(Engine.normalise(m[0])) });
    }
    const spans = [];
    for (let i = 0; i + keys.length <= found.length; i++) {
      let ok = true;
      for (let j = 0; j < keys.length && ok; j++) {
        if (found[i + j].stem !== keys[j]) ok = false;
        if (ok && j > 0 && !/^[\s\-\u2010-\u2015]+$/.test(text.slice(found[i + j - 1].end, found[i + j].start))) ok = false;
      }
      if (ok) {
        spans.push([found[i].start, found[i + keys.length - 1].end]);
        i += keys.length - 1;
      }
    }
    const pieces = [];
    let at = 0;
    for (const [start, end] of spans) {
      if (start > at) pieces.push({ text: text.slice(at, start), bold: false });
      pieces.push({ text: text.slice(start, end), bold: true });
      at = end;
    }
    if (at < text.length) pieces.push({ text: text.slice(at), bold: false });
    return pieces;
  },

  // Hide the answer if a definition gives it away: any form of the word (or of a main word in a
  // phrase) becomes a blank. "Something you can throw away or dispose of easily." for "Disposable"
  // becomes "Something you can throw away or _____ of easily."
  blankWord(text, word, blank = "_____") {
    const skip = ["the", "a", "an", "to", "of", "and", "in", "on", "for", "or", "by", "with"];
    const bare = Engine.variants(word)[1].trim() ? Engine.variants(word)[1] : String(word);
    const keys = Engine.plainTokens(bare)
      .filter((t) => t.length >= 4 && !skip.includes(t))
      .map(Engine.stem);
    const source = String(text);
    if (keys.length === 0) return source;
    const spans = [];
    const re = /[\p{L}\p{N}]+/gu;
    let m;
    while ((m = re.exec(source))) {
      const stem = Engine.stem(Engine.normalise(m[0]));
      if (!stem || !keys.some((k) => Engine.sameStem(stem, k))) continue;
      const last = spans[spans.length - 1];
      // Neighbouring matches ("third person") share one blank.
      if (last && /^[\s\-\u2010-\u2015]+$/.test(source.slice(last[1], m.index))) last[1] = m.index + m[0].length;
      else spans.push([m.index, m.index + m[0].length]);
    }
    let result = "";
    let at = 0;
    for (const [start, end] of spans) {
      result += source.slice(at, start) + blank;
      at = end;
    }
    return result + source.slice(at);
  },

  // Four options for a multiple-choice question: the right word plus three believable wrong ones.
  // Wrong options come from `pool` (words from the same text), preferring words of a similar length
  // (one word or a phrase); `extra` is only used if the pool is too small. A word that would also
  // count as right (nihilism for nihilistic) is never offered as a wrong option.
  makeChoices(word, pool, extra = [], count = 4, random = Math.random) {
    const seen = new Set([word.word.toLowerCase()]);
    const usable = (list) => Engine.shuffle(list, random).filter((o) => {
      const name = o.word.toLowerCase();
      if (o.id === word.id || seen.has(name)) return false;
      if (Engine.isCorrect(o.word, word.word) || Engine.isCorrect(word.word, o.word)) return false;
      seen.add(name);
      return true;
    });
    const size = (w) => Engine.plainTokens(w.word).length;
    const closest = (list) => list.slice().sort((a, b) => Math.abs(size(a) - size(word)) - Math.abs(size(b) - size(word)));
    let wrong = closest(usable(pool)).slice(0, count - 1);
    if (wrong.length < count - 1) wrong = wrong.concat(closest(usable(extra)).slice(0, count - 1 - wrong.length));
    return Engine.shuffle([word, ...wrong], random);
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
//   kind:       "type" (type the word) or "choose" (multiple choice)
//   retiredIds: Set of ids already learned (from earlier visits)
//   choiceCounts: {id: right multiple-choice answers so far} from earlier visits
//   extraPool:  more words to borrow wrong options from if the set is small
class Session {
  static CHOICES_TO_LEARN = 2;   // right multiple-choice answers that retire a word

  constructor({ items, mode, kind = "type", retiredIds = new Set(), choiceCounts = {}, extraPool = [], optionsFor = null, random = Math.random }) {
    this.items = items;
    this.mode = mode;
    this.kind = kind;
    this.random = random;
    this.extraPool = extraPool;
    this.optionsFor = optionsFor;   // optional: builds the options for an item (used for quotes)
    this.retired = new Set(retiredIds);
    this.choiceCounts = Object.assign({}, choiceCounts);
    this.bag = [];          // words still to ask in this pass
    this.current = null;
    this.options = null;    // the four options for the current multiple-choice question
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
      this.options = null;
      return null;
    }
    while (this.bag.length && this.mode === "learn" && this.retired.has(this.bag[0].id)) {
      this.bag.shift();
    }
    if (this.bag.length === 0) this.refill();
    this.current = this.bag.shift();
    this.lastId = this.current.id;
    if (this.kind !== "choose") this.options = null;
    else if (this.optionsFor) this.options = this.optionsFor(this.current);
    else this.options = Engine.makeChoices(this.current, this.items, this.extraPool, 4, this.random);
    return this.current;
  }

  // Points, streak and the missed list, shared by both ways of answering.
  score(correct, word) {
    if (correct) {
      this.points += 1;
      this.right += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.wrong += 1;
      this.streak = 0;
      this.missed[word.id] = (this.missed[word.id] || 0) + 1;
    }
  }

  // Check a typed answer for the current word.
  // Returns {correct, near, retiredNow, expected, typed}. "near" = wrong, but only slightly misspelt.
  answer(typed) {
    const word = this.current;
    // An item can bring its own checks (used for "Finish the quote"); otherwise the word itself is checked.
    const correct = word.check ? word.check(typed) : Engine.isCorrect(typed, word.word);
    this.score(correct, word);
    let retiredNow = false;
    // One correct typed answer retires a word (learn mode only).
    if (correct && this.mode === "learn") {
      this.retired.add(word.id);
      retiredNow = true;
    }
    const near = !correct && (word.near ? word.near(typed) : Engine.isNear(typed, word.word));
    return { correct, near, retiredNow, expected: word.word, typed };
  }

  // Check a multiple-choice answer (the id of the word that was picked).
  // Returns {correct, retiredNow, expected, chosenId, rightSoFar, needed}.
  answerChoice(chosenId) {
    const word = this.current;
    // An item can name the id of its right option (quotes do); otherwise the item's own id is right.
    const correct = chosenId === (word.answerId || word.id);
    this.score(correct, word);
    let retiredNow = false;
    // Two right multiple-choice answers retire a word (learn mode only). A wrong answer
    // does not take away an earlier right one.
    if (this.mode === "learn") {
      if (correct) this.choiceCounts[word.id] = (this.choiceCounts[word.id] || 0) + 1;
      if ((this.choiceCounts[word.id] || 0) >= Session.CHOICES_TO_LEARN) {
        this.retired.add(word.id);
        retiredNow = correct;
      }
    }
    return {
      correct, retiredNow, expected: word.word, chosenId,
      rightSoFar: this.choiceCounts[word.id] || 0, needed: Session.CHOICES_TO_LEARN,
    };
  }

  // The words missed most in this session, worst first.
  trickiest(limit = 3) {
    return this.items
      .filter((w) => this.missed[w.id])
      .sort((a, b) => this.missed[b.id] - this.missed[a.id])
      .slice(0, limit)
      .map((w) => ({ word: w.label || w.word, times: this.missed[w.id] }));
  }
}

// A matching game: rounds of word/meaning pairs. Tap a word then its meaning (or the other way round).
// A round with no slips earns one point; any slip means the round scores nothing.
// Matching is practice only: it never retires a word.
class MatchGame {
  constructor({ items, mode, retiredIds = new Set(), size = 4, random = Math.random }) {
    this.items = items;
    this.mode = mode;
    this.retired = new Set(retiredIds);
    this.size = size;
    this.random = random;
    this.bag = [];
    this.points = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.rounds = 0;
    this.perfectRounds = 0;
    this.words = [];       // the words in this round
    this.left = [];        // the words, in the order shown on the left
    this.right = [];       // the same words, in the order their meanings are shown on the right
    this.matched = new Set();
    this.slips = 0;
    this.pending = null;   // {side: "w" or "m", id} - what the student has tapped so far
    this.slip = null;      // {wordId, meaningId} for the last wrong pair (cleared on the next tap)
    this.roundDone = false;
  }

  // Words to draw rounds from: those not yet learned (if there are enough), otherwise all.
  pool() {
    if (this.mode === "learn") {
      const open = this.items.filter((w) => !this.retired.has(w.id));
      if (open.length >= this.size) return open;
    }
    return this.items;
  }

  learnedCount() {
    return this.items.filter((w) => this.retired.has(w.id)).length;
  }

  // Start a new round. Words that mean almost the same thing (nihilism / nihilistic) never share a round.
  newRound() {
    const pool = this.pool();
    const size = Math.min(this.size, pool.length);
    const poolIds = new Set(pool.map((w) => w.id));
    this.bag = this.bag.filter((w) => poolIds.has(w.id));
    if (this.bag.length < size) {
      const inBag = new Set(this.bag.map((w) => w.id));
      this.bag = this.bag.concat(Engine.shuffle(pool.filter((w) => !inBag.has(w.id)), this.random));
    }
    const picked = [];
    const rest = [];
    for (const w of this.bag) {
      const clash = picked.some((p) => Engine.isCorrect(p.word, w.word) || Engine.isCorrect(w.word, p.word));
      if (picked.length < size && !clash) picked.push(w);
      else rest.push(w);
    }
    while (picked.length < size && rest.length) picked.push(rest.shift());
    this.bag = rest;
    this.words = picked;
    this.left = Engine.shuffle(picked, this.random);
    this.right = Engine.shuffle(picked, this.random);
    // Avoid the meanings sitting level with their own words.
    for (let tries = 0; tries < 5 && size > 2 && this.right.every((w, i) => w.id === this.left[i].id); tries++) {
      this.right = Engine.shuffle(picked, this.random);
    }
    this.matched = new Set();
    this.slips = 0;
    this.pending = null;
    this.slip = null;
    this.roundDone = false;
    return this.words;
  }

  // The student taps a word (side "w") or a meaning (side "m").
  // Returns "ignored", "selected", "unselected", "match" or "slip".
  select(side, id) {
    if (this.roundDone || this.matched.has(id)) return "ignored";
    this.slip = null;
    if (this.pending && this.pending.side === side) {
      if (this.pending.id === id) {
        this.pending = null;
        return "unselected";
      }
      this.pending = { side, id };
      return "selected";
    }
    if (!this.pending) {
      this.pending = { side, id };
      return "selected";
    }
    const wordId = side === "w" ? id : this.pending.id;
    const meaningId = side === "m" ? id : this.pending.id;
    this.pending = null;
    if (wordId === meaningId) {
      this.matched.add(wordId);
      if (this.matched.size === this.words.length) this.finish();
      return "match";
    }
    this.slips += 1;
    this.slip = { wordId, meaningId };
    return "slip";
  }

  // End of a round: one point only if there were no slips.
  finish() {
    this.roundDone = true;
    this.rounds += 1;
    if (this.slips === 0) {
      this.perfectRounds += 1;
      this.points += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.streak = 0;
    }
  }
}


// Questions about quotes ("Know it" level): who said it, which poem, pick the missing word.
// Pure functions, so they can be tested without a screen.
const QuoteTools = {
  // The words in a quote, with their positions.
  tokens(text) {
    const out = [];
    const re = /[\p{L}\p{N}]+/gu;
    let m;
    while ((m = re.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length });
    return out;
  },

  // The first word in the quote that is the gap word (ignoring capitals), or null.
  findGap(quote, gap) {
    const want = String(gap).toLowerCase();
    return QuoteTools.tokens(quote).find((t) => t.text.toLowerCase() === want) || null;
  },

  // The quote cut into pieces, with the gap word marked: [{text, gap}]. Every copy of the word is a gap.
  gapPieces(quote, gap) {
    const want = String(gap).toLowerCase();
    const pieces = [];
    let at = 0;
    for (const t of QuoteTools.tokens(quote)) {
      if (t.text.toLowerCase() !== want) continue;
      if (t.start > at) pieces.push({ text: quote.slice(at, t.start), gap: false });
      pieces.push({ text: t.text, gap: true });
      at = t.end;
    }
    if (at < quote.length) pieces.push({ text: quote.slice(at), gap: false });
    return pieces;
  },

  // How a gap word is shown as an option: lower case, unless it is a capitalised name mid-quote.
  gapLabel(quote, gap) {
    const found = QuoteTools.findGap(quote, gap);
    if (!found) return String(gap);
    const first = QuoteTools.tokens(quote)[0];
    const capital = found.text[0] !== found.text[0].toLowerCase();
    return capital && found.start !== first.start ? found.text : found.text.toLowerCase();
  },

  slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  },

  // Items for a quotes game on one text. game: "gap" or "who".
  // Each item is a quote with the right answer attached: {id, word, answerId, quote, ...}.
  items(quotes, textId, game) {
    const inText = quotes.filter((q) => q.text === textId);
    const items = [];
    for (const q of inText) {
      let answer = null;
      if (game === "gap") {
        if (q.gap_word && QuoteTools.findGap(q.quote, q.gap_word)) {
          const label = QuoteTools.gapLabel(q.quote, q.gap_word);
          answer = { id: "gap:" + label.toLowerCase(), word: label };
        }
      } else {
        const who = textId === "power-conflict" ? q.poem : q.speaker;
        if (who && who.trim()) answer = { id: "who:" + QuoteTools.slug(who), word: who.trim() };
      }
      if (!answer) continue;
      items.push({
        id: q.id, word: answer.word, answerId: answer.id, label: q.quote, definition: "",
        quote: q, note: q.note || "", texts: [textId], examples: q.note ? [q.note] : [], examples_high: [], tags: [],
      });
    }
    return items;
  },

  // Everything students can be asked about in a text (for the "X of N learned" counts).
  allItems(quotes, textId) {
    const seen = new Set();
    const all = [];
    for (const game of ["gap", "who"]) {
      for (const item of QuoteTools.items(quotes, textId, game)) {
        if (!seen.has(item.id)) { seen.add(item.id); all.push(item); }
      }
    }
    return all;
  },

  // Wrong options for a quote question: other gap words from the text, or other characters / poems.
  optionPool(quotes, textId, game, characters = []) {
    const pool = [];
    const seen = new Set();
    const add = (id, word) => {
      if (!seen.has(id)) { seen.add(id); pool.push({ id, word }); }
    };
    if (game === "gap") {
      for (const item of QuoteTools.items(quotes, textId, "gap")) add(item.answerId, item.word);
    } else {
      // (The one-off speaker "Title" is never offered as a wrong option.)
      for (const item of QuoteTools.items(quotes, textId, "who")) if (item.word !== "Title") add(item.answerId, item.word);
      if (textId !== "power-conflict") for (const name of characters) add("who:" + QuoteTools.slug(name), name);
    }
    return pool;
  },

  // A function that makes the four options for an item.
  optionsFor(pool, random = Math.random) {
    return (item) => Engine.makeChoices({ id: item.answerId, word: item.word }, pool, [], 4, random);
  },

  // ---- Master it: the core quotes (master = yes) ----

  // A quote cut in half: the start is shown, the rest is what the student types.
  splitQuote(quote) {
    const words = quote.trim().split(/\s+/);
    const cut = Math.ceil(words.length / 2);
    return { prompt: words.slice(0, cut).join(" "), rest: words.slice(cut).join(" ") };
  },

  // Do two single words count as the same? (same stem, or one small spelling slip in a longer word)
  sameWord(a, b) {
    return a === b || Engine.stem(a) === Engine.stem(b) || (a.length >= 5 && Engine.distance(a, b) <= 1);
  },

  // How many words differ between what was typed and the real ending (insert, delete or change a word).
  wordDistance(typed, expected) {
    const a = Engine.normalise(typed).split(" ").filter(Boolean);
    const b = Engine.normalise(expected).split(" ").filter(Boolean);
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = QuoteTools.sameWord(a[i - 1], b[j - 1]) ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    return d[a.length][b.length];
  },

  // "right" if the ending is close enough (about 1 word in 7 may be off), "near" for a fair attempt, else "wrong".
  checkEnding(typed, expected) {
    if (!Engine.normalise(typed)) return "wrong";
    const n = Engine.normalise(expected).split(" ").filter(Boolean).length;
    const slips = QuoteTools.wordDistance(typed, expected);
    if (slips <= Math.floor(n * 0.15)) return "right";
    if (slips <= Math.floor(n * 0.35)) return "near";
    return "wrong";
  },

  // The techniques a quote is labelled with, best first (word types like "Verb" come last).
  techniqueChoices(q, techniques) {
    // Terms marked spot: false (Theme, Speaker, Act...) are never offered or used as the answer.
    const info = Object.fromEntries(techniques.filter((t) => t.spot !== false).map((t) => [t.name, t]));
    const names = (q.technique_matches || []).filter((n) => info[n]);
    const plain = names.filter((n) => info[n].category !== "Word types");
    return plain.length ? plain : names;
  },

  // Items for a Master it game. game: "mgap" (type the missing word), "mfinish" (type the ending),
  // "mtech" (choose the technique). Ids start with mg: / mf: / mt: so progress is kept separately
  // from the Know it level.
  masterItems(quotes, textId, game, techniques = []) {
    const items = [];
    for (const q of quotes) {
      if (q.text !== textId || !q.master) continue;
      const base = { label: q.quote, definition: "", quote: q, note: q.note || "", texts: [textId], examples: q.note ? [q.note] : [], examples_high: [], tags: [] };
      if (game === "mgap") {
        if (q.gap_word && QuoteTools.findGap(q.quote, q.gap_word)) {
          items.push({ ...base, id: "mg:" + q.id, word: QuoteTools.gapLabel(q.quote, q.gap_word) });
        }
      } else if (game === "mfinish") {
        if (q.quote.trim().split(/\s+/).length >= 6) {
          const { prompt, rest } = QuoteTools.splitQuote(q.quote);
          items.push({
            ...base, id: "mf:" + q.id, word: rest, prompt, rest,
            check: (typed) => QuoteTools.checkEnding(typed, rest) === "right",
            near: (typed) => QuoteTools.checkEnding(typed, rest) === "near",
          });
        }
      } else if (game === "mtech") {
        if (QuoteTools.techniqueChoices(q, techniques).length) {
          const analysis = (q.technique_notes || []).find(Boolean);
          items.push({ ...base, id: "mt:" + q.id, word: "", examples: analysis ? [analysis] : base.examples });
        }
      }
    }
    return items;
  },

  // Wrong options for "Spot the technique": other techniques, preferring the same kind
  // (sound, structural, poetic...), never one the quote is labelled with.
  techOptionsFor(allTechniques, random = Math.random) {
    const techniques = allTechniques.filter((t) => t.spot !== false);
    return (item) => {
      const choices = QuoteTools.techniqueChoices(item.quote, techniques);
      const pick = choices[Math.floor(random() * choices.length)];
      const chosen = techniques.find((t) => t.name === pick);
      item.word = pick;
      item.answerId = "tech:" + QuoteTools.slug(pick);
      const labelled = new Set(item.quote.technique_matches || []);
      const as = (t) => ({ id: "tech:" + QuoteTools.slug(t.name), word: t.name });
      const others = techniques.filter((t) => t.name !== pick && !labelled.has(t.name));
      const sameKind = others.filter((t) => t.category === chosen.category).map(as);
      const rest = others.filter((t) => t.category !== chosen.category).map(as);
      return Engine.makeChoices({ id: item.answerId, word: pick }, sameKind, rest, 4, random);
    };
  },
};

