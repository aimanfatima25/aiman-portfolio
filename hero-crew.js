/* =========================================
   Giant particle name + flying cursor crew
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const hero = document.getElementById("home");
  const reel = document.getElementById("reel");
  const cssVar = name => getComputedStyle(root).getPropertyValue(name).trim();

  /* ---------- Particles that gather into AIMAN ---------- */
  const canvas = document.getElementById("word-canvas");
  const ctx = canvas.getContext("2d");
  const FONT = '800 100px "Bricolage Grotesque", system-ui, sans-serif';
  let W = 0, H = 0, dots = [], colors = [], heroVisible = true, running = false;
  const mouse = { x: -9999, y: -9999 };

  const readColors = () => {
    colors = [cssVar("--accent"), cssVar("--accent-2"), cssVar("--text")];
  };

  const buildDots = () => {
    if (!hero.clientWidth) return; // not laid out yet: the resize handler retries
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const compact = window.innerWidth <= 860;
    const gutter = compact ? 16 : 30;
    const navH = compact ? 76 : 84;

    ctx.font = FONT;
    const m = ctx.measureText("AIMAN");
    const capH = m.actualBoundingBoxAscent;
    const maxH = window.innerHeight * 0.4;
    const scale = Math.min((window.innerWidth - gutter * 2) / m.width, maxH / capH);
    const size = 100 * scale;
    const wordW = m.width * scale;
    const wordH = capH * scale;
    hero.style.setProperty("--word-h", wordH + 24 + "px");

    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sample = document.createElement("canvas");
    sample.width = W;
    sample.height = Math.ceil(navH + wordH + 20);
    const s = sample.getContext("2d", { willReadFrequently: true });
    s.font = FONT.replace("100px", size + "px");
    s.textBaseline = "alphabetic";
    s.fillText("AIMAN", (W - wordW) / 2, navH + wordH);
    const data = s.getImageData(0, 0, sample.width, sample.height).data;

    let gap = Math.max(3, Math.round(size / 72));
    const collect = () => {
      const points = [];
      for (let y = 0; y < sample.height; y += gap) {
        for (let x = 0; x < sample.width; x += gap) {
          if (data[(y * sample.width + x) * 4 + 3] > 128) points.push([x, y]);
        }
      }
      return points;
    };
    let points = collect();
    while (points.length > 6000) { gap++; points = collect(); }

    dots = points.map(([tx, ty]) => {
      const shade = Math.random();
      return {
        tx, ty,
        x: prefersReduced ? tx : Math.random() * W,
        y: prefersReduced ? ty : Math.random() * H,
        vx: 0, vy: 0,
        wait: prefersReduced ? 0 : Math.random() * 45,
        size: gap * 0.62,
        // Mostly accent, drifting into accent-2 across the word, with a few bright sparks
        tone: shade < 0.05 ? 2 : (tx / W + (shade - 0.5) * 0.35 > 0.5 ? 1 : 0)
      };
    });
  };

  const paint = () => {
    ctx.clearRect(0, 0, W, H);
    for (let tone = 0; tone < colors.length; tone++) {
      ctx.fillStyle = colors[tone];
      for (const d of dots) {
        if (d.tone === tone) ctx.fillRect(d.x, d.y, d.size, d.size);
      }
    }
  };

  const step = () => {
    if (!heroVisible || document.hidden) { running = false; return; }
    for (const d of dots) {
      if (d.wait > 0) { d.wait--; continue; }
      d.vx += (d.tx - d.x) * 0.018;
      d.vy += (d.ty - d.y) * 0.018;
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 8100 && dist2 > 0) {
        const push = (8100 - dist2) / 8100 * 2.4 / Math.sqrt(dist2);
        d.vx += dx * push;
        d.vy += dy * push;
      }
      d.vx *= 0.84;
      d.vy *= 0.84;
      d.x += d.vx;
      d.y += d.vy;
    }
    paint();
    requestAnimationFrame(step);
  };

  const run = () => {
    if (prefersReduced) { paint(); return; }
    if (!running) { running = true; requestAnimationFrame(step); }
  };

  const startWord = () => {
    readColors();
    buildDots();
    run();
  };

  (document.fonts ? document.fonts.load(FONT, "AIMAN") : Promise.resolve()).then(startWord, startWord);

  document.addEventListener("themechange", () => { readColors(); run(); });
  document.addEventListener("visibilitychange", run);
  window.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });

  let lastWidth = window.innerWidth, resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth === lastWidth && dots.length) return;
      lastWidth = window.innerWidth;
      buildDots();
      run();
    }, 180);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible && !dots.length) buildDots();
      if (heroVisible) run();
    }).observe(hero);
  }

  /* ---------- Flying cursor crew: her tools, checking the page ---------- */
  if (prefersReduced) return;

  const crewEl = document.createElement("div");
  crewEl.className = "cursor-crew";
  crewEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(crewEl);

  const CREW = [
    { name: "Claude", color: "--accent" },
    { name: "n8n", color: "--accent-2" },
    { name: "FastAPI", color: "--ok" },
    { name: "APIs", color: "--accent" }
  ];
  const TARGETS = [
    ".hero-title", ".hero-actions .btn", ".flow-card", ".node", ".word-photo",
    ".section h2", ".mini-card", ".skill-card", ".ship-card", ".platform-card", ".work-card",
    ".big-name"
  ].join(",");

  // Short headings only, so nobody loses a paragraph they are reading
  const TYPE_TARGETS = ".hero-title, .section-title, .work-card h3, .skill-card h3, .platform-card h3, .ship-card h3";

  const taken = new Set();
  let reelInView = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const paused = () => reelInView || document.hidden;

  const pickTarget = selector => {
    const vh = window.innerHeight;
    const options = [...document.querySelectorAll(selector)].filter(el => {
      if (taken.has(el)) return false;
      const reveal = el.closest(".reveal");
      if (reveal && !reveal.classList.contains("visible")) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.top > 70 && r.bottom < vh && r.width < window.innerWidth * 0.9;
    });
    return options[Math.floor(Math.random() * options.length)] || null;
  };

  // Hide a heading's letters without moving the layout. Returns a function that restores it.
  const hideLetters = el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);

    const letters = [];
    const wrappers = nodes.map(node => {
      const wrapper = document.createElement("span");
      wrapper.style.display = "contents";
      for (const part of node.nodeValue.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { wrapper.append(part); continue; }
        const word = document.createElement("span");
        word.className = "crew-word";
        for (const ch of part) {
          const letter = document.createElement("span");
          letter.className = "crew-letter";
          letter.textContent = ch;
          word.append(letter);
          letters.push(letter);
        }
        wrapper.append(word);
      }
      node.replaceWith(wrapper);
      return [wrapper, node];
    });
    return { letters, restore: () => wrappers.forEach(([wrapper, node]) => wrapper.replaceWith(node)) };
  };

  const typeLetters = async letters => {
    const delay = Math.max(16, Math.min(40, 1000 / letters.length));
    for (const letter of letters) {
      letter.classList.add("shown", "caret");
      await sleep(delay);
      letter.classList.remove("caret");
    }
  };

  const launch = async (member, index) => {
    const el = document.createElement("div");
    el.className = "crew-cursor";
    el.style.setProperty("--c", `var(${member.color})`);
    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.8L9.8 21z"/></svg><span class="crew-tag">${member.name}</span>`;

    const box = document.createElement("div");
    box.className = "crew-box";
    box.style.setProperty("--c", `var(${member.color})`);
    crewEl.append(box, el);

    const moveTo = (x, y, ms) => {
      el.style.setProperty("--fly", ms + "ms");
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const maxX = () => document.documentElement.clientWidth - 90;

    moveTo(Math.random() * maxX(), window.scrollY + Math.random() * window.innerHeight, 0);
    await sleep(index * 700);

    while (true) {
      if (paused()) { await sleep(500); continue; }
      const writes = Math.random() < 0.45;
      const target = (writes && pickTarget(TYPE_TARGETS)) || pickTarget(TARGETS);
      if (!target) { await sleep(600); continue; }
      taken.add(target);
      const typing = target.matches(TYPE_TARGETS) && writes;

      const r = target.getBoundingClientRect();
      if (typing) {
        // Fly to the top-left corner, drag the box open, then the text writes itself in
        const left = r.left + window.scrollX - 6, top = r.top + window.scrollY - 6;
        const fly = 450 + Math.random() * 400;
        moveTo(Math.min(left - 4, maxX()), top - 2, fly);
        await sleep(fly);

        const hidden = hideLetters(target);
        const drag = 450 + Math.random() * 200;
        box.classList.add("drag");
        box.style.setProperty("--fly", drag + "ms");
        box.style.left = left + "px";
        box.style.top = top + "px";
        box.style.width = "0px";
        box.style.height = "0px";
        box.classList.add("on");
        void box.offsetWidth;
        box.style.width = r.width + 12 + "px";
        box.style.height = r.height + 12 + "px";
        moveTo(Math.min(left + r.width + 8, maxX()), top + r.height + 10, drag);
        await sleep(drag + 80);

        await typeLetters(hidden.letters);
        hidden.restore();
        await sleep(450);

        box.classList.remove("on");
        await sleep(300);
        box.classList.remove("drag");
      } else {
        const x = Math.min(r.right - 14 + window.scrollX, maxX());
        const y = r.bottom - 12 + window.scrollY;
        const fly = 450 + Math.random() * 450;
        moveTo(x, y, fly);
        await sleep(fly);

        const now = target.getBoundingClientRect();
        box.style.left = now.left + window.scrollX - 6 + "px";
        box.style.top = now.top + window.scrollY - 6 + "px";
        box.style.width = now.width + 12 + "px";
        box.style.height = now.height + 12 + "px";
        box.classList.add("on");
        await sleep(650 + Math.random() * 600);
        box.classList.remove("on");
      }

      taken.delete(target);
      await sleep(100 + Math.random() * 300);
    }
  };

  const crewSize = window.innerWidth <= 600 ? 2 : CREW.length;
  CREW.slice(0, crewSize).forEach(launch);

  if (reel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      reelInView = entry.intersectionRatio > 0.35;
      crewEl.classList.toggle("off", reelInView);
    }, { threshold: [0, 0.35, 0.6, 1] }).observe(reel);
  }
});
