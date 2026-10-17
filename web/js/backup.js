// "Save or restore my progress": a short code (or a file) the student keeps and pastes back later.
// Nothing is sent anywhere. The code holds only learned items and right/wrong counts, no names.
const Backup = {
  PREFIX: "GCA1:",

  // Text <-> bytes <-> web-safe text.
  toBase64Url(bytes) {
    let text = "";
    bytes.forEach((b) => { text += String.fromCharCode(b); });
    return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },

  fromBase64Url(text) {
    const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  },

  async squash(bytes, direction) {
    const stream = new Blob([bytes]).stream().pipeThrough(
      direction === "in" ? new CompressionStream("deflate-raw") : new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  },

  // The saved state in its smallest form: learned ids, and [right, wrong, choiceRight] per id.
  pack(state) {
    const stats = {};
    for (const [id, s] of Object.entries(state.stats || {})) stats[id] = [s.right || 0, s.wrong || 0, s.choiceRight || 0];
    return { v: 1, r: state.retired || [], s: stats };
  },

  // Checks a restored code really is progress data, and turns it back into a saved state.
  // Returns null if it is not.
  unpack(data) {
    if (!data || data.v !== 1 || !Array.isArray(data.r) || typeof data.s !== "object" || !data.s) return null;
    const goodId = (id) => typeof id === "string" && id.length > 0 && id.length <= 120;
    const goodCount = (n) => Number.isInteger(n) && n >= 0 && n <= 100000;
    if (!data.r.every(goodId)) return null;
    const stats = {};
    for (const [id, s] of Object.entries(data.s)) {
      if (!goodId(id) || !Array.isArray(s) || s.length !== 3 || !s.every(goodCount)) return null;
      stats[id] = { right: s[0], wrong: s[1] };
      if (s[2]) stats[id].choiceRight = s[2];
    }
    return { retired: Array.from(new Set(data.r)), stats };
  },

  // The student's progress as one line of text.
  async makeCode() {
    const json = JSON.stringify(this.pack(Store.load()));
    const bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream === "undefined") return "GCA0:" + this.toBase64Url(bytes);
    return this.PREFIX + this.toBase64Url(await this.squash(bytes, "in"));
  },

  // Turns pasted text back into a state, or null if it is not a code from this site.
  async readCode(text) {
    const code = String(text || "").replace(/\s+/g, "");
    try {
      let bytes;
      if (code.startsWith("GCA0:")) {
        bytes = this.fromBase64Url(code.slice(5));
      } else if (code.startsWith(this.PREFIX)) {
        if (typeof DecompressionStream === "undefined") return null;
        bytes = await this.squash(this.fromBase64Url(code.slice(this.PREFIX.length)), "out");
      } else {
        return null;
      }
      return this.unpack(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (e) {
      return null;
    }
  },

  // Adds restored progress to what is already on this device; nothing learned is ever lost.
  restore(restored) {
    const merged = Account.merge(Store.load(), restored);
    Store.save(merged);
    return merged;
  },

  screen() {
    return `
      <header class="page-head" style="--accent:#222C69;--tint:#E3E7F6">
        <div class="wrap head-inner">
          <div class="head-top">
            <a class="back" href="#/" aria-label="Back to all texts">${backIcon}</a>
            <a class="brand-link" href="#/" aria-label="GCA Revise home">
              <img class="crest-small" src="img/crest.png" alt="School crest">
              <span class="head-brand">GCA Revise</span>
            </a>
          </div>
          <h1>Save or restore your progress</h1>
          <p class="sub">Keep your progress safe if you change computer.</p>
        </div>
      </header>
      <main class="wrap">
        <section class="card backup-card">
          <h2>Why do this?</h2>
          <p>Your progress is saved on <strong>this computer only</strong>. If you use another computer, or this one is cleared, you would start again. Save your code now, keep it somewhere safe (your notes, or an email to yourself), then paste it back whenever you need it.</p>
        </section>
        <section class="card backup-card">
          <h2>1. Save</h2>
          <textarea id="backup-code" class="backup-box" rows="4" readonly aria-label="Your progress code" placeholder="Making your code..."></textarea>
          <div class="pills">
            <button type="button" class="pill primary" data-backup="copy">Copy my code</button>
            <button type="button" class="pill" data-backup="download">Save as a file</button>
          </div>
          <p class="backup-msg" id="backup-save-msg" role="status"></p>
        </section>
        <section class="card backup-card">
          <h2>2. Restore</h2>
          <textarea id="backup-paste" class="backup-box" rows="4" aria-label="Paste your progress code here" placeholder="Paste your code here"></textarea>
          <div class="pills">
            <button type="button" class="pill primary" data-backup="restore">Restore from code</button>
            <label class="pill backup-file">Restore from a file<input type="file" id="backup-file" accept=".txt,text/plain" hidden></label>
          </div>
          <p class="backup-msg" id="backup-restore-msg" role="status"></p>
          <p class="backup-note">Restoring adds to what is on this computer. Nothing you have already learned is lost.</p>
        </section>
      </main>`;
  },

  // Called after the screen is drawn: fills in the code box.
  async fillCode() {
    const box = document.getElementById("backup-code");
    if (box) box.value = await this.makeCode();
  },

  say(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  async handleRestore(text) {
    const restored = await this.readCode(text);
    if (!restored) {
      this.say("backup-restore-msg", "That doesn’t look like a code from this site. Check you copied all of it.");
      return;
    }
    const merged = this.restore(restored);
    this.say("backup-restore-msg", `Restored. You have now learned ${plural((merged.retired || []).length, "item")} on this computer.`);
    this.fillCode();
  },
};

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-backup]");
  if (!button) return;
  const action = button.dataset.backup;
  if (action === "copy") {
    const box = document.getElementById("backup-code");
    if (!box || !box.value) return;
    try {
      await navigator.clipboard.writeText(box.value);
      Backup.say("backup-save-msg", "Copied. Paste it somewhere safe.");
    } catch (e) {
      box.select();
      Backup.say("backup-save-msg", "Select the code above and copy it yourself (Ctrl+C).");
    }
  } else if (action === "download") {
    const box = document.getElementById("backup-code");
    if (!box || !box.value) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([box.value], { type: "text/plain" }));
    link.download = "gca-revise-progress.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    Backup.say("backup-save-msg", "Saved as a file. Keep it somewhere you can find it.");
  } else if (action === "restore") {
    Backup.handleRestore(document.getElementById("backup-paste").value);
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.id !== "backup-file" || !event.target.files[0]) return;
  Backup.handleRestore(await event.target.files[0].text());
  event.target.value = "";
});
