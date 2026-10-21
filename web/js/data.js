// Loads the JSON files made by build_data.py.
const Data = {
  texts: [],
  vocab: [],
  quotes: [],
  techniques: [],
  sets: [],
  models: [],

  async load() {
    const get = (name) =>
      fetch(`data/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${name}.json`);
        return r.json();
      });
    [this.texts, this.vocab, this.quotes, this.techniques, this.characters, this.sets, this.models] = await Promise.all([
      get("texts"), get("vocab"), get("quotes"), get("techniques"), get("characters"), get("sets"), get("models"),
    ]);
  },

  // The teacher's model paragraphs that use a quote (usually none).
  modelsFor(quoteId) {
    return this.models.filter((m) => m.quotes.includes(quoteId));
  },

  // "techniques" is treated like a text so the same games work on it.
  text(id) {
    if (id === "techniques") return { id: "techniques", name: "Techniques" };
    return this.texts.find((t) => t.id === id);
  },

  // The techniques in the same shape as words, so the games can use them.
  techniqueItems() {
    if (!this._techniqueItems) {
      this._techniqueItems = this.techniques
        .filter((t) => t.name && t.definition)
        .map((t) => ({
          id: "tech-" + t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          word: t.name,
          definition: t.definition,
          category: t.category,
          inQuotes: t.in_quotes,
          effect: t.effect || "",
          texts: [],
          examples: t.example ? [t.example] : [],
          examples_high: [],
          tags: [],
        }));
    }
    return this._techniqueItems;
  },

  // The sets on the Techniques screen: everything, the ones named in the quotes, then each category.
  techniqueSets() {
    const items = this.techniqueItems();
    const sets = [
      { id: "all", name: "All techniques", items },
      { id: "quotes", name: "In your quotes", items: items.filter((t) => t.inQuotes > 0) },
    ];
    const order = ["Literary techniques", "Advanced literary techniques", "Sound techniques", "Structural techniques",
      "Poetic techniques", "Rhetorical devices", "Dramatic devices", "Word types", "From lessons"];
    for (const category of order) {
      const inCategory = items.filter((t) => t.category === category);
      if (inCategory.length) {
        sets.push({ id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: category, items: inCategory });
      }
    }
    return sets;
  },

  techniqueSet(setId) {
    const sets = this.techniqueSets();
    return sets.find((s) => s.id === setId) || sets[0];
  },

  // The words (or techniques) to practise for a text (or a technique set).
  itemsFor(textId, setId) {
    return textId === "techniques" ? this.techniqueSet(setId).items : this.wordsFor(textId);
  },

  wordsFor(textId) {
    return this.vocab.filter((w) => w.texts.includes(textId));
  },

  // The quotes a student can be asked about in a text, and the questions for a quotes game.
  quoteItemsAll(textId) {
    return QuoteTools.allItems(this.quotes, textId);
  },

  quoteGame(textId, game) {
    const pool = QuoteTools.optionPool(this.quotes, textId, game, (this.characters || {})[textId] || []);
    return {
      items: QuoteTools.items(this.quotes, textId, game),
      optionsFor: QuoteTools.optionsFor(pool),
    };
  },

  // Master it games (core quotes): "mgap", "mfinish" (both typed) and "mtech" (multiple choice).
  masterGame(textId, game) {
    return {
      items: QuoteTools.masterItems(this.quotes, textId, game, this.techniques),
      optionsFor: game === "mtech" ? QuoteTools.techOptionsFor(this.techniques) : null,
    };
  },

  // How many core quotes are mastered: every Master it task a quote has must be learned.
  masterProgress(textId, retired) {
    const tasks = {};
    const games = {};
    for (const game of ["mgap", "mfinish", "mtech"]) {
      const items = QuoteTools.masterItems(this.quotes, textId, game, this.techniques);
      games[game] = { done: items.filter((i) => retired.has(i.id)).length, total: items.length };
      for (const item of items) {
        (tasks[item.quote.id] = tasks[item.quote.id] || []).push(item.id);
      }
    }
    const quoteIds = Object.keys(tasks);
    const mastered = quoteIds.filter((id) => tasks[id].every((t) => retired.has(t))).length;
    // Steps done across all three games, so the bar moves as each game is finished.
    const stepsDone = Object.values(games).reduce((n, g) => n + g.done, 0);
    const stepsTotal = Object.values(games).reduce((n, g) => n + g.total, 0);
    return { mastered, total: quoteIds.length, games, stepsDone, stepsTotal };
  },

  quotesFor(textId) {
    return this.quotes.filter((q) => q.text === textId);
  },

  // ---- Sets (lessons by character or theme) ----

  setsFor(textId) {
    return this.sets.filter((s) => s.text === textId);
  },

  setById(id) {
    return this.sets.find((s) => s.id === id);
  },

  // The sections a lesson is shown as (each holds one or more parts, played one after the other).
  SECTION_NAMES: { choose: "Choose it", qmatch: "Match the quote", type: "Type the gap", typeit: "Type it" },
  PART_SECTION: { choose: "choose", match: "choose", qmatch: "qmatch", type: "type", finish: "typeit", typeword: "typeit" },

  // The labels a quote can be matched to: who said it, and where it is from.
  quoteWho(q) {
    return q.text === "power-conflict" ? "" : (q.speaker || "").trim();
  },
  quoteWhere(q) {
    if (q.poem) return q.poem;
    if (q.act) return `Act ${q.act}${q.scene ? " Scene " + q.scene : ""}`;
    if (q.chapter && q.chapter !== "Various") return /^\d+$/.test(q.chapter) ? "Chapter " + q.chapter : q.chapter;
    return "";
  },

  // Items for "Match the quote": each quote is paired with whichever of who-said-it / where-it-is-from
  // is the less shared in this set (so the pairs are easier to tell apart). The label is shown on the left.
  quoteMatchItems(quotes) {
    const count = (list) => list.reduce((m, l) => (l ? m.set(l, (m.get(l) || 0) + 1) : m), new Map());
    const who = count(quotes.map((q) => this.quoteWho(q)));
    const where = count(quotes.map((q) => this.quoteWhere(q)));
    const items = [];
    for (const q of quotes) {
      const a = this.quoteWho(q), b = this.quoteWhere(q);
      const useWho = a && (!b || who.get(a) < where.get(b));
      const label = useWho ? a : b;
      if (label) items.push({ id: "qm:" + q.id, word: label, definition: q.quote, quote: q, kind: useWho ? "who" : "where" });
    }
    return new Set(items.map((i) => i.word)).size >= 2 ? items : [];
  },

  // The parts of a set's lesson, in order, each with the items it asks about. A part with nothing to ask
  // is left out (e.g. the vocab match needs two or more key words). Parts are grouped into sections:
  //   1 Choose it (multiple choice, then match the key vocab)   2 Match the quote
  //   3 Type the gap                                            4 Type it (finish the quote, then type the key vocab)
  // `flag` marks a part saved as done by a flag (matching never retires anything).
  lessonSteps(set) {
    const quoteIds = new Set(set.quotes);
    const words = set.vocab.map((id) => this.vocab.find((w) => w.id === id)).filter(Boolean);
    const setQuotes = this.quotes.filter((q) => q.text === set.text && quoteIds.has(q.id));
    const gapItems = QuoteTools.lessonQuoteItems(this.quotes, set.text, quoteIds);
    const typed = QuoteTools.masterItems(this.quotes, set.text, "mgap", this.techniques, quoteIds);
    const finish = QuoteTools.masterItems(this.quotes, set.text, "mfinish", this.techniques, quoteIds);
    const parts = [
      { key: "choose", items: [...gapItems, ...words] },
      { key: "match", items: words.length >= 2 ? words : [], flag: "match" },
      { key: "qmatch", items: this.quoteMatchItems(setQuotes), flag: "qmatch" },
      { key: "type", items: typed },
      { key: "finish", items: finish },
      // Key vocab typed from the meaning. Own ids (tv:), so choosing a word never skips typing it.
      { key: "typeword", items: words.map((w) => ({ ...w, id: "tv:" + w.id })) },
    ].filter((x) => x.items.length);
    const order = [];
    for (const x of parts) {
      x.sectionId = this.PART_SECTION[x.key];
      if (!order.includes(x.sectionId)) order.push(x.sectionId);
    }
    return parts.map((x, i) => {
      const section = order.indexOf(x.sectionId);
      const next = parts[i + 1];
      return {
        ...x, section, sections: order.length, sectionName: this.SECTION_NAMES[x.sectionId],
        next: next ? next.key : null,
        nextSame: !!next && this.PART_SECTION[next.key] === x.sectionId,
        nextName: next ? this.SECTION_NAMES[this.PART_SECTION[next.key]] : "",
      };
    });
  },

  // Options for the Choose it step: quotes get their gap-word options, vocab gets other words of the text.
  lessonChooseOptions(textId) {
    const chars = (this.characters || {})[textId] || [];
    const quoteOptions = QuoteTools.variantOptionsFor(
      QuoteTools.optionPool(this.quotes, textId, "gap", chars),
      QuoteTools.optionPool(this.quotes, textId, "who", chars),
    );
    const words = this.wordsFor(textId);
    return (item) => (item.quote ? quoteOptions(item) : Engine.makeChoices(item, words, [], 4));
  },

  // A quote or key word from an item id used in the games (mg:, mf:, qm:, tv: are prefixes of the quote and
  // typed-word ids); null if it is neither (e.g. a technique).
  entryFor(id) {
    const bare = String(id).replace(/^(mg|mf|qm|tv):/, "");
    const quote = this.quotes.find((q) => q.id === bare);
    if (quote) return { quote };
    const word = this.vocab.find((w) => w.id === bare);
    return word ? { word } : null;
  },

  // How far a student is through a set, section by section. A part is done when everything in it is
  // learned (matching parts are done once their flag is saved); a section is done when all its parts are.
  // `key` is the part to start or continue from.
  lessonProgress(set, retired, flags) {
    const parts = this.lessonSteps(set);
    const saved = flags[set.id] || {};
    const sections = [];
    for (const part of parts) {
      let sec = sections[part.section];
      if (!sec) sec = sections[part.section] = { id: part.sectionId, name: part.sectionName, total: 0, learned: 0, done: true, key: null, parts: [] };
      const learned = part.flag ? (saved[part.flag] ? part.items.length : 0) : part.items.filter((i) => retired.has(i.id)).length;
      const done = learned === part.items.length;
      sec.total += part.items.length;
      sec.learned += learned;
      sec.parts.push(part.key);
      if (!done) {
        sec.done = false;
        if (!sec.key) sec.key = part.key;
      }
    }
    for (const sec of sections) if (!sec.key) sec.key = sec.parts[0];
    const doneCount = sections.filter((x) => x.done).length;
    return { steps: sections, done: doneCount, total: sections.length, complete: sections.length > 0 && doneCount === sections.length };
  },
};
