/* ==========================================================================
   M-Power Print — the press run
   --------------------------------------------------------------------------
   The full-bleed picture behind the home page's press-run section, which
   changes as you scroll past each panel.

   How the pieces divide up:
     scenes.js     the artwork, and whether a scene is light or dark
     index.html    the copy — each <article data-scene="id"> names its scene
     this file     joins them together and swaps the backdrop

   Copy lives in the markup rather than in here on purpose: it is the part
   most likely to be edited, it should be readable with JavaScript off, and a
   search engine should see it without running anything. If this file never
   loads, the panels still render as ordinary content on a dark ground.

   The mechanism is a sticky layer plus panels pulled up over it. No scroll
   handler, no requestAnimationFrame loop — an IntersectionObserver fires only
   when a panel crosses the middle of the screen, which is both cheaper and
   steadier than measuring scroll position on every frame.
   ========================================================================== */

function initPressRun() {
  const section = document.getElementById("press");
  if (!section || typeof SCENES === "undefined") return;

  const scenesEl = section.querySelector(".press-scenes");
  const readout  = section.querySelector(".press-readout");
  const panels   = Array.prototype.slice.call(section.querySelectorAll(".press-panel"));
  if (!scenesEl || !panels.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* Decoration is not worth someone's data plan. On a metered or slow
     connection the scenes fall back to the drawings, which are a few KB of
     vector each. Same rule the hero video follows in site.js. */
  const net = navigator.connection;
  const thrifty = Boolean(net && (net.saveData || /^([23]g|slow-2g)$/.test(net.effectiveType || "")));

  /* Only build layers for scenes a panel actually asks for, and keep them in
     the order the panels appear rather than the order scenes.js declares. A
     scene nobody references costs nothing because it is never drawn. */
  const used = [];
  panels.forEach(function (panel) {
    const scene = SCENES.filter(function (s) { return s.id === panel.dataset.scene; })[0];
    if (!scene) return;              /* a typo in data-scene must not break the page */
    panel.__scene = scene;
    if (used.indexOf(scene) === -1) used.push(scene);
  });
  if (!used.length) return;

  /* ------------------------------------------------------------- layers */
  used.forEach(function (scene, i) {
    const layer = document.createElement("div");
    layer.className = "press-scene";
    layer.dataset.sceneId = scene.id;

    /* Footage beats a photograph beats the drawing — see the note in
       scenes.js. Video is muted and inert: it is wallpaper, not a player. */
    if (scene.video && !reduced && !thrifty) {
      const vid = document.createElement("video");
      vid.src = scene.video;
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.preload = "metadata";
      vid.setAttribute("aria-hidden", "true");
      vid.tabIndex = -1;
      /* A clip that will not load must not leave a black rectangle where the
         artwork should be. */
      vid.addEventListener("error", function () {
        layer.innerHTML = scene.art();
        scene.__video = null;
      });
      layer.appendChild(vid);
      scene.__video = vid;
    } else if (scene.photo && !thrifty) {
      const img = new Image();
      img.src = scene.photo;
      img.alt = "";
      img.decoding = "async";
      /* The first scene is on screen immediately, so it is not lazy. */
      img.loading = i === 0 ? "eager" : "lazy";
      /* If the file is missing, fall back to the drawing rather than showing
         a broken image where the artwork should be. */
      img.addEventListener("error", function () {
        layer.innerHTML = scene.art();
      });
      layer.appendChild(img);
    } else {
      layer.innerHTML = scene.art();
    }

    scenesEl.appendChild(layer);
    scene.__layer = layer;
  });

  /* ------------------------------------------------------------ readout */
  const total = String(used.length).padStart(2, "0");
  let plateEl, labelEl, inkEl, chipEl, countEl;

  if (readout) {
    readout.innerHTML =
      '<span class="press-reg" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' +
          '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6"/>' +
          '<path d="M12 0v6M12 18v6M0 12h6M18 12h6"/>' +
        '</svg>' +
      '</span>' +
      '<span class="press-plate"></span>' +
      '<span class="press-label"></span>' +
      '<span class="press-ink"><i class="press-chip"></i><span></span></span>' +
      '<span class="press-count"></span>';

    plateEl = readout.querySelector(".press-plate");
    labelEl = readout.querySelector(".press-label");
    inkEl   = readout.querySelector(".press-ink span");
    chipEl  = readout.querySelector(".press-chip");
    countEl = readout.querySelector(".press-count");
  }

  /* --------------------------------------------------------------- swap */
  let current = null;

  function show(scene) {
    if (!scene || scene === current) return;
    if (current && current.__layer) current.__layer.classList.remove("is-live");
    /* Footage off screen is battery and bandwidth spent on nothing. */
    if (current && current.__video) current.__video.pause();
    scene.__layer.classList.add("is-live");
    if (scene.__video) scene.__video.play().catch(function () {});
    current = scene;

    /* Tone drives the copy colour and the scrim. Scene 03 and 04 are light
       artwork — without this the white text would vanish into them. */
    section.dataset.tone = scene.tone;

    if (readout) {
      plateEl.textContent = scene.plate;
      labelEl.textContent = scene.label;
      inkEl.textContent   = scene.ink;
      chipEl.style.background = scene.chip;
      countEl.textContent = scene.plate + " / " + total;
    }
  }

  show(used[0]);

  /* Fires when a panel crosses the middle band of the viewport, so the
     backdrop changes as that panel's copy becomes the thing you are reading. */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.__scene) show(e.target.__scene);
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

  panels.forEach(function (p) { io.observe(p); });

  /* A slow drift on the live scene, which is what stops a static backdrop
     reading as a flat colour block. Motion is decoration here, so anyone who
     asked for less does not get it at all. */
  if (!reduced) section.classList.add("press-drift");

  /* Reveal each panel's copy as it arrives. Same observer pattern, different
     band, so a panel is already legible by the time it is centred. */
  const revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        revealIO.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -18% 0px", threshold: 0.15 });

  if (reduced) {
    panels.forEach(function (p) { p.classList.add("is-in"); });
  } else {
    panels.forEach(function (p) { revealIO.observe(p); });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPressRun);
} else {
  initPressRun();
}
