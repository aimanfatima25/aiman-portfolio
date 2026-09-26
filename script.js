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
  const THEMES = ["midnight", "daylight", "cherry", "mocha"];

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

  /* ---------- Cherry Cream: scatter cherries ---------- */
  const cherryBox = document.getElementById("cherries");
  const cherrySVG = `
    <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 6 C31 20 24 30 19 44" fill="none" stroke="#5b3a1e" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M34 6 C38 22 43 32 45 46" fill="none" stroke="#5b3a1e" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M34 7 C40 1 51 2 56 9 C48 13 40 12 34 7 Z" fill="#4f8a3c"/>
      <path d="M36 7 C42 6 48 7 53 9" fill="none" stroke="#3b6b2c" stroke-width="1"/>
      <circle cx="18" cy="53" r="12" fill="#b3172e"/>
      <circle cx="45" cy="55" r="12" fill="#c8243c"/>
      <ellipse cx="13.5" cy="48.5" rx="3.6" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-30 13.5 48.5)"/>
      <ellipse cx="40.5" cy="50.5" rx="3.6" ry="2.4" fill="#fff" opacity=".55" transform="rotate(-30 40.5 50.5)"/>
    </svg>`;

  // Small seeded random so the layout looks the same on every visit
  let seed = 7;
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

  const scatterCherries = () => {
    cherryBox.innerHTML = "";
    seed = 7;
    const h = document.documentElement.scrollHeight;
    const w = window.innerWidth;
    const small = w < 860;
    const gap = small ? 420 : 300;               // vertical spacing between cherries
    const count = Math.ceil(h / gap);
    for (let i = 0; i < count; i++) {
      const left = i % 2 === 0;
      const size = (small ? 26 : 34) + rand() * (small ? 10 : 18);
      // On phones, tuck cherries half off the screen edge so they never cover text
      const edge = small ? `${-size * 0.45}px` : (1.5 + rand() * 6) + "%";
      const el = document.createElement("div");
      el.className = "cherry";
      el.innerHTML = cherrySVG;
      el.style.width = size + "px";
      el.style.top = (i * gap + 120 + rand() * (gap - 160)) + "px";
      el.style[left ? "left" : "right"] = edge;
      el.style.setProperty("--r", (left ? -1 : 1) * (8 + rand() * 14) + "deg");
      el.style.animationDelay = (-rand() * 6) + "s";
      el.style.opacity = (small ? 0.55 : 0.8 + rand() * 0.2).toFixed(2);
      cherryBox.appendChild(el);
    }
  };
  scatterCherries();
  let ct;
  window.addEventListener("resize", () => { clearTimeout(ct); ct = setTimeout(scatterCherries, 200); });
  window.addEventListener("load", scatterCherries);

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

  /* ---------- Contact form (opens email app, no backend) ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    form.querySelectorAll(".field").forEach(f => f.classList.remove("error"));
    const bad = [];
    if (!name) bad.push(form.name);
    if (!emailRe.test(email)) bad.push(form.email);
    if (!message) bad.push(form.message);

    if (bad.length) {
      bad.forEach(el => el.closest(".field").classList.add("error"));
      note.className = "form-note err";
      note.textContent = "Please fill in all fields with a valid email.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:aimanfatima111225@gmail.com?subject=${subject}&body=${body}`;

    note.className = "form-note ok";
    note.textContent = "Opening your email app… thank you for reaching out!";
    form.reset();
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
