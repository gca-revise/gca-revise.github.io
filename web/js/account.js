// Optional sign-in, so progress follows a person from device to device.
// Hidden from everyone unless this browser has been switched on by visiting  /?signin=on
// (turn off again with /?signin=off). Nobody who is not signed in sees any change.
// The key below is the public (publishable) one; it is safe to keep in the repo.
const Account = {
  URL: "https://flfywjedhwbvdiukvkoo.supabase.co",
  KEY: "sb_publishable_Sc4qcjCbhrzajryE78W8eA_EZ0dI7NS",
  FLAG: "gca-signin",

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
    // "pkce" makes the email link come back as ?code=..., which does not clash with the #/ page addresses.
    this.client = window.supabase.createClient(this.URL, this.KEY, { auth: { flowType: "pkce" } });
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
      this.message = "Signed in, but could not load saved progress.";
      this.draw();
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

  async sendLink(email) {
    this.message = "Sending...";
    this.draw();
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.origin + location.pathname },
    });
    this.message = error ? "Could not send the link. Check the address and try again." : "Check your email and click the link. You can close this tab.";
    this.draw();
  },

  async signOut() {
    await this.client.auth.signOut();
    this.user = null;
    this.message = "";
    if (typeof route === "function") route();
  },

  html() {
    if (!this.enabled || !this.client) return "";
    if (this.user) {
      return `<span class="account" data-account>Signed in. Your progress is saved to your account. <button type="button" class="link-btn" data-signout>Sign out</button></span>`;
    }
    return `<span class="account" data-account><form data-signin-form><input type="email" name="email" placeholder="Your email" required aria-label="Your email"> <button type="submit" class="link-btn">Email me a sign-in link</button></form><span class="account-msg">${this.message}</span></span>`;
  },

  // Redraw just the sign-in area (keeps the rest of the page as it is).
  draw() {
    const slot = document.querySelector("[data-account]");
    if (slot) slot.outerHTML = this.html();
  },
};

Account.init();

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-signin-form]");
  if (!form) return;
  event.preventDefault();
  Account.sendLink(form.elements.email.value.trim());
});
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-signout]")) Account.signOut();
});
