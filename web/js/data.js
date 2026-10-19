// Loads the JSON files made by build_data.py.
const Data = {
  texts: [],
  vocab: [],
  quotes: [],
  techniques: [],
  sets: [],

  async load() {
    const get = (name) =>
      fetch(`data/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${name}.json`);
        return r.json();
      });
    [this.texts, this.vocab, this.quotes, this.techniques, this.characters, this.sets] = await Promise.all([
      get("texts"), get("vocab"), get("quotes"), get("techniques"), get("characters"), get("sets"),
    ]);
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

  STEP_NAMES: { choose: "Choose it", match: "Match it", type: "Type the gap", finish: "Finish the quote" },

  // The steps of a set's lesson, in order, each with the items it asks about.
  // A step with nothing to ask is left out (e.g. Match it needs two or more key vocab words).
  lessonSteps(set) {
    const quoteIds = new Set(set.quotes);
    const words = set.vocab.map((id) => this.vocab.find((w) => w.id === id)).filter(Boolean);
    const gapItems = QuoteTools.lessonQuoteItems(this.quotes, set.text, quoteIds);
    const typed = QuoteTools.masterItems(this.quotes, set.text, "mgap", this.techniques, quoteIds);
    const finish = QuoteTools.masterItems(this.quotes, set.text, "mfinish", this.techniques, quoteIds);
    const steps = [
      { key: "choose", items: [...gapItems, ...words] },
      { key: "match", items: words.length >= 2 ? words : [] },
      { key: "type", items: typed },
      { key: "finish", items: finish },
    ];
    return steps.filter((s) => s.items.length).map((s) => ({ ...s, name: this.STEP_NAMES[s.key] }));
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

  // How far a student is through a set: each step is done when everything in it is learned
  // (Match it is done once its flag is saved).
  lessonProgress(set, retired, flags) {
    const steps = this.lessonSteps(set).map((step) => {
      const learned = step.items.filter((i) => retired.has(i.id)).length;
      const done = step.key === "match" ? !!(flags[set.id] && flags[set.id].match) : learned === step.items.length;
      return { key: step.key, name: step.name, total: step.items.length, learned, done };
    });
    const doneCount = steps.filter((s) => s.done).length;
    return { steps, done: doneCount, total: steps.length, complete: steps.length > 0 && doneCount === steps.length };
  },
};
