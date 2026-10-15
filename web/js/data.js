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

  text(id) {
    return this.texts.find((t) => t.id === id);
  },

  wordsFor(textId) {
    return this.vocab.filter((w) => w.texts.includes(textId));
  },

  quotesFor(textId) {
    return this.quotes.filter((q) => q.text === textId);
  },
};
