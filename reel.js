/* =========================================
   The Reel — plays the intro like a story
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reel = document.getElementById("reel");
  if (!reel) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scenes = Array.from(reel.querySelectorAll(".scene"));
  const durs = scenes.map(s => Number(s.dataset.dur) || 4000);
  const starts = durs.map((d, i) => durs.slice(0, i).reduce((a, b) => a + b, 0));
  const TOTAL = durs.reduce((a, b) => a + b, 0);
  const N = scenes.length;

  const $ = id => document.getElementById(id);
  const stage = $("reel-stage");
  const playBtn = $("rb-play"), soundBtn = $("rb-sound"), progBtn = $("rb-prog");
  const programme = $("programme"), progList = $("programme-list");
  const storyScene = $("story-scene"), rbScene = $("rb-scene");

  /* ---------- Story progress segments ---------- */
  const barsBox = $("story-bars");
  const bars = scenes.map(() => {
    const seg = document.createElement("span");
    const fill = document.createElement("i");
    seg.appendChild(fill);
    barsBox.appendChild(seg);
    return fill;
  });

  /* ---------- Photo: colour cut-out (background removed) ---------- */
  const photo = $("reel-photo"), pctx = photo.getContext("2d");
  const photoSrc = $("reel-photo-src");

  const loadPhoto = () => {
    const PW = 520, PH = Math.round(PW * 5 / 4);
    photo.width = PW; photo.height = PH;
    // cover-crop into a 4:5 frame, biased to the top (faces)
    const ir = photoSrc.naturalWidth / photoSrc.naturalHeight, fr = PW / PH;
    let sw = photoSrc.naturalWidth, sh = photoSrc.naturalHeight, sx = 0, sy = 0;
    if (ir > fr) { sw = sh * fr; sx = (photoSrc.naturalWidth - sw) / 2; }
    else { sh = sw / fr; sy = (photoSrc.naturalHeight - sh) * 0.2; }
    pctx.drawImage(photoSrc, sx, sy, sw, sh, 0, 0, PW, PH);
    try {
      const img = pctx.getImageData(0, 0, PW, PH), px = img.data;
      // Flood-fill from the top and side edges through pixels close to the
      // corner colour; those are the plain studio background
      const ref = [0, 1, 2].map(k => (px[k] + px[(PW - 1) * 4 + k]) / 2);
      const dist = i => Math.hypot(px[i * 4] - ref[0], px[i * 4 + 1] - ref[1], px[i * 4 + 2] - ref[2]);
      const bg = new Uint8Array(PW * PH);
      const stack = [];
      for (let x = 0; x < PW; x++) stack.push(x);
      for (let y = 0; y < PH; y++) stack.push(y * PW, y * PW + PW - 1);
      while (stack.length) {
        const i = stack.pop();
        if (bg[i] || dist(i) > 34) continue;
        bg[i] = 1;
        const x = i % PW;
        if (x > 0) stack.push(i - 1);
        if (x < PW - 1) stack.push(i + 1);
        if (i >= PW) stack.push(i - PW);
        if (i < PW * (PH - 1)) stack.push(i + PW);
      }
      // Soft edge: fade pixels that sit next to the background
      for (let i = 0; i < bg.length; i++) {
        if (bg[i]) { px[i * 4 + 3] = 0; continue; }
        const x = i % PW;
        const edge = (x > 0 && bg[i - 1]) || (x < PW - 1 && bg[i + 1]) || (i >= PW && bg[i - PW]) || (i < bg.length - PW && bg[i + PW]);
        if (edge) px[i * 4 + 3] = 120;
      }
      pctx.putImageData(img, 0, 0);
    } catch (e) {
      // opened from file:// — the canvas can't be read, so keep the plain photo
    }
    photo.closest(".hello-photo").classList.add("has-photo");
  };
  if (photoSrc.complete && photoSrc.naturalWidth) loadPhoto();
  else photoSrc.addEventListener("load", loadPhoto);

  /* ---------- Sound (soft synthesised pops, off by default) ---------- */
  let audio = null, soundOn = false;
  const pop = (freq = 660, len = 0.12, vol = 0.05, type = "sine") => {
    if (!soundOn || !audio) return;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, audio.currentTime + len);
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + len);
    o.connect(g).connect(audio.destination);
    o.start(); o.stop(audio.currentTime + len);
  };
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn && !audio) {
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { soundOn = false; }
    }
    if (audio && audio.state === "suspended") audio.resume();
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on");
    soundBtn.textContent = soundOn ? "🔊" : "🔇";
    pop(520);
  });

  /* ---------- Per-scene extras ---------- */
  let typeTimer = null;
  const typeLine = (el) => {
    clearInterval(typeTimer);
    const text = el.dataset.type.replace(/&amp;/g, "&");
    let i = 0;
    el.textContent = "";
    typeTimer = setInterval(() => {
      if (!playing) return;
      el.textContent = text.slice(0, ++i);
      if (i % 3 === 0) pop(1600, 0.03, 0.012, "triangle");
      if (i >= text.length) clearInterval(typeTimer);
    }, 40);
  };

  const apWords = ["Understand", "Design", "Build", "Refine"];
  const apNum = reel.querySelector(".ap-num"), apWord = reel.querySelector(".ap-word");
  const apDots = Array.from(reel.querySelectorAll(".ap-line span"));
  let apStep = -1;
  const setApproach = (step) => {
    if (step === apStep) return;
    apStep = step;
    apNum.textContent = step + 1;
    apWord.textContent = apWords[step];
    apWord.classList.remove("flip"); void apWord.offsetWidth; apWord.classList.add("flip");
    apDots.forEach((d, i) => d.classList.toggle("hit", i <= step));
    pop(500 + step * 110, 0.14, 0.05);
  };

  /* ---------- Scene list ---------- */
  scenes.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<span>${i + 1}</span>${s.dataset.label}`;
    b.addEventListener("click", () => { seek(i); play(); toggleProgramme(false); });
    li.appendChild(b);
    progList.appendChild(li);
  });
  const progBtns = Array.from(progList.querySelectorAll("button"));
  const toggleProgramme = (open) => {
    programme.classList.toggle("open", open);
    progBtn.setAttribute("aria-expanded", String(open));
  };
  progBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleProgramme(!programme.classList.contains("open")); });
  document.addEventListener("click", (e) => { if (!programme.contains(e.target)) toggleProgramme(false); });

  /* ---------- Playback ---------- */
  let t = 0, playing = false, last = 0, current = -1, ended = false;

  const showScene = (i) => {
    if (i === current) return;
    current = i;
    scenes.forEach((s, k) => s.classList.toggle("on", k === i));
    // restart the scene's CSS animations
    const s = scenes[i];
    s.classList.remove("on"); void s.offsetWidth; s.classList.add("on");

    storyScene.textContent = s.dataset.label.toLowerCase();
    rbScene.textContent = `${i + 1} / ${N} · ${s.dataset.label}`;
    progBtns.forEach((b, k) => b.classList.toggle("current", k === i));
    if (i > 0) pop(440 + i * 40, 0.1, 0.035);

    const typer = s.querySelector(".type-line");
    if (typer) typeLine(typer);
    if (s.classList.contains("sc-approach")) { apStep = -1; setApproach(0); }
  };

  const sceneAt = (ms) => {
    for (let i = N - 1; i >= 0; i--) if (ms >= starts[i]) return i;
    return 0;
  };

  const render = () => {
    const i = sceneAt(t);
    showScene(i);
    const local = t - starts[i];
    if (scenes[i].classList.contains("sc-approach")) {
      setApproach(Math.min(3, Math.floor(local / (durs[i] / 4.2))));
    }
    bars.forEach((b, k) => {
      const p = k < i ? 1 : k > i ? 0 : Math.min(1, local / durs[i]);
      b.style.transform = `scaleX(${p})`;
    });
  };

  const loop = (now) => {
    if (!playing) return;
    t += Math.min(now - last, 100);   // don't jump after a background tab
    last = now;
    if (t >= TOTAL) { t = TOTAL - 1; render(); pause(true); return; }
    render();
    requestAnimationFrame(loop);
  };

  const setPlayBtn = (icon, label) => { playBtn.textContent = icon; playBtn.setAttribute("aria-label", label); };
  const play = () => {
    if (ended) { t = 0; current = -1; ended = false; }
    if (playing) return;
    playing = true;
    reel.classList.remove("paused");
    setPlayBtn("❚❚", "Pause reel");
    last = performance.now();
    requestAnimationFrame(loop);
  };
  const pause = (finished = false) => {
    playing = false;
    ended = finished;
    reel.classList.add("paused");
    setPlayBtn(finished ? "↺" : "▶", finished ? "Replay reel" : "Play reel");
  };
  const seek = (i) => {
    t = starts[i]; current = -1; ended = false;
    render();
  };

  let userPaused = false;
  playBtn.addEventListener("click", () => {
    if (audio && audio.state === "suspended") audio.resume();
    playing ? pause() : play();
    userPaused = !playing;
  });

  // Tap the stage like a story: left third goes back, the rest goes forward
  stage.addEventListener("click", (e) => {
    if (e.target.closest("a, button, .programme")) return;
    const r = stage.getBoundingClientRect();
    const i = sceneAt(t);
    if (e.clientX - r.left < r.width / 3) seek(Math.max(0, i - 1));
    else if (i < N - 1) seek(i + 1);
    else return;
    if (!userPaused) play();
  });

  // Keyboard: space toggles while the reel is on screen, arrows step scenes
  let inView = true;
  document.addEventListener("keydown", (e) => {
    if (!inView || e.target.closest("input, textarea, button, a")) return;
    if (e.code === "Space") { e.preventDefault(); playing ? pause() : play(); userPaused = !playing; }
    if (e.key === "ArrowRight") seek(Math.min(N - 1, sceneAt(t) + 1));
    if (e.key === "ArrowLeft") seek(Math.max(0, sceneAt(t) - 1));
  });

  // Pause when scrolled away, resume when back (unless the viewer paused it)
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (prefersReduced) return;
      if (!inView && playing) pause();
      else if (inView && !playing && !userPaused && !ended) play();
    }, { threshold: 0.35 }).observe(reel);
  }

  // "Replay the reel" links start it again from scene one
  document.querySelectorAll(".replay-link").forEach(a => a.addEventListener("click", () => {
    userPaused = false; seek(0); play();
  }));

  // Reduced motion: no autoplay, open on the Hello card
  if (prefersReduced) {
    reel.classList.add("paused");
    t = starts[1];
    render();
    setPlayBtn("▶", "Play reel");
  } else {
    render();
    play();
  }
});
