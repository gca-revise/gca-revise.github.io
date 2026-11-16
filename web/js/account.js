// Optional sign-in (school email + a password the teacher hands out), so progress follows a
// student from computer to computer. Accounts are made by the teacher with make_accounts.py;
// nobody can sign up on the site.
// Hidden from everyone unless this browser has been switched on by visiting  /?signin=on
// (turn off again with /?signin=off). Nobody who is not signed in sees any change.
// The key below is the public (publishable) one; it is safe to keep in the repo.
const Account = {
  URL: "https://flfywjedhwbvdiukvkoo.supabase.co",
  KEY: "sb_publishable_Sc4qcjCbhrzajryE78W8eA_EZ0dI7NS",
  FLAG: "gca-signin",
  MIN_PASSWORD: 10,

  client: null,
  user: null,
  message: "",
  pushTimer: null,

  init() {
    const flag = new URLSearchParams(location.search).get("signin");
    try {
      if (flag === "on") localStorage.setItem(this.FLAG, "1");
      if (flag === "off") localStorage.removeItem(this.FLAG);
      this.enabled = localStorage.getItem(this.FLAG) === "1";
    } catch (e) {
      this.enabled = false;
    }
    if (!this.enabled || !window.supabase) return;
    this.client = window.supabase.createClient(this.URL, this.KEY);
    this.client.auth.onAuthStateChange((event, session) => {
      const was = this.user && this.user.id;
      this.user = session ? session.user : null;
      if (this.user && this.user.id !== was) {
        // Defer: calling the database from inside this callback can freeze the sign-in library.
        setTimeout(() => this.pullAndMerge(), 0);
      } else if (!this.user) {
        this.draw();
      }
    });
  },

  // Joins two saved states: nothing learned on either device is lost.
  merge(a, b) {
    const out = { ...a, ...b, stats: {} };
    out.retired = Array.from(new Set([...(a.retired || []), ...(b.retired || [])]));
    // Lesson steps saved as done (Match it) from either side are kept.
    const lessons = {};
    for (const side of [a.lessons || {}, b.lessons || {}]) {
      for (const [setId, flags] of Object.entries(side)) lessons[setId] = Object.assign({}, lessons[setId], flags);
    }
    if (Object.keys(lessons).length) out.lessons = lessons;
    if (a.pts || b.pts) out.pts = Points.merge(a.pts, b.pts);
    for (const id of new Set([...Object.keys(a.stats || {}), ...Object.keys(b.stats || {})])) {
      const x = (a.stats || {})[id] || {};
      const y = (b.stats || {})[id] || {};
      const entry = { right: Math.max(x.right || 0, y.right || 0), wrong: Math.max(x.wrong || 0, y.wrong || 0) };
      const choice = Math.max(x.choiceRight || 0, y.choiceRight || 0);
      if (choice) entry.choiceRight = choice;
      out.stats[id] = entry;
    }
    return out;
  },

  async pullAndMerge() {
    const { data, error } = await this.client.from("user_progress").select("state").eq("user_id", this.user.id).maybeSingle();
    if (error) {
      this.message = "Signed in, but could not load your saved progress. Try refreshing the page.";
      if (typeof route === "function") route();
      return;
    }
    const merged = this.merge(Store.load(), (data && data.state) || {});
    Store.save(merged, true);
    await this.push(merged);
    this.message = "";
    if (typeof route === "function") route();
  },

  async push(state) {
    if (!this.user) return;
    await this.client.from("user_progress").upsert({ user_id: this.user.id, state, updated_at: new Date().toISOString() });
  },

  // Called by Store.save after each save; waits a moment so a quick run of answers is one upload.
  queuePush(state) {
    if (!this.user) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.push(state), 1500);
  },

  // Turn the sign-in library's errors into plain English (its own text is never shown).
  explain(error) {
    const code = (error && (error.code || "")) + " " + ((error && error.message) || "");
    const text = code.toLowerCase();
    if (error && error.status === 429 || text.includes("rate") || text.includes("too many")) {
      return "Too many tries. Wait a few minutes, then try again.";
    }
    if (text.includes("invalid") && text.includes("credential")) {
      return "That email and password do not match. Check them, or ask your teacher.";
    }
    if (text.includes("same_password") || text.includes("different from the old")) {
      return "That is the password you already have. Choose a new one.";
    }
    if (text.includes("weak") || text.includes("password should")) {
      return `Choose a stronger password: at least ${this.MIN_PASSWORD} characters, with capital letters, small letters and a number.`;
    }
    if (text.includes("fetch") || text.includes("network")) {
      return "Could not reach the server. Check the internet connection and try again.";
    }
    return "That did not work. Please try again, or ask your teacher.";
  },

  async signIn(email, password) {
    if (!email || !password) {
      this.say("Type your school email and your password.");
      return;
    }
    this.say("Signing in...");
    const { error } = await this.client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      this.say(this.explain(error));
      return;
    }
    // The sign-in watcher (in init) loads and merges the progress, then redraws the page.
    this.message = "";
    location.hash = "#/";
  },

  async changePassword(password, again) {
    if (password.length < this.MIN_PASSWORD || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      this.say(`Your new password needs at least ${this.MIN_PASSWORD} characters, with capital letters, small letters and a number.`);
      return;
    }
    if (password !== again) {
      this.say("The two passwords are not the same. Type them again.");
      return;
    }
    this.say("Saving your new password...");
    const { error } = await this.client.auth.updateUser({ password });
    this.say(error ? this.explain(error) : "Done. Use your new password next time you sign in.");
    if (!error) document.querySelectorAll("[data-account-form] input[type=password]").forEach((box) => { box.value = ""; });
  },

  // Signing out uploads the latest progress, then clears this computer's copy,
  // so the next person on a shared computer does not start with it.
  async signOut() {
    clearTimeout(this.pushTimer);
    try {
      await this.push(Store.load());
    } catch (e) {
      // Not saved this time; the account keeps what it had.
    }
    await this.client.auth.signOut({ scope: "local" });
    this.user = null;
    Store.reset();
    this.message = "Signed out. Your progress is safe in your account.";
    location.hash = "#/";
    if (typeof route === "function") route();
  },

  // Show a line on the sign-in screen without redrawing it (keeps what was typed).
  say(text) {
    this.message = text;
    const line = document.querySelector("[data-account-msg]");
    if (line) line.textContent = text;
  },

  // The line in the home screen footer.
  html() {
    if (!this.enabled || !this.client) return "";
    if (this.user) {
      return `<span class="account" data-account>Signed in: your progress is saved to your account. <a class="link-btn" href="#/account">Account</a></span>`;
    }
    const note = this.message ? `<br><span class="account-msg">${esc(this.message)}</span>` : "";
    return `<span class="account" data-account><a class="link-btn" href="#/account">Sign in to save your progress</a>${note}</span>`;
  },

  // Redraw just the sign-in area (keeps the rest of the page as it is).
  draw() {
    const slot = document.querySelector("[data-account]");
    if (slot) slot.outerHTML = this.html();
  },

  // The "#/account" screen: sign in, or (once signed in) change password and sign out.
  screen() {
    const head = (title, sub) => `
      <header class="page-head" style="--accent:#222C69;--tint:#E3E7F6">
        <div class="wrap head-inner">
          <div class="head-top">
            <a class="back" href="#/" aria-label="Back to all texts">${backIcon}</a>
            <a class="brand-link" href="#/" aria-label="GCA Revise home">
              <img class="crest-small" src="img/crest.png" alt="School crest">
              <span class="head-brand">GCA Revise</span>
            </a>
          </div>
          <h1>${title}</h1>
          <p class="sub">${sub}</p>
        </div>
      </header>`;
    const msg = `<p class="backup-msg" data-account-msg role="status">${esc(this.message)}</p>`;
    if (!this.enabled || !this.client) {
      return head("Sign in", "Not available yet.") + `<main class="wrap"><section class="card backup-card"><p>Sign-in is not switched on yet. Your progress is saved on this computer.</p></section></main>`;
    }
    if (this.user) {
      return head("Your account", "Your progress is saved to your account.") + `
      <main class="wrap">
        <section class="card backup-card">
          <h2>Signed in</h2>
          <p>Signed in as <strong>${esc(this.user.email || "")}</strong>.</p>
          <div class="pills"><button type="button" class="pill primary" data-signout>Sign out</button></div>
          <p class="backup-note">On a shared computer, always sign out when you finish.</p>
        </section>
        <section class="card backup-card">
          <h2>Change my password</h2>
          <form class="account-form" data-account-form="change">
            <label>New password<input class="account-input" type="password" name="password" autocomplete="new-password" required></label>
            <label>Type it again<input class="account-input" type="password" name="again" autocomplete="new-password" required></label>
            <button type="submit" class="pill primary">Save new password</button>
          </form>
          <p class="backup-note">At least ${this.MIN_PASSWORD} characters, with capital letters, small letters and a number.</p>
          ${msg}
        </section>
      </main>`;
    }
    return head("Sign in", "Save your progress, whichever computer you use.") + `
      <main class="wrap">
        <section class="card backup-card">
          <form class="account-form" data-account-form="signin">
            <label>School email<input class="account-input" type="email" name="email" autocomplete="username" required></label>
            <label>Password<input class="account-input" type="password" name="password" autocomplete="current-password" required></label>
            <button type="submit" class="pill primary">Sign in</button>
          </form>
          ${msg}
          <p class="backup-note">Your teacher gives you your password. Forgotten it? Ask your teacher for a new one.</p>
        </section>
      </main>`;
  },
};

Account.init();

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-signout]")) Account.signOut();
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-account-form]");
  if (!form) return;
  event.preventDefault();
  const f = form.elements;
  if (form.dataset.accountForm === "signin") Account.signIn(f.email.value, f.password.value);
  else Account.changePassword(f.password.value, f.again.value);
});
