// A little celebration (banner + confetti) when a streak reaches 5, 10, 20, 50 or 100 in a row.
// Drawn on top of the page and removed after a few seconds, so it never gets in the way of playing.
const Celebrate = {
  MILESTONES: [5, 10, 20, 50, 100],
  COLOURS: ["#222C69", "#FDE006", "#8E1F37", "#12707E", "#3E5A4F", "#8A5316", "#FFFFFF"],
  timer: null,

  // Call after every right answer with the current streak.
  check(streak) {
    if (this.MILESTONES.includes(streak)) this.show(streak);
  },

  reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  show(streak) {
    this.display(`<span class="celebrate-num">${streak}</span> in a row!`, streak);
  },

  // Finishing every step of a set: a banner and a big burst of confetti.
  setComplete() {
    this.display("Set complete!", 50);
  },

  display(bannerHtml, size) {
    this.clear();
    const layer = document.createElement("div");
    layer.id = "celebrate";
    layer.setAttribute("role", "status");
    layer.innerHTML = `<div class="celebrate-banner">${bannerHtml}</div>`;
    document.body.appendChild(layer);
    if (typeof Sound !== "undefined") Sound.cheer();
    if (!this.reducedMotion()) this.confetti(layer, size);
    this.timer = setTimeout(() => this.clear(), 3200);
  },

  clear() {
    clearTimeout(this.timer);
    this.stopped = true;
    const old = document.getElementById("celebrate");
    if (old) old.remove();
  },

  // Bigger streaks get more confetti.
  confetti(layer, streak) {
    const canvas = document.createElement("canvas");
    layer.appendChild(canvas);
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth, height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    const count = { 5: 70, 10: 100, 20: 140, 50: 190, 100: 260 }[streak] || 100;
    const pieces = Array.from({ length: count }, () => ({
      x: width * (0.5 + (Math.random() - 0.5) * 0.4),
      y: height * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 3,
      size: 6 + Math.random() * 7,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.4,
      colour: this.COLOURS[Math.floor(Math.random() * this.COLOURS.length)],
      round: Math.random() < 0.25,
    }));
    this.stopped = false;
    const start = performance.now();
    const frame = (now) => {
      if (this.stopped || !canvas.isConnected) return;
      const age = now - start;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = age > 2400 ? Math.max(0, 1 - (age - 2400) / 700) : 1;
      for (const p of pieces) {
        p.vy += 0.32;       // gravity
        p.vx *= 0.99;       // a little air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.colour;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (age < 3100) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },
};
