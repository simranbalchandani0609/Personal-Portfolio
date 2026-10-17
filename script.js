/* =====================================================================
   Simran Balchandani: portfolio script (v4)
   Plain JavaScript, no libraries. Every feature is wrapped so that if one
   part fails, the rest of the page (and all the content) still works.

   Sections: menu, current-section marker, scroll reveal, screenshot
   enlarger, copy-email, footer year, skill map, jump palette, header and
   parallax, carousel rows, project dialogs, hero background, doodle pad.
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 0. Opening video (assets/video/sb-intro.mp4 / .webm, with its own sound) ----------
     Plays once per tab session. Browsers block sound until a click or tap, so unless audio is already allowed the
     visitor gets one choice first. If the video can't load or play, the intro is skipped and the site opens. */
  function initIntro() {
    var root = document.documentElement, el = document.getElementById("intro"), vid = document.getElementById("intro-video");
    var soundB = document.getElementById("intro-sound"), skipB = document.getElementById("intro-skip"), replayB = document.getElementById("replay-intro");
    var startB = document.getElementById("intro-start"), silentB = document.getElementById("intro-silent");
    if (!el || !vid || !soundB || !skipB || !startB || !silentB) { root.classList.remove("intro-on"); return; }
    var running = false, replay = false, started = false, fatal = false, gateTimer = 0, guard = 0, pref = null;
    function readPref() { try { pref = localStorage.getItem("sb-sound"); } catch (e) { pref = null; } }
    function setPref(v) { try { localStorage.setItem("sb-sound", v ? "1" : "0"); } catch (e) {} }
    function label() {
      var on = started && !vid.muted && !vid.paused;
      soundB.setAttribute("aria-pressed", String(on));
      soundB.textContent = on ? "Sound: on" : "Sound: off";
    }
    function finish(fast) {
      if (!running) return;
      running = false; clearTimeout(gateTimer); clearTimeout(guard);
      document.removeEventListener("keydown", onKey);
      el.classList.toggle("is-skipping", !!fast);
      el.classList.add("is-leaving");
      setTimeout(function () {
        try { vid.pause(); } catch (e) {}
        root.classList.remove("intro-on");
        el.classList.remove("is-leaving", "is-skipping", "is-playing", "is-waiting");
        [].forEach.call(document.body.children, function (n) { if (n._wasInert === false) { n.inert = false; } delete n._wasInert; });
        try { sessionStorage.setItem("sb-intro", "1"); } catch (e) {}
        if (replay) { window.scrollTo(0, 0); if (replayB) replayB.focus(); }
      }, fast ? 200 : 450);
    }
    function onKey(e) { if (e.key === "Escape") finish(true); }

    // Try to play. withSound=false plays muted. Resolves true when playback really started.
    function tryPlay(withSound) {
      vid.muted = !withSound;
      try { vid.currentTime = 0; } catch (e) {}
      var p = vid.play();
      return (p && p.then ? p.then(function () { return true; }) : Promise.resolve(true)).catch(function (e) {
        // NotAllowedError = sound blocked until a click (normal). NotSupportedError = the video file is missing or unplayable.
        if (e && e.name === "NotSupportedError") fatal = true;
        return false;
      });
    }
    function begin(withSound) {
      if (!running || started) return;
      clearTimeout(gateTimer);
      el.classList.add("is-waiting");
      tryPlay(withSound).then(function (ok) {
        if (!running || started) return;
        if (fatal) { finish(true); return; }
        if (!ok && withSound) return tryPlay(false).then(function (ok2) { return { ok: ok2, sound: false }; });
        return { ok: ok, sound: withSound };
      }).then(function (r) {
        if (!running || started || !r) return;
        if (!r.ok) { finish(true); return; }          // can't play at all: just open the site
        started = true; setPref(r.sound);
        el.classList.remove("is-waiting"); el.classList.add("is-playing");
        label(); skipB.focus({ preventScroll: true });
        // a safety net so a stalled video can never trap the visitor
        var len = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 6.5;
        guard = setTimeout(function () { finish(false); }, (len + 2) * 1000);
      });
    }
    function show(isReplay) {
      if (running) return;
      running = true; replay = !!isReplay; started = false; readPref();
      if (isReplay) { window.scrollTo(0, 0); el.classList.remove("is-playing", "is-leaving", "is-waiting"); root.classList.add("intro-on"); }
      [].forEach.call(document.body.children, function (n) { if (n !== el && n.tagName !== "SCRIPT" && !n.inert) { n._wasInert = false; n.inert = true; } });
      document.addEventListener("keydown", onKey);
      if (reduceMotion) { finish(true); return; }        // visitors who prefer reduced motion go straight to the site
      if (isReplay) { begin(pref !== "0"); return; }       // the replay click is itself a user gesture
      if (pref === "0") { begin(false); return; }
      // Try sound first; browsers that allow it start straight away, otherwise the gate stays up.
      el.classList.add("is-waiting");
      tryPlay(true).then(function (ok) {
        if (!running) return;
        if (fatal) { finish(true); return; }          // the video can't be loaded: open the site instead of waiting
        if (ok) { started = true; setPref(true); el.classList.remove("is-waiting"); el.classList.add("is-playing"); label(); var len = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 6.5; guard = setTimeout(function () { finish(false); }, (len + 2) * 1000); skipB.focus({ preventScroll: true }); return; }
        el.classList.remove("is-waiting");
        startB.focus({ preventScroll: true });
        gateTimer = setTimeout(function () { begin(false); }, 8000);
      });
    }

    vid.addEventListener("ended", function () { finish(false); });
    vid.addEventListener("error", function () { finish(true); });
    // With <source> children, a missing file raises "error" on the last <source>, not on the video
    var srcs = vid.querySelectorAll("source");
    if (srcs.length) srcs[srcs.length - 1].addEventListener("error", function () { if (!started) finish(true); });
    // Watchdog: if nothing is playing and no gate choice is pending, never keep the visitor on a black screen
    setTimeout(function () { if (running && !started && vid.readyState === 0 && vid.networkState !== 2) finish(true); }, 3500);
    startB.addEventListener("click", function () { begin(true); });
    silentB.addEventListener("click", function () { begin(false); });
    soundB.addEventListener("click", function () {
      vid.muted = !vid.muted; setPref(!vid.muted);
      if (!vid.muted && vid.paused === false) { /* sound switches on from here */ }
      label();
    });
    skipB.addEventListener("click", function () { finish(true); });
    if (replayB) replayB.addEventListener("click", function () { show(true); });
    window.sbReplayIntro = function () { if (replayB) replayB.click(); };

    if (root.classList.contains("intro-on")) show(false); else label();
  }

  /* ---------- 1. Mobile menu ---------- */
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a link
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tapping outside closes it
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !e.target.closest(".site-header")) setOpen(false);
    });

    // If the window is resized to desktop width, reset the state
    window.matchMedia("(min-width: 56rem)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });
  }

  /* ---------- 2. Mark the current section in the nav ---------- */
  function initActiveLink() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });

    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!sections.length) return;

    function mark(id) {
      links.forEach(function (a) {
        if (a === map[id]) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }

    // A section counts as "current" while it crosses a band near the top of the screen
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) mark(entry.target.id);
      });
    }, { rootMargin: "-20% 0px -70% 0px" });

    sections.forEach(function (s) { io.observe(s); });

    // The last section (Contact) is too short to reach the marker band, so when the
    // visitor is at the very bottom of the page, mark it as current.
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) mark(sections[sections.length - 1].id);
      });
    }, { passive: true });
  }

  /* ---------- 3. Scroll reveal: headings and rows fade in once; tiles slide in one after another ---------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal, .row"));
    if (!items.length || !("IntersectionObserver" in window)) return; // content simply stays visible
    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--d", Math.min(shown * 60, 240) + "ms");
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
        shown++;
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    // Safety net: if anything is still hidden after 3 seconds, show it
    setTimeout(function () { items.forEach(function (el) { el.classList.add("is-in"); }); }, 3000);
  }

  /* ---------- 5. Screenshot enlarger (native <dialog>) ---------- */
  function initLightbox() {
    var dialog = document.getElementById("lightbox");
    var big = document.getElementById("lightbox-img");
    if (!dialog || !big || typeof dialog.showModal !== "function") return; // links open the image in a new tab instead

    document.querySelectorAll("a.shot").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var img = link.querySelector("img");
        big.src = link.getAttribute("href");
        big.alt = img ? img.alt : "";
        dialog.showModal();
      });
    });

    // Click on the dark backdrop closes it too
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------- 6. Copy-email button ---------- */
  function initCopy() {
    var btn = document.getElementById("copy-email");
    var status = document.getElementById("copy-status");
    if (!btn || !status) return;
    var email = btn.getAttribute("data-email");
    var timer;

    function say(msg) {
      status.textContent = msg;
      clearTimeout(timer);
      timer = setTimeout(function () { status.textContent = ""; }, 4000);
    }

    // Fallback for browsers without the Clipboard API: select a hidden field and copy
    function legacyCopy() {
      var field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(field);
      return ok;
    }

    btn.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () { say("Email address copied."); },
          function () { say(legacyCopy() ? "Email address copied." : "Couldn't copy automatically. The address is: " + email); }
        );
      } else {
        say(legacyCopy() ? "Email address copied." : "Couldn't copy automatically. The address is: " + email);
      }
    });
  }

  /* ---------- 7. Footer year ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }


  /* ---------- 8. Skill map: tap a project or a tool ---------- */
  function initMap() {
    var root = document.querySelector("[data-map]");
    if (!root) return;
    var nodes = [].slice.call(root.querySelectorAll(".map-node"));
    var tools = [].slice.call(root.querySelectorAll(".map-tool"));
    var out = document.getElementById("map-readout");
    var names = { medicloud: "MediCloud v2", flight: "Flight Management Dashboard" };
    var idle = out ? out.textContent : "";
    function clear() {
      root.removeAttribute("data-sel");
      nodes.concat(tools).forEach(function (b) { b.setAttribute("aria-pressed", "false"); b.classList.remove("on"); });
      if (out) out.textContent = idle;
    }
    function pickProject(key, btn) {
      if (btn.getAttribute("aria-pressed") === "true") return clear();
      clear(); root.setAttribute("data-sel", "1");
      btn.setAttribute("aria-pressed", "true"); btn.classList.add("on");
      var used = tools.filter(function (t) { return t.dataset.uses.split(" ").indexOf(key) > -1; });
      used.forEach(function (t) { t.classList.add("on"); });
      if (out) out.textContent = names[key] + " used " + used.length + " of these tools: " + used.map(function (t) { return t.textContent; }).join(", ") + ".";
    }
    function pickTool(btn) {
      if (btn.getAttribute("aria-pressed") === "true") return clear();
      clear(); root.setAttribute("data-sel", "1");
      btn.setAttribute("aria-pressed", "true"); btn.classList.add("on");
      var keys = btn.dataset.uses.split(" ");
      nodes.forEach(function (n) { if (keys.indexOf(n.dataset.key) > -1) n.classList.add("on"); });
      if (out) out.textContent = btn.textContent + " was used in " + keys.map(function (k) { return names[k]; }).join(" and ") + ".";
    }
    nodes.forEach(function (n) { n.addEventListener("click", function () { pickProject(n.dataset.key, n); }); });
    tools.forEach(function (t) { t.addEventListener("click", function () { pickTool(t); }); });
  }

  /* ---------- 9. Jump palette (K or / opens it) ---------- */
  function initPalette() {
    var dlg = document.getElementById("palette");
    var input = document.getElementById("palette-input");
    var list = document.getElementById("palette-list");
    var openers = [].slice.call(document.querySelectorAll("#open-palette"));
    if (!dlg || !input || !list || typeof dlg.showModal !== "function") { openers.forEach(function (b) { b.hidden = true; var li = b.closest("li"); if (li) li.hidden = true; }); return; }

    var email = (document.getElementById("copy-email") || {}).dataset ? document.getElementById("copy-email").dataset.email : "";
    var items = [
      { t: "Home", k: "top start hero", go: "#home" },
      { t: "About", k: "who me", go: "#about" },
      { t: "Projects", k: "work medicloud flight gis", go: "#projects" },
      { t: "Skills", k: "tools", go: "#skills" },
      { t: "Skill map", k: "tools projects interactive", go: "#map" },
      { t: "Education", k: "school mpstme nmims", go: "#education" },
      { t: "Experience", k: "internship teaching committees", go: "#r-exp" },
      { t: "Courses and certificates", k: "certifications coursera aws azure prompt", go: "#r-certs" },
      { t: "Contact", k: "email reach", go: "#contact" },
      { t: "Replay the intro", k: "intro animation logo sound video", run: function () { if (window.sbReplayIntro) window.sbReplayIntro(); } },
      { t: "Open the doodle pad", k: "draw pen fun sketch", run: function () { var b = document.getElementById("doodle-open"); if (b) b.click(); } },
      { t: "Copy my email", k: "email copy", run: function () { var b = document.getElementById("copy-email"); if (b) b.click(); } },
      { t: "Open GitHub", k: "code", go: "https://github.com/simranbalchandani0609", ext: true },
      { t: "Open LinkedIn", k: "profile", go: "https://linkedin.com/in/simran-balchandani-421b56434", ext: true }
    ];
    var shown = [], idx = 0, lastFocus = null;

    function render() {
      var q = input.value.trim().toLowerCase();
      shown = items.filter(function (it) { return !q || (it.t + " " + it.k).toLowerCase().indexOf(q) > -1; });
      idx = 0;
      list.innerHTML = "";
      shown.forEach(function (it, i) {
        var li = document.createElement("li");
        li.setAttribute("role", "option"); li.id = "pal-" + i;
        li.setAttribute("aria-selected", i === 0 ? "true" : "false");
        li.textContent = it.t + (it.ext ? " ↗" : "");
        li.addEventListener("click", function () { choose(i); });
        list.appendChild(li);
      });
      if (!shown.length) { var e = document.createElement("li"); e.className = "none"; e.textContent = "Nothing matches that."; list.appendChild(e); }
      input.setAttribute("aria-activedescendant", shown.length ? "pal-0" : "");
    }
    function mark(i) {
      var opts = list.querySelectorAll("[role=option]"); if (!opts.length) return;
      idx = (i + opts.length) % opts.length;
      [].forEach.call(opts, function (o, j) { o.setAttribute("aria-selected", j === idx ? "true" : "false"); });
      opts[idx].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", "pal-" + idx);
    }
    function choose(i) {
      var it = shown[i]; if (!it) return;
      dlg.close();
      if (it.run) it.run();
      else if (it.ext) window.open(it.go, "_blank", "noopener");
      else { var el = document.querySelector(it.go); if (el) { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); history.replaceState(null, "", it.go); } }
    }
    function open() { lastFocus = document.activeElement; input.value = ""; render(); dlg.showModal(); input.focus(); }

    openers.forEach(function (b) { b.addEventListener("click", open); });
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); mark(idx + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); mark(idx - 1); }
      else if (e.key === "Enter") { e.preventDefault(); choose(idx); }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); } return; }
      var t = e.target;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable || dlg.open) return;
      if (e.key === "k" || e.key === "K" || e.key === "/") { e.preventDefault(); open(); }
    });
  }


  /* ---------- 12. Header: solid after scrolling, progress bar ---------- */
  function initHeader() {
    var header = document.getElementById("site-header");
    var bar = document.getElementById("progress");
    var ticking = false, heroBg = document.querySelector(".hero-bg");
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (header) header.classList.toggle("is-solid", y > 40);
      if (heroBg && !reduceMotion && y < window.innerHeight) heroBg.style.setProperty("--py", Math.round(y * 0.08) + "px");
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- 13. Rows: arrow buttons, edge state, tile order for the stagger ---------- */
  function initRows() {
    [].forEach.call(document.querySelectorAll("[data-row]"), function (row) {
      var rail = row.querySelector(".rail");
      var prev = row.querySelector(".row-arrow.prev");
      var next = row.querySelector(".row-arrow.next");
      if (!rail) return;
      [].forEach.call(rail.children, function (t, i) { t.style.setProperty("--i", i); });
      function state() {
        var max = rail.scrollWidth - rail.clientWidth;
        if (prev) prev.toggleAttribute("data-off", rail.scrollLeft <= 2);
        if (next) next.toggleAttribute("data-off", rail.scrollLeft >= max - 2);
      }
      function go(dir) {
        rail.scrollBy({ left: dir * Math.max(rail.clientWidth * 0.8, 200), behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (prev) prev.addEventListener("click", function () { go(-1); });
      if (next) next.addEventListener("click", function () { go(1); });
      var t = false;
      rail.addEventListener("scroll", function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; state(); }); } }, { passive: true });
      window.addEventListener("resize", state);
      state();
    });
  }

  /* ---------- 14. Project detail dialogs ---------- */
  function initDetails() {
    [].forEach.call(document.querySelectorAll("[data-open]"), function (b) {
      b.addEventListener("click", function () {
        var d = document.getElementById(b.getAttribute("data-open"));
        if (!d) return;
        if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
      });
    });
    [].forEach.call(document.querySelectorAll("dialog.detail"), function (d) {
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      d.addEventListener("close", function () { var v = d.querySelector("video"); if (v) v.pause(); });
    });
  }

  /* ---------- 15. Hero background: a few drifting points and faint links (decorative) ---------- */
  /* ---------- Pointer effects (mouse only): hero glow follows the cursor, main buttons lean slightly toward it ---------- */
  function initPointerFx() {
    if (reduceMotion || !window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var hero = document.getElementById("home"), glow = hero && hero.querySelector(".hero-glow"), raf = 0, px = 0, py = 0;
    if (glow) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; glow.style.setProperty("--gx", px + "px"); glow.style.setProperty("--gy", py + "px"); glow.classList.add("on"); });
      });
      hero.addEventListener("pointerleave", function () { glow.classList.remove("on"); });
    }
    [].forEach.call(document.querySelectorAll(".btn-play, .btn-info"), function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.18 - 2).toFixed(1) + "px)";
      });
      b.addEventListener("pointerdown", function () { b.style.transform = "scale(.97)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  function initNodes() {
    var cv = document.getElementById("nodes");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), pts = [], w = 0, h = 0, raf = 0, visible = true;
    function size() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(44, Math.max(16, w / 32)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, red: Math.random() < 0.12 });
    }
    function draw(move) {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, d;
      for (i = 0; i < pts.length; i++) {
        a = pts[i];
        if (move) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > w) a.vx *= -1; if (a.y < 0 || a.y > h) a.vy *= -1; }
        for (j = i + 1; j < pts.length; j++) {
          b = pts[j]; d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { ctx.strokeStyle = "rgba(255,255,255," + ((1 - d / 130) * 0.28).toFixed(3) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      for (i = 0; i < pts.length; i++) { a = pts[i]; ctx.fillStyle = a.red ? "rgba(229,9,20,.9)" : "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.arc(a.x, a.y, a.red ? 3 : 1.8, 0, 6.2832); ctx.fill(); }
    }
    function loop() { draw(true); raf = requestAnimationFrame(loop); }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    size(); draw(false);
    window.addEventListener("resize", function () { size(); draw(false); });
    if (reduceMotion) return; // one still frame only
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(cv);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    start();
  }

  /* ---------- 16. Doodle panel (canvas with stroke history) ---------- */
  function initSketch() {
    function $(id) { return document.getElementById(id); }
    var dlg = $("sketch"), openBtn = $("doodle-open"), cv = $("sk-canvas");
    if (!dlg || !openBtn || !cv || !cv.getContext || typeof dlg.show !== "function") { if (openBtn) openBtn.hidden = true; return; }
    var ctx = cv.getContext("2d"), BG = "#141414", W = cv.width, H = cv.height;
    var colorIn = $("sk-color"), sizeIn = $("sk-size"), sizeOut = $("sk-size-out");
    var penB = $("sk-pen"), eraB = $("sk-eraser"), undoB = $("sk-undo"), clearB = $("sk-clear"), saveB = $("sk-save");
    var box = $("sk-confirm"), yes = $("sk-yes"), no = $("sk-no"), status = $("sk-status"), closeB = $("sk-close"), title = $("sketch-title");
    var swatches = [].slice.call(dlg.querySelectorAll(".sw"));
    var idleMsg = status.textContent;
    var strokes = [], cur = null, tool = "pen", color = colorIn.value, msgTimer, closing = 0;

    function say(m) { status.textContent = m; clearTimeout(msgTimer); msgTimer = setTimeout(function () { status.textContent = idleMsg; }, 3500); }
    function paintBg() { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }
    function drawStroke(s) {
      var p = s.pts, i;
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.size;
      if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y, s.size / 2, 0, 6.2832); ctx.fill(); return; }
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y);
      for (i = 1; i < p.length - 1; i++) ctx.quadraticCurveTo(p[i].x, p[i].y, (p[i].x + p[i + 1].x) / 2, (p[i].y + p[i + 1].y) / 2);
      ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y); ctx.stroke();
    }
    function sync() { undoB.disabled = !strokes.length; }
    function redraw() { paintBg(); strokes.forEach(drawStroke); sync(); }
    function point(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; }

    function addPoint(e) {
      // Each new piece is drawn straight away so the line follows the pointer; the stroke is redrawn smoothed when you lift
      var p = point(e), last = cur.pts[cur.pts.length - 1];
      cur.pts.push(p);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = cur.color; ctx.lineWidth = cur.size;
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    cv.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      var r = cv.getBoundingClientRect(), p = point(e);
      cur = { color: tool === "eraser" ? BG : color, size: Number(sizeIn.value) * (W / r.width) * (tool === "eraser" ? 1.8 : 1), pts: [p] };
      strokes.push(cur);
      ctx.fillStyle = cur.color; ctx.beginPath(); ctx.arc(p.x, p.y, cur.size / 2, 0, 6.2832); ctx.fill();
      sync();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!cur) return;
      var list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (list && list.length) list.forEach(addPoint); else addPoint(e);
    });
    function endStroke() { if (!cur) return; cur = null; redraw(); }
    cv.addEventListener("pointerup", endStroke);
    cv.addEventListener("pointercancel", endStroke);

    function setTool(t) { tool = t; penB.setAttribute("aria-pressed", String(t === "pen")); eraB.setAttribute("aria-pressed", String(t === "eraser")); }
    function setColor(c) { color = c; colorIn.value = c; setTool("pen"); swatches.forEach(function (s) { s.setAttribute("aria-pressed", String(s.getAttribute("data-c").toLowerCase() === c.toLowerCase())); }); }
    penB.addEventListener("click", function () { setTool("pen"); });
    eraB.addEventListener("click", function () { setTool("eraser"); say("Eraser on. Draw over a stroke to remove it."); });
    colorIn.addEventListener("input", function () { setColor(colorIn.value); });
    swatches.forEach(function (s) { s.addEventListener("click", function () { setColor(s.getAttribute("data-c")); }); });
    sizeIn.addEventListener("input", function () { sizeOut.textContent = sizeIn.value; });

    function undo() { if (!strokes.length) return; strokes.pop(); redraw(); say("Undid the last stroke."); }
    undoB.addEventListener("click", undo);

    clearB.addEventListener("click", function () {
      if (!strokes.length) { say("The canvas is already empty."); return; }
      box.hidden = false; no.focus();
    });
    yes.addEventListener("click", function () { strokes = []; redraw(); box.hidden = true; say("Canvas cleared."); clearB.focus(); });
    no.addEventListener("click", function () { box.hidden = true; clearB.focus(); });

    saveB.addEventListener("click", function () {
      function download(url, revoke) {
        var a = document.createElement("a"); a.href = url; a.download = "simran-portfolio-doodle.png";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        if (revoke) setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        say("Saved as a PNG.");
      }
      if (cv.toBlob) cv.toBlob(function (b) { if (b) download(URL.createObjectURL(b), true); else say("Couldn't create the image."); }, "image/png");
      else download(cv.toDataURL("image/png"), false);
    });

    // Open and close. The panel grows out of the button; closing is quicker than opening.
    function openPanel() {
      clearTimeout(closing);
      dlg.classList.remove("is-closing");
      if (!dlg.open) dlg.show();
      box.hidden = true; sync();
      openBtn.setAttribute("aria-expanded", "true");
      title.focus();
    }
    function closePanel(returnFocus) {
      if (!dlg.open) return;
      cur = null; box.hidden = true;
      openBtn.setAttribute("aria-expanded", "false");
      function done() { dlg.close(); dlg.classList.remove("is-closing"); if (returnFocus !== false) openBtn.focus(); }
      if (reduceMotion) { done(); return; }
      dlg.classList.add("is-closing");
      closing = setTimeout(done, 170);
    }
    openBtn.addEventListener("click", function () { if (dlg.open && !dlg.classList.contains("is-closing")) closePanel(); else openPanel(); });
    closeB.addEventListener("click", function () { closePanel(); });
    document.addEventListener("keydown", function (e) {
      if (!dlg.open) return;
      if (e.key === "Escape" && dlg.contains(document.activeElement)) { e.preventDefault(); closePanel(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && dlg.contains(document.activeElement)) { e.preventDefault(); undo(); }
    });

    paintBg(); setColor(color); sync();
  }

  [initIntro, initMenu, initActiveLink, initReveal, initLightbox, initCopy, initYear, initMap, initPalette, initHeader, initPointerFx, initRows, initDetails, initNodes, initSketch].forEach(function (fn) {
    try { fn(); } catch (err) { /* keep the rest of the page working */ }
  });
})();
