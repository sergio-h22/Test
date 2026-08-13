/* ==========================================================================
   M-Power Print — customizer UI
   --------------------------------------------------------------------------
   Drives CustomizerEngine from the controls on design.html. Holds no design
   state of its own — the engine is the single source of truth, and this file
   only reads from it and tells it what the customer did. That boundary is
   what keeps the panel rebuildable without touching design logic.
   ========================================================================== */

(function () {
  const root = document.getElementById("designer");
  if (!root) return;

  const el = {
    canvas:      document.getElementById("designCanvas"),
    use:         document.getElementById("garmentUse"),
    stage:       document.getElementById("garmentStage"),
    area:        document.getElementById("printArea"),
    areaLabel:   document.getElementById("printAreaLabel"),
    hint:        document.getElementById("stageHint"),
    products:    document.getElementById("productPicker"),
    colors:      document.getElementById("colorRow"),
    colorNote:   document.getElementById("colorNote"),
    drop:        document.getElementById("dropZone"),
    file:        document.getElementById("fileInput"),
    uploadErr:   document.getElementById("uploadErr"),
    addText:     document.getElementById("addTextBtn"),
    undo:        document.getElementById("undoBtn"),
    redo:        document.getElementById("redoBtn"),
    layerBlock:  document.getElementById("layerBlock"),
    layerTitle:  document.getElementById("layerTitle"),
    textCtl:     document.getElementById("textControls"),
    textValue:   document.getElementById("textValue"),
    bold:        document.getElementById("boldBtn"),
    italic:      document.getElementById("italicBtn"),
    textColor:   document.getElementById("textColor"),
    dup:         document.getElementById("dupBtn"),
    del:         document.getElementById("delBtn"),
    qty:         document.getElementById("qtyInput"),
    quote:       document.getElementById("quoteBtn"),
    quoteNote:   document.getElementById("quoteNote"),
    price:       document.getElementById("priceNote"),
    alsoBlock:   document.getElementById("alsoBlock"),
    alsoGrid:    document.getElementById("alsoGrid")
  };

  const customizable = PRODUCTS.filter(function (p) { return p.customizable; });
  if (!customizable.length) return;

  const params = new URLSearchParams(window.location.search);

  /* The business flow arrives from the "Get your business branded" band. It
     is not a separate page — it just starts the same customizer somewhere
     more useful for staff kit: on polos, which is the default staff shirt and
     the one whose print area is already a left-chest logo, at a crew-sized
     quantity rather than one. */
  const business = params.get("flow") === "business";

  /* Arriving from a product page preselects that garment, so "Customise this"
     lands on the thing the customer was already looking at. */
  const wanted = params.get("product") || (business ? "polos" : null);
  let current = customizable.find(function (p) { return p.id === wanted; }) || customizable[0];

  ensureGarmentDefs();

  /* ------------------------------------------------------------ rendering */

  function paintGarment() {
    const side = CustomizerEngine.getSide();
    el.use.setAttribute("href", "#garment-" + current.art[side]);
    applyGarmentColor(el.stage, CustomizerEngine.getColor());
    positionArea();
  }

  /* The print-area outline is a plain DOM box laid over the canvas, sized as
     a percentage of the same 600x620 space the garment and canvas share. */
  function positionArea() {
    const a = CustomizerEngine.getArea();
    el.area.style.left   = (a.x / 600 * 100) + "%";
    el.area.style.top    = (a.y / 620 * 100) + "%";
    el.area.style.width  = (a.w / 600 * 100) + "%";
    el.area.style.height = (a.h / 620 * 100) + "%";
    el.areaLabel.textContent = a.label;
  }

  function renderProducts() {
    el.products.innerHTML = customizable.map(function (p) {
      return '<button type="button" class="dz-product" data-id="' + esc(p.id) + '" ' +
             'aria-pressed="' + (p.id === current.id) + '">' +
               '<svg viewBox="0 0 600 620" aria-hidden="true">' +
                 '<use href="#garment-' + esc(p.art.front) + '"/>' +
               "</svg>" +
               "<span>" + esc(p.name) + "</span>" +
             "</button>";
    }).join("");

    /* Each thumbnail shows the garment in its own first colour — possible
       only because fabric colour is a per-instance fill reference now. */
    el.products.querySelectorAll(".dz-product").forEach(function (b) {
      const p = productById(b.dataset.id);
      if (p && p.colors) applyGarmentColor(b, p.colors[0]);
    });
  }

  function renderColors() {
    const active = CustomizerEngine.getColor();
    el.colors.innerHTML = current.colors.map(function (c) {
      return '<button type="button" class="swatch" data-color="' + esc(c) + '" ' +
             'aria-pressed="' + (c === active) + '" ' +
             'style="--sw:' + esc(SWATCH_HEX[c] || "#C8CCD1") + '" ' +
             'aria-label="' + esc(c) + '"></button>';
    }).join("");
    el.colorNote.textContent = active;
  }

  /* Reflects whatever the canvas currently has selected. Called on every
     engine change so the panel can never disagree with the canvas. */
  function syncPanel() {
    el.undo.disabled = !CustomizerEngine.canUndo();
    el.redo.disabled = !CustomizerEngine.canRedo();
    renderAlso();

    const layer = CustomizerEngine.getActiveLayer();
    el.layerBlock.hidden = !layer;
    if (!layer) { el.area.hidden = true; return; }

    /* The boundary is guidance while editing, clutter otherwise. */
    el.area.hidden = false;

    const isText = layer.type === "text";
    el.layerTitle.textContent = isText ? "Text" : "Artwork";
    el.textCtl.hidden = !isText;

    if (isText) {
      if (document.activeElement !== el.textValue) el.textValue.value = layer.text || "";
      el.bold.setAttribute("aria-pressed", String(Boolean(layer.bold)));
      el.italic.setAttribute("aria-pressed", String(Boolean(layer.italic)));
      el.textColor.value = layer.fill || "#16181B";
    }
  }

  /* Cross-sells appear only once there is a design to cross-sell against.
     Shown next to an empty garment they are just clutter in the way of the
     thing the customer came to do. */
  function renderAlso() {
    if (!el.alsoBlock) return;
    const show = CustomizerEngine.hasAnyDesign();
    el.alsoBlock.hidden = !show;
    if (!show) return;

    const picks = recommendFor(current, 3);
    el.alsoGrid.innerHTML = picks.map(function (p) {
      return '<a class="dz-also-item" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
               '<b>' + esc(p.name) + "</b>" +
               "<span>" + esc(p.blurb) + "</span>" +
             "</a>";
    }).join("");
  }

  function hint(msg) {
    el.hint.textContent = msg || "";
    if (msg) window.clearTimeout(hint._t);
    if (msg) hint._t = window.setTimeout(function () { el.hint.textContent = ""; }, 6000);
  }

  function showError(msg) {
    el.uploadErr.textContent = msg;
    el.uploadErr.hidden = false;
    window.clearTimeout(showError._t);
    showError._t = window.setTimeout(function () { el.uploadErr.hidden = true; }, 7000);
  }

  /* --------------------------------------------------------------- boot */

  CustomizerEngine.init(el.canvas, {
    product: current,
    color: current.colors[0],
    side: "front",
    onChange: syncPanel
  });

  renderProducts();
  renderColors();
  paintGarment();
  syncPanel();

  if (business) {
    /* A crew is not one shirt. Starting at 12 saves the customer correcting a
       default that was never right for them. */
    el.qty.value = 12;
    hint("Upload your logo — we'll place it left chest, the way staff shirts print.");
  }

  /* ------------------------------------------------------------- events */

  el.products.addEventListener("click", function (e) {
    const btn = e.target.closest(".dz-product");
    if (!btn || btn.dataset.id === current.id) return;

    current = productById(btn.dataset.id);
    el.products.querySelectorAll(".dz-product").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === btn));
    });

    CustomizerEngine.setProduct(current).then(function (r) {
      renderColors();
      paintGarment();
      syncPanel();
      /* Say what happened rather than silently changing things underneath
         the customer — both of these are surprising otherwise. */
      if (r.colorChanged) {
        hint(current.name + " comes in " + r.color + " — colour updated.");
      } else if (r.skewed) {
        hint("This garment's print area is a different shape. Check your design still sits how you want it.");
      }
    });
  });

  el.colors.addEventListener("click", function (e) {
    const btn = e.target.closest(".swatch");
    if (!btn) return;
    CustomizerEngine.setColor(btn.dataset.color);
    renderColors();
    paintGarment();
  });

  root.querySelectorAll(".dz-side").forEach(function (btn) {
    btn.addEventListener("click", function () {
      root.querySelectorAll(".dz-side").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      /* Flip animation is decoration, so it is skipped entirely for anyone
         who asked for reduced motion rather than merely shortened. */
      if (!reduced) {
        el.stage.classList.add("is-flipping");
        window.setTimeout(function () { el.stage.classList.remove("is-flipping"); }, 420);
      }
      CustomizerEngine.setSide(btn.dataset.side).then(function () {
        paintGarment();
        syncPanel();
      });
    });
  });

  /* ------------------------------------------------------------- upload */

  function handleFiles(files) {
    if (!files || !files.length) return;
    CustomizerEngine.addImage(files[0])
      .then(function () {
        hint("Drag it to move, or use the corner handles to resize and rotate.");
        /* A brief settle on the garment so the upload visibly lands rather
           than simply appearing. */
        if (!reduced) {
          el.stage.classList.add("just-added");
          window.setTimeout(function () { el.stage.classList.remove("just-added"); }, 360);
        }
      })
      .catch(function (err) { showError(err.message); });
  }

  el.drop.addEventListener("click", function () { el.file.click(); });
  el.drop.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.file.click(); }
  });
  el.file.addEventListener("change", function () {
    handleFiles(el.file.files);
    el.file.value = "";           // same file twice in a row should still fire
  });

  ["dragenter", "dragover"].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) {
      e.preventDefault();
      el.drop.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    el.drop.addEventListener(ev, function (e) {
      e.preventDefault();
      el.drop.classList.remove("is-over");
    });
  });
  el.drop.addEventListener("drop", function (e) {
    handleFiles(e.dataTransfer && e.dataTransfer.files);
  });

  /* Dropping anywhere else on the page would otherwise navigate away from a
     half-finished design, which is a miserable way to lose work. */
  ["dragover", "drop"].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      if (!el.drop.contains(e.target)) e.preventDefault();
    });
  });

  /* --------------------------------------------------------------- text */

  el.addText.addEventListener("click", function () {
    CustomizerEngine.addText("YOUR TEXT").then(function () {
      syncPanel();
      el.textValue.focus();
      el.textValue.select();
    });
  });

  el.textValue.addEventListener("input", function () {
    const layer = CustomizerEngine.getActiveLayer();
    if (layer) CustomizerEngine.updateLayer(layer.id, { text: el.textValue.value });
  });

  [["bold", "bold"], ["italic", "italic"]].forEach(function (pair) {
    el[pair[0]].addEventListener("click", function () {
      const layer = CustomizerEngine.getActiveLayer();
      if (!layer) return;
      const props = {};
      props[pair[1]] = !layer[pair[1]];
      CustomizerEngine.updateLayer(layer.id, props).then(syncPanel);
    });
  });

  el.textColor.addEventListener("input", function () {
    const layer = CustomizerEngine.getActiveLayer();
    if (layer) CustomizerEngine.updateLayer(layer.id, { fill: el.textColor.value });
  });

  /* ------------------------------------------------------------- layers */

  el.dup.addEventListener("click", function () {
    CustomizerEngine.duplicateActive().then(syncPanel);
  });
  el.del.addEventListener("click", function () {
    CustomizerEngine.removeActive().then(syncPanel);
  });
  el.undo.addEventListener("click", function () { CustomizerEngine.undo(); });
  el.redo.addEventListener("click", function () { CustomizerEngine.redo(); });

  document.addEventListener("keydown", function (e) {
    /* Never steal a key while someone is typing into a field. */
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (typing) return;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) CustomizerEngine.redo(); else CustomizerEngine.undo();
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (CustomizerEngine.getActiveLayer()) {
        e.preventDefault();
        CustomizerEngine.removeActive().then(syncPanel);
      }
    }
  });

  /* -------------------------------------------------------------- quote */

  /* Pricing stays honest: until real numbers exist in products.js, this says
     so rather than inventing a figure. */
  if (current.pricing) el.price.textContent = "";

  el.quote.addEventListener("click", function () {
    if (!CustomizerEngine.hasAnyDesign()) {
      showError("Add your artwork or some text first, then we can quote it.");
      return;
    }

    const state = CustomizerEngine.getState();
    const png = CustomizerEngine.exportDesignPNG();
    const qty = Math.max(1, parseInt(el.qty.value, 10) || 1);

    el.quote.disabled = true;
    CustomizerQuote.send(state, { qty: qty }, png)
      .then(function (r) { el.quoteNote.textContent = r.message; })
      .catch(function () {
        el.quoteNote.textContent = "Something went wrong sending that. Call us on " +
                                   CONFIG.phone + " and we'll sort it out.";
      })
      .then(function () { el.quote.disabled = false; });
  });
})();
