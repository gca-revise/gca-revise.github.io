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
          texts: [],
          examples: [],
          examples_high: [],
          tags: [],
        }));
    }
    return this._techniqueItems;
  },

  // The words (or techniques) to practise for a text.
  itemsFor(textId) {
    return textId === "techniques" ? this.techniqueItems() : this.wordsFor(textId);
  },

  wordsFor(textId) {
    return this.vocab.filter((w) => w.texts.includes(textId));
  },

  quotesFor(textId) {
    return this.quotes.filter((q) => q.text === textId);
  },
};
