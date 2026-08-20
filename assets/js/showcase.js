/* Drop 01 on the homepage.
 *
 * Everything it draws comes from CatalogService, so publishing an eleventh
 * design is a data change and this file does not move.
 *
 * The carousel rides the browser's own horizontal scrolling rather than
 * transforming a track by hand. Native scroll brings real touch physics,
 * momentum, trackpad gestures, keyboard support and the reduced-motion
 * behaviour the platform already implements; a hand-rolled version has to
 * reproduce all of that and usually reproduces it badly. Auto-advance is then
 * just a slow, cancellable nudge of scrollLeft, and it yields the instant a
 * customer touches anything.
 *
 * The looping trick is a second, aria-hidden copy of the run. When scrolling
 * passes the halfway mark the position is moved back by exactly half the
 * track, which lands on identical pixels, so the loop has no seam and no jump
 * to see.
 */
(function () {
  "use strict";

  const root = document.getElementById("cpsTrack");
  if (!root) return;

  const viewport = document.getElementById("cpsViewport");
  const modal    = document.getElementById("cpsModal");
  const reduced  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = {
    stage:    document.getElementById("cpsStage"),
    title:    document.getElementById("cpsTitle"),
    desc:     document.getElementById("cpsDesc"),
    sides:    document.getElementById("cpsSides"),
    garments: document.getElementById("cpsGarments"),
    colors:   document.getElementById("cpsColors"),
    price:    document.getElementById("cpsPrice"),
    go:       document.getElementById("cpsGo"),
    close:    document.getElementById("cpsClose"),
    empty:    document.getElementById("cpsEmpty")
  };

  let designs = [];
  let sel = { design: null, garment: null, color: null, side: "front" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------- drawing */

  /* Draws a design on a garment as one SVG. The garment silhouette comes from
     the same symbol set the editor uses, so what a customer sees here is what
     the editor opens with. */
  function preview(design, garmentId, color, side) {
    const product = (typeof PRODUCTS !== "undefined")
      ? PRODUCTS.filter(function (p) { return p.id === garmentId; })[0] : null;
    if (!product || !product.art) return "";

    /* Photo-first designs. A design added through the admin page has a real
       photograph and no vector layers at all, and drawing an empty garment
       silhouette for it would be strictly worse than just showing the photo
       somebody actually took. Vector designs, which have layers and no photo,
       keep drawing on the garment as before; a design cannot sensibly have
       both, so this is a fork, not a fallback chain. */
    const photoKey = side === "back" ? "back" : "front";
    const photo = design.assets && design.assets[photoKey];
    if (photo) {
      return '<img class="custom-print-showcase__photo" src="' + esc(photo) + '" ' +
        'alt="' + esc(design.name + (side === "back" ? ", back" : "")) + '" loading="lazy" decoding="async">';
    }

    const art = CatalogService.resolveArtwork(design, color);
    const layers = art[side] || [];
    const area = (typeof printAreaFor === "function")
      ? printAreaFor(garmentId, side)
      : { x: 218, y: 196, w: 164, h: 216 };

    /* shopLayerSVG is a pure layer-to-markup function and already handles
       every shape and text case; there is no reason for a second copy of it. */
    const draw = (typeof shopLayerSVG === "function")
      ? function (l) { return shopLayerSVG(l, area); }
      : function () { return ""; };

    return '<svg class="custom-print-showcase__svg" viewBox="0 0 600 620" role="img" aria-label="' +
      esc(design.name + " on a " + product.name.toLowerCase() + ", " + String(color).toLowerCase()) + '">' +
      '<use href="#garment-' + esc(product.art[side]) + '"/>' +
      layers.map(draw).join("") +
      "</svg>";
  }

  function firstColor(design, garmentId) {
    const product = (typeof PRODUCTS !== "undefined")
      ? PRODUCTS.filter(function (p) { return p.id === garmentId; })[0] : null;
    const stocked = (product && product.colors) || [];
    const match = (design.colors || []).filter(function (c) { return stocked.indexOf(c) > -1; });
    return match[0] || (design.colors || [])[0] || "Black";
  }

  /* --------------------------------------------------------------- cards */

  function card(design, isClone) {
    const garment = design.garments[0];
    const color = firstColor(design, garment);
    const cat = (typeof COLLECTION_CATEGORIES !== "undefined"
      ? COLLECTION_CATEGORIES.filter(function (c) { return c.id === design.category; })[0] : null);
    /* Clones exist only to make the loop seamless. They are hidden from
       assistive technology and from tab order so the collection is announced
       once, not twice. */
    return '<li class="custom-print-showcase__card"' + (isClone ? ' aria-hidden="true"' : "") + '>' +
        '<button class="custom-print-showcase__open" type="button" data-design="' + esc(design.id) + '"' +
          (isClone ? ' tabindex="-1"' : "") + '>' +
          '<span class="custom-print-showcase__image" data-color="' + esc(color) + '">' +
            preview(design, garment, color, "front") +
          "</span>" +
          '<span class="custom-print-showcase__info">' +
            '<span class="custom-print-showcase__name">' + esc(design.name) + "</span>" +
            (cat ? '<span class="custom-print-showcase__cat">' + esc(cat.name) + "</span>" : "") +
            '<span class="custom-print-showcase__cta">Customize <span aria-hidden="true">&rarr;</span></span>' +
          "</span>" +
        "</button>" +
      "</li>";
  }

  function paint() {
    /* Two passes of the same designs: the second is the loop's tail. */
    root.innerHTML = designs.map(function (d) { return card(d, false); }).join("") +
                     designs.map(function (d) { return card(d, true); }).join("");
    Array.prototype.forEach.call(root.querySelectorAll(".custom-print-showcase__image"), function (n) {
      if (typeof applyGarmentColor === "function") applyGarmentColor(n, n.getAttribute("data-color"));
    });
  }

  /* ------------------------------------------------------------ carousel */

  let drift = null;
  let held = false;

  function halfWidth() { return root.scrollWidth / 2; }

  function step() {
    if (!held && viewport) {
      viewport.scrollLeft += 0.5;
      if (viewport.scrollLeft >= halfWidth()) viewport.scrollLeft -= halfWidth();
    }
    drift = window.requestAnimationFrame(step);
  }

  function startDrift() {
    if (reduced || drift !== null) return;
    drift = window.requestAnimationFrame(step);
  }
  function stopDrift() {
    if (drift === null) return;
    window.cancelAnimationFrame(drift);
    drift = null;
  }

  function hold(on) { held = on; }

  function nudge(dir) {
    if (!viewport) return;
    const card = root.querySelector(".custom-print-showcase__card");
    const by = card ? card.getBoundingClientRect().width + 20 : viewport.clientWidth * 0.8;
    viewport.scrollBy({ left: dir * by, behavior: reduced ? "auto" : "smooth" });
  }

  function wireCarousel() {
    if (!viewport) return;

    /* Any sign of the customer taking control stops the drift, and it resumes
       once they have been still for a moment.

       Resuming on an idle timer rather than on pointerleave is deliberate.
       Leaving is not a reliable signal: on a large screen this section fills
       the viewport, so a pointerleave on the section may never arrive at all,
       and an earlier attempt to widen the pause zone that far left the strip
       frozen for good. A timer does not depend on geometry.

       The strip is tracked separately, so a pointer resting on the designs
       holds them still for as long as it stays there, which is the one case
       where an indefinite pause is what somebody wants.

       Pausing is triggered from the whole section, not just the strip, so the
       drift is already stopped by the time a pointer travelling toward a card
       arrives at it. A card that is still creeping when it is clicked is the
       frustrating carousel the brief warns about. */
    const RESUME_AFTER = 2200;
    let overStrip = false;
    let idle = null;

    function interacted() {
      hold(true);
      if (idle) window.clearTimeout(idle);
      idle = window.setTimeout(function () {
        idle = null;
        if (!overStrip) hold(false);
      }, RESUME_AFTER);
    }

    const section = document.getElementById("apparel") || viewport;
    ["pointermove", "pointerdown", "touchstart", "focusin"].forEach(function (ev) {
      section.addEventListener(ev, interacted, { passive: true });
    });
    viewport.addEventListener("pointerenter", function () { overStrip = true; interacted(); }, { passive: true });
    viewport.addEventListener("pointerleave", function () { overStrip = false; interacted(); }, { passive: true });
    ["touchend", "touchcancel"].forEach(function (ev) {
      viewport.addEventListener(ev, function () { overStrip = false; interacted(); }, { passive: true });
    });

    /* Keep the seam invisible when the customer scrolls past it themselves.

       The backwards wrap is deliberately conditional on the customer having
       hold of the strip. Resting position is zero, and any programmatic
       scroll while sitting there, scrollIntoView on the section for instance,
       fires this handler; wrapping unconditionally would teleport the strip
       a full run sideways for no reason the customer could see. Wrapping
       backwards only matters while somebody is actually dragging back. */
    viewport.addEventListener("scroll", function () {
      const half = halfWidth();
      if (!half) return;
      if (viewport.scrollLeft >= half) viewport.scrollLeft -= half;
      else if (held && viewport.scrollLeft <= 0) viewport.scrollLeft += half;
    }, { passive: true });

    Array.prototype.forEach.call(document.querySelectorAll("[data-cps-nav]"), function (btn) {
      btn.addEventListener("click", function () {
        nudge(btn.getAttribute("data-cps-nav") === "next" ? 1 : -1);
      });
    });

    /* Only run while the section is actually on screen. */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? startDrift() : stopDrift(); });
      }, { threshold: 0.15 }).observe(viewport);
    } else {
      startDrift();
    }
    document.addEventListener("visibilitychange", function () {
      document.visibilityState === "hidden" ? stopDrift() : startDrift();
    });
  }

  /* --------------------------------------------------------------- modal */

  function chip(label, value, on, attr) {
    return '<button type="button" class="custom-print-showcase__chip' + (on ? " is-on" : "") + '" ' +
      attr + '="' + esc(value) + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(label) + "</button>";
  }

  function paintModal() {
    const d = sel.design;
    if (!d) return;

    el.title.textContent = d.name;
    el.desc.textContent = d.description || "";
    el.stage.innerHTML = preview(d, sel.garment, sel.color, sel.side);
    if (typeof applyGarmentColor === "function") applyGarmentColor(el.stage, sel.color);

    const hasBack = d.design.back && d.design.back.length;
    el.sides.innerHTML = chip("Front", "front", sel.side === "front", "data-side") +
      (hasBack ? chip("Back", "back", sel.side === "back", "data-side") : "");

    CatalogService.listGarments(d).then(function (garments) {
      el.garments.innerHTML = garments.map(function (g) {
        return chip(g.name, g.id, g.id === sel.garment, "data-garment");
      }).join("");
      return CatalogService.listColors(d, sel.garment);
    }).then(function (colors) {
      el.colors.innerHTML = colors.map(function (c) {
        return chip(c, c, c === sel.color, "data-color");
      }).join("");
      return CatalogService.getPrice(d, sel.garment, sel.color);
    }).then(function (price) {
      /* No prices are set for this collection yet. Saying so is the honest
         answer; a number made up here would be one a customer could hold the
         shop to. */
      el.price.textContent = price == null
        ? "Priced with your quote, based on garment and quantity."
        : price;
      el.go.href = "design.html?product=" + encodeURIComponent(sel.garment) +
                   "&color=" + encodeURIComponent(sel.color) +
                   "&collection=" + encodeURIComponent(d.id);
    });
  }

  function openModal(id) {
    const d = designs.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    sel.design = d;
    sel.garment = d.garments[0];
    sel.color = firstColor(d, sel.garment);
    sel.side = "front";
    paintModal();
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
    stopDrift();
  }

  function closeModal() {
    if (modal.close) modal.close(); else modal.removeAttribute("open");
    startDrift();
  }

  function wireModal() {
    root.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-design]");
      if (btn) openModal(btn.getAttribute("data-design"));
    });

    el.sides.addEventListener("click", function (e) {
      const b = e.target.closest("[data-side]");
      if (b) { sel.side = b.getAttribute("data-side"); paintModal(); }
    });
    el.garments.addEventListener("click", function (e) {
      const b = e.target.closest("[data-garment]");
      if (!b) return;
      sel.garment = b.getAttribute("data-garment");
      /* The new garment may not be stocked in the colour that was chosen. */
      sel.color = firstColor(sel.design, sel.garment);
      paintModal();
    });
    el.colors.addEventListener("click", function (e) {
      const b = e.target.closest("[data-color]");
      if (b) { sel.color = b.getAttribute("data-color"); paintModal(); }
    });

    el.close.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener("close", startDrift);
  }

  /* ---------------------------------------------------------------- boot */

  if (typeof ensureGarmentDefs === "function") ensureGarmentDefs();

  /* Featured only. The shop page shows the whole catalogue; the homepage
     shows the drop. */
  CatalogService.listFeatured().then(function (rows) {
    designs = rows;
    if (!designs.length) {
      if (el.empty) el.empty.hidden = false;
      return;
    }
    paint();
    wireCarousel();
    wireModal();
  }).catch(function () {
    if (el.empty) el.empty.hidden = false;
  });
})();
