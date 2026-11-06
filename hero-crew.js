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
  crewEl.className = reel ? "cursor-crew off" : "cursor-crew";
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
    ".section h2", ".section-sub", ".tool", ".mini-card", ".skill-card", ".ship-card", ".platform-card", ".work-card",
    ".big-name"
  ].join(",");

  // Short headings only, so nobody loses a paragraph they are reading
  const TYPE_TARGETS = ".hero-title, .section-title, .work-card h3, .skill-card h3, .platform-card h3, .ship-card h3";

  const taken = new Set();
  let reelInView = !!reel; // stay hidden until the observer has reported on the reel
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let finaleOn = false;
  const paused = () => reelInView || finaleOn || document.hidden;
  const syncCrew = () => crewEl.classList.toggle("off", reelInView || finaleOn);

  const RETYPE_AFTER = 30000;
  const REVISIT_AFTER = 9000;
  const MAX_TYPING = 1;
  const lastTyped = new Map();
  const lastVisited = new Map();

  // A heading and its subtitle, or a card and its title, count as one thing: one cursor at a time
  const GROUPS = ".section-head, .work-card, .skill-card, .platform-card, .ship-card, .mini-card, .tool, .flow-card";
  const groupOf = el => el.closest(GROUPS) || el;

  // Reveal-on-scroll slides things up as they appear, so wait until they have landed
  const hasLanded = el => {
    const reveal = el.closest(".reveal");
    if (!reveal) return true;
    if (!reveal.classList.contains("visible")) return false;
    const cs = getComputedStyle(reveal);
    return cs.transform === "none" && cs.opacity === "1";
  };

  // Text gets a box around the words themselves, not the whole empty row
  const TEXT_TARGETS = TYPE_TARGETS + ", .section-sub";
  const rectOf = el => {
    if (el.matches(TEXT_TARGETS)) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      if (r.width) return r;
    }
    return el.getBoundingClientRect();
  };
  let typingNow = 0;

  const inView = el => {
    const r = el.getBoundingClientRect();
    return r.bottom > 70 && r.top < window.innerHeight;
  };
  const stillOn = target => inView(target) && !paused();

  // Wait, but stop early the moment the visitor scrolls the target away
  const hold = async (ms, target) => {
    const end = performance.now() + ms;
    while (performance.now() < end) {
      if (!stillOn(target)) return false;
      await sleep(Math.min(40, end - performance.now()));
    }
    return stillOn(target);
  };

  const pickTarget = (selector, typing) => {
    const vh = window.innerHeight;
    const now = performance.now();
    const options = [...document.querySelectorAll(selector)].filter(el => {
      const group = groupOf(el);
      if (taken.has(group)) return false;
      if (now - (lastVisited.get(group) ?? -REVISIT_AFTER) < REVISIT_AFTER) return false;
      if (typing && now - (lastTyped.get(el) ?? -RETYPE_AFTER) < RETYPE_AFTER) return false;
      if (!hasLanded(el)) return false;
      const r = rectOf(el);
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

  const typeLetters = async (letters, target) => {
    const delay = Math.max(18, Math.min(38, 900 / letters.length));
    for (const letter of letters) {
      if (!stillOn(target)) return false;
      letter.classList.add("shown", "caret");
      await sleep(delay);
      letter.classList.remove("caret");
    }
    return true;
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

    let curX = 0, curY = 0;
    const moveTo = (x, y, ms) => {
      curX = x;
      curY = y;
      el.style.setProperty("--fly", ms + "ms");
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    // Left behind by a scroll: rejoin from the nearest screen edge instead of crossing the whole page
    const rejoin = () => {
      const top = window.scrollY, h = window.innerHeight;
      if (curY > top && curY < top + h) return;
      moveTo(curX, curY <= top ? top + 70 : top + h - 10, 0);
      void el.offsetWidth;
    };
    const maxX = () => document.documentElement.clientWidth - 90;

    // Keep the box glued to its target, even if a card lifts on hover
    let sized = false;
    const follow = target => {
      const tick = () => {
        if (!box.classList.contains("on")) return;
        const now = rectOf(target);
        box.style.left = now.left + window.scrollX - 6 + "px";
        box.style.top = now.top + window.scrollY - 6 + "px";
        if (sized) {
          box.style.width = now.width + 12 + "px";
          box.style.height = now.height + 12 + "px";
        }
        requestAnimationFrame(tick);
      };
      tick();
    };

    moveTo(Math.random() * maxX(), window.scrollY + Math.random() * window.innerHeight, 0);
    await sleep(index * 700);

    while (true) {
      if (paused()) { await sleep(200); continue; }
      const writes = typingNow < MAX_TYPING && Math.random() < 0.45;
      const typeTarget = writes ? pickTarget(TYPE_TARGETS, true) : null;
      const target = typeTarget || pickTarget(TARGETS);
      if (!target) {
        // Nothing free to work on here: hover nearby rather than staying off screen
        rejoin();
        moveTo(Math.random() * maxX(), window.scrollY + 90 + Math.random() * (window.innerHeight - 180), 320);
        await sleep(800);
        continue;
      }
      const group = groupOf(target);
      taken.add(group);
      rejoin();
      sized = false;

      if (typeTarget) {
        // Fly to the top-left corner, drag the box open, write the text in, then let it be read
        typingNow++;
        let r = rectOf(target);
        const fly = 260 + Math.random() * 220;
        moveTo(Math.min(r.left + window.scrollX - 10, maxX()), r.top + window.scrollY - 8, fly);

        if (await hold(fly, target)) {
          lastTyped.set(target, performance.now());
          r = rectOf(target);
          const hidden = hideLetters(target);
          const drag = 320 + Math.random() * 140;
          box.classList.add("drag");
          box.style.setProperty("--fly", drag + "ms");
          box.style.width = "0px";
          box.style.height = "0px";
          box.classList.add("on");
          follow(target);
          void box.offsetWidth;
          box.style.width = r.width + 12 + "px";
          box.style.height = r.height + 12 + "px";
          moveTo(Math.min(r.right + window.scrollX + 8, maxX()), r.bottom + window.scrollY + 8, drag);

          const typed = (await hold(drag + 60, target)) && (await typeLetters(hidden.letters, target));
          hidden.restore();
          if (typed) await hold(Math.min(4500, 1500 + hidden.letters.length * 60), target);

          box.classList.remove("on");
          await sleep(180);
          box.classList.remove("drag");
        }
        typingNow--;
      } else {
        const r = rectOf(target);
        const fly = 260 + Math.random() * 240;
        moveTo(Math.min(r.right - 14 + window.scrollX, maxX()), r.bottom - 12 + window.scrollY, fly);

        if (await hold(fly, target)) {
          sized = true;
          box.classList.add("on");
          follow(target);
          await hold(600 + Math.random() * 500, target);
          box.classList.remove("on");
        }
      }

      taken.delete(group);
      lastVisited.set(group, performance.now());
      await sleep(60 + Math.random() * 160);
    }
  };

  /* ---------- Finale: a drone train that flies a shape (heart at Contact, flower at the bottom) ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const easeInOut = t => 0.5 - Math.cos(Math.PI * t) / 2;

  const buildContour = (type, cx, cy, size) => {
    const pts = [];
    const STEPS = 260;
    for (let i = 0; i <= STEPS; i++) {
      const a = (i / STEPS) * Math.PI * 2;
      if (type === "heart") {
        const k = size / 34;
        const f = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
        pts.push([cx + k * 16 * Math.sin(a) ** 3, cy - k * (f + 2.5)]);
      } else {
        // Five round petals with no inner crossings
        const r = (size / 2) * (0.56 + 0.44 * Math.abs(Math.cos(2.5 * a)));
        pts.push([cx + r * Math.sin(a), cy - r * Math.cos(a)]);
      }
    }
    return pts;
  };

  const makePath = pts => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const at = d => {
      const dist = Math.max(0, Math.min(cum[cum.length - 1], d));
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= dist) lo = mid; else hi = mid;
      }
      const f = (dist - cum[lo]) / (cum[hi] - cum[lo] || 1);
      return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
    };
    return { at, length: cum[cum.length - 1] };
  };

  // A flower keeps a few drones back to make its middle
  const slotsFor = (contour, count, zone) => {
    const path = makePath(contour);
    const middle = zone.type === "flower" ? 6 : 0;
    const ring = count - middle;
    return Array.from({ length: count }, (_, i) => {
      if (i < ring) return path.at(path.length - (i * path.length) / ring);
      const a = ((i - ring) / middle) * Math.PI * 2;
      const r = zone.size * 0.1;
      return [zone.cx + r * Math.cos(a), zone.cy + r * Math.sin(a)];
    });
  };

  const anchorFor = type => {
    const sx = window.scrollX, sy = window.scrollY;
    if (type === "flower") {
      const col = document.querySelector(".footer-col:last-child");
      if (!col) return null;
      const r = col.getBoundingClientRect();
      const linksRight = Math.max(...[...col.querySelectorAll("a")].map(a => a.getBoundingClientRect().right));
      const size = Math.min(170, Math.max(90, r.right - linksRight - 16));
      return { cx: r.right - size / 2 + sx, cy: r.top + r.height / 2 + sy, size };
    }
    const links = document.querySelector(".contact-links");
    const form = document.querySelector(".contact-form");
    if (!links || !form) return null;
    const r = links.getBoundingClientRect();
    const last = links.lastElementChild.getBoundingClientRect();
    const free = r.bottom - last.bottom - 24;
    if (free >= 110) {
      const size = Math.min(170, free);
      return { cx: r.left + r.width / 2 + sx, cy: last.bottom + 12 + free / 2 + sy, size };
    }
    // One column (phones): the gap under the form
    const f = form.getBoundingClientRect();
    return { cx: f.left + f.width / 2 + sx, cy: f.bottom + 48 + sy, size: 72 };
  };

  const zoneNow = () => {
    const vh = window.innerHeight;
    for (const type of ["flower", "heart"]) {
      const a = anchorFor(type);
      if (!a) continue;
      const y = a.cy - window.scrollY;
      if (y - a.size / 2 > 64 && y + a.size / 2 < vh) return { type, ...a };
    }
    return null;
  };

  let swarm = null;

  const startSwarm = zone => {
    const contour = buildContour(zone.type, zone.cx, zone.cy, zone.size);
    const loop = makePath(contour);
    const count = Math.max(12, Math.min(30, Math.round(loop.length / 21)));
    const scale = Math.max(0.55, Math.min(1, zone.size / 150));

    const lead = crewEl.querySelector(".crew-cursor").getBoundingClientRect();
    const onScreen = lead.top > 0 && lead.bottom < window.innerHeight;
    const startX = onScreen ? lead.left + window.scrollX : document.documentElement.clientWidth + 20;
    const startY = onScreen ? lead.top + window.scrollY : window.scrollY + window.innerHeight * 0.4;

    // Swoop in from wherever the leader was, then go once around the shape
    const [endX, endY] = contour[0];
    const midX = (startX + endX) / 2 + (endY - startY) * 0.25;
    const midY = (startY + endY) / 2 - (endX - startX) * 0.25;
    const approach = [];
    for (let i = 0; i < 80; i++) {
      const t = i / 80, u = 1 - t;
      approach.push([u * u * startX + 2 * u * t * midX + t * t * endX, u * u * startY + 2 * u * t * midY + t * t * endY]);
    }
    const route = makePath([...approach, ...contour]);

    const layer = document.createElement("div");
    layer.className = "swarm";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    // The named crew are spread evenly along the train; everyone else is a small drone
    const named = window.innerWidth <= 600 ? CREW.slice(0, 2) : CREW;
    const tones = ["--accent", "--accent-2"];
    const namedAt = new Map(named.map((m, n) => [Math.round((n / named.length) * count), m]));
    const bees = Array.from({ length: count }, (_, i) => {
      const member = namedAt.get(i);
      const el = document.createElement("div");
      el.className = "swarm-bee";
      el.style.setProperty("--c", member ? `var(${member.color})` : `var(${tones[i % 2]})`);
      el.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.8L9.8 21z"/></svg>` +
        (member ? `<span class="crew-tag">${member.name}</span>` : "");
      layer.appendChild(el);
      return { el, svg: el.firstChild, x: startX, y: startY, rot: 0, shown: false };
    });

    const place = bee => {
      bee.el.style.transform = `translate3d(${bee.x}px, ${bee.y}px, 0)`;
      bee.svg.style.transform = `translate(-11px, -11px) rotate(${bee.rot}deg) scale(${scale})`;
    };
    const faceTravel = (bee, x, y) => {
      const dx = x - bee.x, dy = y - bee.y;
      if (dx * dx + dy * dy > 0.02) bee.rot = (Math.atan2(dy, dx) * 180) / Math.PI + 135;
      bee.x = x;
      bee.y = y;
    };
    const showBee = bee => {
      if (!bee.shown) { bee.shown = true; bee.el.classList.add("on"); }
    };

    const state = { layer, bees, type: zone.type, cx: zone.cx, cy: zone.cy, phase: "train", t0: performance.now(), done: false };
    state.slots = slotsFor(contour, count, zone);
    const spacing = loop.length / count;
    const flyTime = Math.min(1700, 800 + route.length * 0.45);

    const frame = now => {
      if (state.done) return;
      if (state.phase === "train") {
        const head = route.length * easeInOut(clamp01((now - state.t0) / flyTime));
        bees.forEach((bee, i) => {
          const d = head - i * spacing;
          if (d <= 0) return;
          showBee(bee);
          const [x, y] = route.at(d);
          faceTravel(bee, x, y);
          place(bee);
        });
        if (now - state.t0 >= flyTime) {
          // Everyone settles from their place in the train into their final spot
          bees.forEach(bee => { showBee(bee); bee.fromX = bee.x; bee.fromY = bee.y; });
          state.phase = "morph";
          state.t0 = now;
        }
      } else if (state.phase === "morph") {
        let moving = false;
        bees.forEach((bee, i) => {
          const t = clamp01((now - state.t0 - i * 6) / 420);
          if (t < 1) moving = true;
          const e = easeInOut(t);
          faceTravel(bee, bee.fromX + (state.slots[i][0] - bee.fromX) * e, bee.fromY + (state.slots[i][1] - bee.fromY) * e);
          place(bee);
        });
        if (!moving) {
          state.phase = "formed";
          state.t1 = now;
          layer.classList.add("formed");
        }
      } else {
        const age = (now - state.t1) / 1000;
        // The heart beats; the flower slowly turns
        const beat = state.type === "heart" ? 1 + 0.06 * Math.max(0, Math.sin(age * 4.4)) ** 3 : 1;
        const spin = state.type === "flower" ? age * 0.14 : 0;
        const cos = Math.cos(spin), sin = Math.sin(spin);
        bees.forEach((bee, i) => {
          const ox = state.slots[i][0] - state.cx, oy = state.slots[i][1] - state.cy;
          bee.x = state.cx + (ox * cos - oy * sin) * beat;
          bee.y = state.cy + (ox * sin + oy * cos) * beat;
          const out = (Math.atan2(bee.y - state.cy, bee.x - state.cx) * 180) / Math.PI + 135;
          const diff = ((out - bee.rot + 540) % 360) - 180;
          bee.rot += diff * 0.12;
          place(bee);
        });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return state;
  };

  const morphSwarm = zone => {
    const contour = buildContour(zone.type, zone.cx, zone.cy, zone.size);
    swarm.slots = slotsFor(contour, swarm.bees.length, zone);
    swarm.type = zone.type;
    swarm.cx = zone.cx;
    swarm.cy = zone.cy;
    swarm.phase = "morph";
    swarm.t0 = performance.now();
    swarm.layer.classList.remove("formed");
    swarm.bees.forEach(bee => {
      bee.fromX = bee.x;
      bee.fromY = bee.y;
      bee.shown = true;
      bee.el.classList.add("on");
    });
  };

  const endSwarm = () => {
    const old = swarm;
    swarm = null;
    finaleOn = false;
    syncCrew();
    old.layer.classList.add("leaving");
    setTimeout(() => { old.done = true; old.layer.remove(); }, 450);
  };

  let zoneQueued = false;
  const checkZone = () => {
    zoneQueued = false;
    if (reelInView || document.hidden) return;
    const zone = zoneNow();
    if (!zone) {
      if (swarm) endSwarm();
      return;
    }
    if (!swarm) {
      finaleOn = true;
      syncCrew();
      swarm = startSwarm(zone);
    } else if (swarm.type !== zone.type) {
      morphSwarm(zone);
    }
  };
  const queueZone = () => {
    if (!zoneQueued) {
      zoneQueued = true;
      requestAnimationFrame(checkZone);
    }
  };
  window.addEventListener("scroll", queueZone, { passive: true });
  window.addEventListener("resize", () => {
    if (swarm) endSwarm();
    queueZone();
  });

  const crewSize = window.innerWidth <= 600 ? 2 : CREW.length;
  CREW.slice(0, crewSize).forEach(launch);

  if (reel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      reelInView = entry.intersectionRatio > 0.35;
      syncCrew();
      queueZone();
    }, { threshold: [0, 0.35, 0.6, 1] }).observe(reel);
  }
});
