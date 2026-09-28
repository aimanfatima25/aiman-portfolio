/* =========================================
   Aiman Fatima — Portfolio interactions
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Theme switcher ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-btn");
  const themeMenu = document.getElementById("theme-menu");
  const themeOpts = themeMenu.querySelectorAll(".theme-opt");
  const THEMES = ["midnight", "daylight", "cherry", "mocha", "cloud", "coquette", "boba", "zixy"];

  const applyTheme = (name, save) => {
    if (!THEMES.includes(name)) name = "midnight";
    root.setAttribute("data-theme", name);
    themeOpts.forEach(o => o.setAttribute("aria-checked", String(o.dataset.themeChoice === name)));
    if (save) { try { localStorage.setItem("af-theme", name); } catch (e) {} }
    document.dispatchEvent(new CustomEvent("themechange", { detail: name }));
  };

  const openThemeMenu = (open) => {
    themeMenu.classList.toggle("open", open);
    themeBtn.setAttribute("aria-expanded", String(open));
  };

  applyTheme(root.getAttribute("data-theme") || "midnight", false);

  themeBtn.addEventListener("click", e => {
    e.stopPropagation();
    openThemeMenu(!themeMenu.classList.contains("open"));
  });
  themeOpts.forEach(o => o.addEventListener("click", () => {
    applyTheme(o.dataset.themeChoice, true);
    openThemeMenu(false);
  }));
  document.addEventListener("click", e => {
    if (!themeMenu.contains(e.target)) openThemeMenu(false);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") openThemeMenu(false); });

  /* ---------- Lahore clock ---------- */
  const clock = document.getElementById("nav-clock");
  const tickClock = () => {
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Karachi"
    }).format(new Date());
    clock.textContent = `LAHORE ${time}`;
  };
  tickClock();
  setInterval(tickClock, 15000);

  /* ---------- Scroll progress line ---------- */
  const progress = document.getElementById("scroll-progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------- Theme decorations (cherries, clouds, bows, boba…) ---------- */
  const decorBox = document.getElementById("decor");

  const ART = {
    cherry: `
      <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
        <path d="M34 6 C31 20 24 30 19 44" fill="none" stroke="#5b3a1e" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M34 6 C38 22 43 32 45 46" fill="none" stroke="#5b3a1e" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M34 7 C40 1 51 2 56 9 C48 13 40 12 34 7 Z" fill="#4f8a3c"/>
        <path d="M36 7 C42 6 48 7 53 9" fill="none" stroke="#3b6b2c" stroke-width="1"/>
        <circle cx="18" cy="53" r="12" fill="#b3172e"/>
        <circle cx="45" cy="55" r="12" fill="#c8243c"/>
        <ellipse cx="13.5" cy="48.5" rx="3.6" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-30 13.5 48.5)"/>
        <ellipse cx="40.5" cy="50.5" rx="3.6" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-30 40.5 50.5)"/>
      </svg>`,

    cloud: `
      <svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 56 C8 56 4 42 14 36 C12 22 30 16 38 26 C42 10 66 6 74 22 C84 12 104 18 102 34 C116 36 116 56 100 56 Z" fill="#ffffff"/>
        <path d="M22 56 C12 56 8 50 10 45 C18 50 60 52 112 47 C110 53 106 56 100 56 Z" fill="#d9ecfa"/>
      </svg>`,

    bird: `
      <svg viewBox="0 0 64 56" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 34 L2 28 L6 38 Z" fill="#3c7fc4"/>
        <ellipse cx="32" cy="32" rx="22" ry="19" fill="#5aa6e8"/>
        <ellipse cx="36" cy="38" rx="13" ry="10" fill="#e6f4ff"/>
        <path d="M18 30 C24 22 34 24 34 32 C28 36 22 36 18 30 Z" fill="#3c7fc4"/>
        <circle cx="42" cy="25" r="3" fill="#15314a"/>
        <circle cx="43" cy="24" r="1" fill="#fff"/>
        <path d="M52 27 L61 30 L52 33 Z" fill="#f5a524"/>
        <circle cx="46" cy="32" r="2.6" fill="#ff9fb8" opacity=".7"/>
        <path d="M28 51 v4 M36 51 v4" stroke="#f5a524" stroke-width="2" stroke-linecap="round"/>
      </svg>`,

    tree: `
      <svg viewBox="0 0 70 90" xmlns="http://www.w3.org/2000/svg">
        <path d="M31 58 h8 l2 30 h-12 Z" fill="#9a6a44"/>
        <circle cx="35" cy="34" r="26" fill="#6cc27a"/>
        <circle cx="20" cy="44" r="15" fill="#5ab169"/>
        <circle cx="50" cy="44" r="15" fill="#5ab169"/>
        <circle cx="27" cy="24" r="8" fill="#8fd89b" opacity=".8"/>
        <circle cx="44" cy="30" r="2.6" fill="#ff8fab"/>
        <circle cx="26" cy="42" r="2.6" fill="#ff8fab"/>
        <circle cx="38" cy="50" r="2.6" fill="#ff8fab"/>
      </svg>`,

    bow: `
      <svg viewBox="0 0 80 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 30 L24 60 L32 56 L36 62 L40 34 Z" fill="#e8628c"/>
        <path d="M44 30 L56 60 L48 56 L44 62 L40 34 Z" fill="#e8628c"/>
        <path d="M38 26 C26 6 4 8 6 22 C8 36 28 36 38 30 Z" fill="#f48fb1"/>
        <path d="M42 26 C54 6 76 8 74 22 C72 36 52 36 42 30 Z" fill="#f48fb1"/>
        <path d="M34 26 C24 16 14 16 12 22" fill="none" stroke="#e8628c" stroke-width="2" stroke-linecap="round"/>
        <path d="M46 26 C56 16 66 16 68 22" fill="none" stroke="#e8628c" stroke-width="2" stroke-linecap="round"/>
        <rect x="33" y="21" width="14" height="14" rx="6" fill="#e8628c"/>
        <ellipse cx="16" cy="16" rx="4" ry="2.4" fill="#fff" opacity=".6" transform="rotate(-25 16 16)"/>
      </svg>`,

    flower: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <g fill="#ffd1dc">
          <circle cx="30" cy="14" r="11"/><circle cx="45" cy="25" r="11"/><circle cx="39" cy="43" r="11"/>
          <circle cx="21" cy="43" r="11"/><circle cx="15" cy="25" r="11"/>
        </g>
        <g fill="#ffb3c7" opacity=".6">
          <circle cx="30" cy="17" r="5"/><circle cx="42" cy="26" r="5"/><circle cx="37" cy="40" r="5"/>
          <circle cx="23" cy="40" r="5"/><circle cx="18" cy="26" r="5"/>
        </g>
        <circle cx="30" cy="30" r="8" fill="#ffd166"/>
        <circle cx="28" cy="28" r="2.4" fill="#fff3c4"/>
      </svg>`,

    boba: `
      <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
        <path d="M38 2 L34 30" stroke="#e76f8c" stroke-width="6" stroke-linecap="round"/>
        <path d="M10 26 C10 12 54 12 54 26 Z" fill="#fff8ef" opacity=".95"/>
        <rect x="6" y="25" width="52" height="7" rx="3.5" fill="#fff8ef"/>
        <path d="M10 32 L54 32 L48 90 C47.6 93 45 94 42 94 L22 94 C19 94 16.4 93 16 90 Z" fill="#e8c9a3"/>
        <path d="M11 42 L53 42 L48 90 C47.6 93 45 94 42 94 L22 94 C19 94 16.4 93 16 90 Z" fill="#c99a6b"/>
        <g fill="#3b2418">
          <circle cx="22" cy="86" r="4"/><circle cx="31" cy="88" r="4"/><circle cx="40" cy="86" r="4"/>
          <circle cx="26" cy="79" r="4"/><circle cx="36" cy="80" r="4"/><circle cx="44" cy="78" r="3.6"/><circle cx="19" cy="77" r="3.6"/>
        </g>
        <circle cx="25" cy="58" r="2.6" fill="#3b2418"/>
        <circle cx="39" cy="58" r="2.6" fill="#3b2418"/>
        <path d="M29 63 Q32 66 35 63" fill="none" stroke="#3b2418" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="20" cy="63" rx="3.4" ry="2" fill="#ff9fb0" opacity=".75"/>
        <ellipse cx="44" cy="63" rx="3.4" ry="2" fill="#ff9fb0" opacity=".75"/>
        <path d="M15 36 L17 84" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".35"/>
      </svg>`,

    planetRose: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg-rose" cx="35%" cy="30%" r="75%">
            <stop offset="0" stop-color="#f6b3c8"/><stop offset=".45" stop-color="#8f3d5e"/><stop offset="1" stop-color="#2a1022"/>
          </radialGradient>
          <radialGradient id="pg-rose-glow" cx="50%" cy="50%" r="50%">
            <stop offset=".7" stop-color="#f4a7c6" stop-opacity=".35"/><stop offset="1" stop-color="#f4a7c6" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#pg-rose-glow)"/>
        <circle cx="50" cy="50" r="36" fill="url(#pg-rose)"/>
        <g fill="#ffd9a8" opacity=".55">
          <circle cx="38" cy="44" r="1.4"/><circle cx="46" cy="58" r="1"/><circle cx="58" cy="40" r="1.2"/>
          <circle cx="62" cy="62" r="1.5"/><circle cx="30" cy="56" r="1"/><circle cx="52" cy="70" r="1.1"/>
        </g>
        <path d="M22 44 Q50 36 78 48" fill="none" stroke="#ffc2d8" stroke-width="1.2" opacity=".35"/>
      </svg>`,

    planetDark: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg-dark" cx="30%" cy="28%" r="80%">
            <stop offset="0" stop-color="#6b4a78"/><stop offset=".5" stop-color="#2c1a33"/><stop offset="1" stop-color="#0d0712"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="38" fill="url(#pg-dark)"/>
        <path d="M22 30 A38 38 0 0 1 60 13" fill="none" stroke="#f4b6cd" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      </svg>`,

    planetRing: `
      <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg-ring" cx="35%" cy="30%" r="80%">
            <stop offset="0" stop-color="#f2c7a5"/><stop offset=".5" stop-color="#a0526c"/><stop offset="1" stop-color="#321528"/>
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="48" rx="56" ry="14" fill="none" stroke="#f4a7c6" stroke-width="3" opacity=".55" transform="rotate(-14 60 48)"/>
        <circle cx="60" cy="45" r="28" fill="url(#pg-ring)"/>
        <path d="M6 58 Q60 34 114 34" fill="none" stroke="#f4a7c6" stroke-width="3" opacity=".7" transform="rotate(-2 60 48)"/>
      </svg>`,

    sparkle: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pg-sp" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#ffd3e4" stop-opacity=".8"/><stop offset="1" stop-color="#f4a7c6" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="url(#pg-sp)"/>
        <path d="M30 2 L33 27 L58 30 L33 33 L30 58 L27 33 L2 30 L27 27 Z" fill="#fff" opacity=".95"/>
      </svg>`
  };

  // Which pieces each theme uses: [art, how it moves, base size, extra random size]
  const DECOR = {
    cherry:   [["cherry", "sway", 34, 18]],
    cloud:    [["cloud", "drift", 90, 40], ["bird", "bob", 40, 12], ["tree", "sway-soft", 58, 20], ["bird", "bob", 34, 10], ["cloud", "drift", 70, 30]],
    coquette: [["bow", "sway", 50, 16], ["flower", "spin", 34, 14]],
    boba:     [["boba", "bob", 44, 14]],
    zixy:     [["planetRose", "float", 90, 50], ["sparkle", "pulse", 34, 16], ["planetDark", "float", 60, 30], ["planetRing", "float", 96, 30], ["sparkle", "pulse", 26, 12]]
  };

  // Small seeded random so the layout looks the same on every visit
  let seed = 7;
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

  const scatterDecor = () => {
    decorBox.innerHTML = "";
    const set = DECOR[root.getAttribute("data-theme")];
    if (!set) return;
    seed = 7;
    const h = document.documentElement.scrollHeight;
    const w = window.innerWidth;
    const small = w < 860;
    const gap = small ? 420 : 300;               // vertical spacing between pieces
    const count = Math.ceil(h / gap);
    for (let i = 0; i < count; i++) {
      const [art, motion, base, extra] = set[i % set.length];
      const left = i % 2 === 0;
      const scale = small ? 0.72 : 1;
      const size = (base + rand() * extra) * scale;
      // On phones, tuck pieces half off the screen edge so they never cover text
      // Big pieces (planets, clouds) peek in from the edge so they never touch the content
      const edge = small ? `${-size * 0.45}px` : size > 70 ? `${-size * (0.25 + rand() * 0.15)}px` : (1 + rand() * 6) + "%";
      const el = document.createElement("div");
      el.className = `decor-item m-${motion}`;
      el.innerHTML = ART[art];
      el.style.width = size + "px";
      el.style.top = (i * gap + 120 + rand() * (gap - 160)) + "px";
      el.style[left ? "left" : "right"] = edge;
      if (art === "bird" && !left) el.firstElementChild.style.transform = "scaleX(-1)";   // birds face inward
      el.style.setProperty("--r", (motion === "sway" ? (left ? -1 : 1) * (8 + rand() * 14) : 0) + "deg");
      el.style.animationDelay = (-rand() * 6) + "s";
      el.style.opacity = (small ? 0.6 : 0.85 + rand() * 0.15).toFixed(2);
      decorBox.appendChild(el);
    }
  };
  scatterDecor();
  document.addEventListener("themechange", scatterDecor);

  /* ---------- Zixy: twinkling star field ---------- */
  const galaxy = document.getElementById("galaxy");
  const buildStars = () => {
    if (galaxy.childElementCount) return;
    seed = 21;
    const frag = document.createDocumentFragment();
    const n = window.innerWidth < 600 ? 70 : 140;
    for (let i = 0; i < n; i++) {
      const st = document.createElement("span");
      st.className = "star";
      const size = rand() < 0.85 ? 1 + rand() * 1.4 : 2.4 + rand() * 1.4;
      st.style.width = st.style.height = size + "px";
      st.style.left = (rand() * 100) + "%";
      st.style.top = (rand() * 100) + "%";
      st.style.setProperty("--tw", (2 + rand() * 4).toFixed(1) + "s");
      st.style.animationDelay = (-rand() * 5).toFixed(1) + "s";
      frag.appendChild(st);
    }
    galaxy.appendChild(frag);
  };
  const maybeStars = () => { if (root.getAttribute("data-theme") === "zixy") buildStars(); };
  maybeStars();
  document.addEventListener("themechange", maybeStars);

  let ct;
  window.addEventListener("resize", () => { clearTimeout(ct); ct = setTimeout(scatterDecor, 200); });
  window.addEventListener("load", scatterDecor);

  /* ---------- Navbar: scrolled state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("nav-links");

  const closeMenu = () => {
    toggle.classList.remove("open");
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = !links.classList.contains("open");
    toggle.classList.toggle("open", open);
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("click", e => {
    if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 860) closeMenu(); });

  /* ---------- Smooth scroll with nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (id === "#home" ? 0 : 70);
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const setActive = () => {
    let current = "home";
    const mark = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(s => { if (s.offsetTop <= mark) current = s.id; });
    // Reaching the page bottom always highlights Contact
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = "contact";
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
  };
  setActive();
  window.addEventListener("scroll", setActive, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger siblings slightly
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains("reveal"));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
        el.classList.add("visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("visible"));
  }

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById("typed");
  const words = ["Workflow Builder", "n8n Automations", "Claude Integrations", "API Connections", "FastAPI Services"];
  if (!prefersReduced) {
    let w = 0, c = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      typedEl.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 85;
      if (deleting) {
        c--;
        if (c < 0) { deleting = false; w = (w + 1) % words.length; c = 0; delay = 300; }
      } else {
        c++;
        if (c > words[w].length) { deleting = true; c = words[w].length; delay = 1900; }
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- Workflow card: light up nodes in sequence ---------- */
  const nodes = document.querySelectorAll(".flow-body .node");
  if (nodes.length && !prefersReduced) {
    let i = 0;
    setInterval(() => {
      nodes.forEach((n, idx) => n.classList.toggle("lit", idx === i));
      i = (i + 1) % nodes.length;
    }, 1100);
  }

  /* ---------- Skill card spotlight ---------- */
  document.querySelectorAll(".skill-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Contact form (sends via Web3Forms, no backend needed) ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameInput = document.getElementById("cf-name");
  const emailInput = document.getElementById("cf-email");
  const msgInput = document.getElementById("cf-message");

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = msgInput.value.trim();

    form.querySelectorAll(".field").forEach(f => f.classList.remove("error"));
    const bad = [];
    if (!name) bad.push(nameInput);
    if (!emailRe.test(email)) bad.push(emailInput);
    if (!message) bad.push(msgInput);

    if (bad.length) {
      bad.forEach(el => el.closest(".field").classList.add("error"));
      note.className = "form-note err";
      note.textContent = "Please fill in all fields with a valid email.";
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.subject = `New portfolio message from ${name}`;
    data.replyto = email;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    note.className = "form-note";
    note.textContent = "";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        note.className = "form-note ok";
        note.textContent = "✓ Message sent! Thank you — I'll get back to you soon.";
        form.reset();
      } else {
        throw new Error(result.message || "Request failed");
      }
    } catch (err) {
      note.className = "form-note err";
      note.innerHTML = 'Sorry, something went wrong. Please email me directly at <a href="mailto:aimanfatima111225@gmail.com">aimanfatima111225@gmail.com</a>.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });

  /* ---------- Giant footer name ---------- */
  const bigName = document.getElementById("big-name");
  bigName.querySelectorAll(".big-name-layer").forEach(layer => {
    const text = layer.dataset.text;
    layer.innerHTML = [...text].map((c, i) =>
      c === " "
        ? `<span class="ch space"></span>`
        : `<span class="ch"><span style="--i:${i}">${c}</span></span>`
    ).join("");
  });

  // Scale the font so the name fills the width exactly
  const baseLayer = bigName.querySelector(".big-name-layer.base");
  const fitBigName = () => {
    bigName.style.fontSize = "100px";
    const avail = bigName.clientWidth - 32;           // minus side padding
    const natural = baseLayer.scrollWidth;
    if (natural > 0) bigName.style.fontSize = Math.floor(100 * avail / natural) + "px";
  };
  fitBigName();
  window.addEventListener("resize", fitBigName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitBigName);

  if ("IntersectionObserver" in window && !prefersReduced) {
    const nameIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { bigName.classList.add("in"); nameIO.disconnect(); }
      });
    }, { threshold: 0.35 });
    nameIO.observe(bigName);
  } else {
    bigName.classList.add("in");
  }

  /* ---------- Background: soft connected particles ---------- */
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, dpr, particles = [];
  let pColor = "185,166,255", pAlpha = 0.55;
  const readParticleColors = () => {
    const cs = getComputedStyle(root);
    pColor = cs.getPropertyValue("--particle").trim() || pColor;
    pAlpha = parseFloat(cs.getPropertyValue("--particle-alpha")) || 0;
  };
  readParticleColors();
  document.addEventListener("themechange", readParticleColors);

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, (W * H) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    if (pAlpha <= 0) { if (!prefersReduced) requestAnimationFrame(draw); return; }
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pColor},${pAlpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.strokeStyle = `rgba(${pColor},${0.22 * pAlpha * (1 - d / maxDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    if (!prefersReduced) requestAnimationFrame(draw);
  };

  resize();
  draw();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
});
