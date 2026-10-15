// Loads the JSON files made by build_data.py.
const Data = {
  texts: [],
  vocab: [],
  quotes: [],
  techniques: [],

  async load() {
    const get = (name) =>
      fetch(`data/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`Could not load ${name}.json`);
        return r.json();
      });
    [this.texts, this.vocab, this.quotes, this.techniques] = await Promise.all([
      get("texts"), get("vocab"), get("quotes"), get("techniques"),
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

  quotesFor(textId) {
    return this.quotes.filter((q) => q.text === textId);
  },
};
