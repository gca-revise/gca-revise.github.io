// A short "ding" for a right answer, made in the browser (no sound file to download).
// The Sound button (at the foot of every screen) turns it on or off; the choice is kept on this device.
const Sound = {
  context: null,

  enabled() {
    return Store.getSound();
  },

  // Browsers only allow sound after a tap or key press, so the sound system starts on first use.
  audio() {
    if (!this.context) {
      const Maker = window.AudioContext || window.webkitAudioContext;
      if (!Maker) return null;
      this.context = new Maker();
    }
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  },

  // Two quick rising notes, soft enough for a classroom.
  ding() {
    if (!this.enabled()) return;
    try {
      const ctx = this.audio();
      if (!ctx) return;
      const start = ctx.currentTime;
      [[880, 0], [1318.5, 0.1]].forEach(([pitch, delay]) => {
        const tone = ctx.createOscillator();
        const volume = ctx.createGain();
        tone.type = "sine";
        tone.frequency.value = pitch;
        volume.gain.setValueAtTime(0.0001, start + delay);
        volume.gain.exponentialRampToValueAtTime(0.12, start + delay + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.45);
        tone.connect(volume).connect(ctx.destination);
        tone.start(start + delay);
        tone.stop(start + delay + 0.5);
      });
    } catch (e) {
      // Sound is a nice extra; carry on without it.
    }
  },

  // A longer rising run of notes for a streak milestone.
  cheer() {
    if (!this.enabled()) return;
    try {
      const ctx = this.audio();
      if (!ctx) return;
      const start = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((pitch, i) => {
        const delay = i * 0.09;
        const tone = ctx.createOscillator();
        const volume = ctx.createGain();
        tone.type = "triangle";
        tone.frequency.value = pitch;
        volume.gain.setValueAtTime(0.0001, start + delay);
        volume.gain.exponentialRampToValueAtTime(0.12, start + delay + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.0001, start + delay + (i === 3 ? 0.9 : 0.35));
        tone.connect(volume).connect(ctx.destination);
        tone.start(start + delay);
        tone.stop(start + delay + 1);
      });
    } catch (e) {
      // Sound is a nice extra; carry on without it.
    }
  },

  // The speaker button.
  buttonHtml() {
    const on = this.enabled();
    const icon = on
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5z"></path><path d="M17 9l5 6"></path><path d="M22 9l-5 6"></path></svg>`;
    return `<button type="button" class="sound-btn" data-sound aria-pressed="${on}" aria-label="${on ? "Sound is on. Tap to turn off" : "Sound is off. Tap to turn on"}">${icon}</button>`;
  },

  // Draw (or redraw) the button once, outside the screens, so it stays put as screens change.
  draw() {
    let holder = document.getElementById("sound-holder");
    if (!holder) {
      holder = document.createElement("div");
      holder.id = "sound-holder";
      document.body.appendChild(holder);
    }
    holder.innerHTML = this.buttonHtml();
  },

  toggle() {
    Store.setSound(!this.enabled());
    this.draw();
    this.ding();  // plays only if sound was just turned on, so the student hears what it sounds like
  },
};
