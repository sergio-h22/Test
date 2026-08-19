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
    art:         document.getElementById("garmentArt"),
    use:         document.getElementById("garmentUse"),
    stage:       document.getElementById("garmentStage"),
    sides:       document.querySelector(".dz-sides"),
    area:        document.getElementById("printArea"),
    areaLabel:   document.getElementById("printAreaLabel"),
    hint:        document.getElementById("stageHint"),
    products:    document.getElementById("productPicker"),
    options:     document.getElementById("productOptions"),
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
    under:       document.getElementById("underBtn"),
    fontSel:     document.getElementById("fontSelect"),
    spacing:     document.getElementById("spacingRange"),
    leading:     document.getElementById("leadingRange"),
    opacity:     document.getElementById("opacityRange"),
    imageCtl:    document.getElementById("imageControls"),
    shapeCtl:    document.getElementById("shapeControls"),
    shapeColor:  document.getElementById("shapeColor"),
    flipH:       document.getElementById("flipHBtn"),
    flipV:       document.getElementById("flipVBtn"),
    forward:     document.getElementById("forwardBtn"),
    backward:    document.getElementById("backwardBtn"),
    elements:    document.getElementById("elementRow"),
    layersBlock: document.getElementById("layersBlock"),
    layerList:   document.getElementById("layerList"),
    warnBlock:   document.getElementById("warnBlock"),
    warnList:    document.getElementById("warnList"),
    save:        document.getElementById("saveBtn"),
    cart:        document.getElementById("cartBtn"),
    saveNote:    document.getElementById("saveNote"),
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

  /* With no product named, the editor would otherwise open on whatever
     happens to be first in the catalogue — which is a decision made for the
     customer rather than by them. Ask instead. */
  const needsPick = !wanted;

  ensureGarmentDefs();

  /* ------------------------------------------------------------ rendering */

  /* Draws whatever the customer is designing on. Two kinds of product exist
     and they are drawn completely differently:

       garment  a fixed SVG silhouette from GARMENT_SHAPES, recoloured per
                fabric colour, with a small print panel on it
       flat     a rectangle whose shape IS the product — a business card, a
                banner, a yard sign — drawn by surfaces.js

     Before this existed every product rendered through the garment path, so
     a business card came out shirt-shaped. The branch is the whole fix; the
     engine below it never learns the difference, because both kinds resolve
     through the same printAreaFor(). */
  function paintProduct() {
    const side = CustomizerEngine.getSide();
    const flat = typeof isFlatSurface === "function" && isFlatSurface(current.id);

    if (flat) {
      /* Replacing the <use> wholesale rather than re-pointing it: a flat
         product is several shapes (stock, shadow, grommets), not one symbol. */
      el.art.innerHTML = surfaceArtwork(current.id, side) + surfaceGuides(current.id);
      el.stage.classList.add("is-flat");
      el.stage.style.removeProperty("--cloth-fill");
    } else {
      el.art.innerHTML = '<use id="garmentUse" href="#garment-' + esc(current.art[side]) + '"/>';
      el.use = document.getElementById("garmentUse");
      el.stage.classList.remove("is-flat");
      applyGarmentColor(el.stage, CustomizerEngine.getColor());
    }
    positionArea();
  }

  /* Kept under the old name so nothing else in this file has to change. */
  function paintGarment() { paintProduct(); }

  /* Front/back is not universal: a banner prints one side, a yard sign two.
     Asking rather than assuming stops the UI offering a back that the shop
     would have to explain does not exist. */
  function renderSides() {
    if (!el.sides) return;
    const allowed = typeof sidesFor === "function" ? sidesFor(current.id) : ["front", "back"];
    let visible = 0;
    el.sides.querySelectorAll(".dz-side").forEach(function (b) {
      const ok = allowed.indexOf(b.dataset.side) !== -1;
      b.hidden = !ok;
      if (ok) visible++;
    });
    /* One side means the control is noise. */
    el.sides.hidden = visible < 2;
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

  /* One thumbnail. Garments draw their silhouette, flat products draw their
     own shape, so the picker shows a card as a card and a banner as a banner
     rather than 21 identical shirts. */
  function productThumb(p) {
    const flat = typeof isFlatSurface === "function" && isFlatSurface(p.id);
    const inner = flat
      ? surfaceArtwork(p.id, "front")
      : '<use href="#garment-' + esc(p.art.front) + '"/>';
    return '<button type="button" class="dz-product" data-id="' + esc(p.id) + '" ' +
           'aria-pressed="' + (p.id === current.id) + '">' +
             '<svg viewBox="0 0 600 620" aria-hidden="true">' + inner + "</svg>" +
             "<span>" + esc(p.name) + "</span>" +
           "</button>";
  }

  /* Grouped by catalogue category. With 5 products a flat list was fine; with
     all 21 it becomes a wall, and the categories customers already know from
     the catalogue are the obvious way to break it up. */
  function renderProducts() {
    const groups = CATEGORIES.map(function (c) {
      const items = customizable.filter(function (p) { return p.cat === c.id; });
      if (!items.length) return "";
      return '<div class="dz-group">' +
               '<p class="dz-group-h">' + esc(c.name) + "</p>" +
               '<div class="dz-group-items">' + items.map(productThumb).join("") + "</div>" +
             "</div>";
    }).join("");

    el.products.innerHTML = groups;

    /* Garment thumbnails show their own first colour — possible only because
       fabric colour is a per-instance fill reference. */
    el.products.querySelectorAll(".dz-product").forEach(function (b) {
      const p = productById(b.dataset.id);
      if (p && p.colors && p.art) applyGarmentColor(b, p.colors[0]);
    });
  }

  /* Colour is a garment concept. A business card has a stock and a finish,
     not a fabric colour, so the whole block hides rather than showing an
     empty row of swatches. */
  function renderColors() {
    const block = el.colors.closest(".dz-block");
    if (!current.colors || !current.colors.length) {
      if (block) block.hidden = true;
      return;
    }
    if (block) block.hidden = false;

    const active = CustomizerEngine.getColor();
    el.colors.innerHTML = current.colors.map(function (c) {
      return '<button type="button" class="swatch" data-color="' + esc(c) + '" ' +
             'aria-pressed="' + (c === active) + '" ' +
             'style="--sw:' + esc(SWATCH_HEX[c] || "#C8CCD1") + '" ' +
             'aria-label="' + esc(c) + '"></button>';
    }).join("");
    el.colorNote.textContent = active;
  }

  /* Size / material / finish, driven entirely by the product's own options
     object. Products that define none get no controls — which is why a
     banner shows material and a letterhead does not show a finish it has no
     choices for. */
  function renderOptions() {
    if (!el.options) return;
    const opts = current.options || {};
    const keys = Object.keys(opts).filter(function (k) {
      return Array.isArray(opts[k]) && opts[k].length;
    });

    if (!keys.length) { el.options.innerHTML = ""; el.options.hidden = true; return; }
    el.options.hidden = false;

    const LABELS = {
      sizes: "Size", material: "Material", finish: "Finish",
      sided: "Printed sides", orientation: "Orientation"
    };

    el.options.innerHTML = keys.map(function (k) {
      const id = "opt-" + k;
      return '<div class="field">' +
               '<label for="' + id + '">' + esc(LABELS[k] || k) + "</label>" +
               '<select id="' + id + '" data-opt="' + esc(k) + '">' +
                 opts[k].map(function (v) {
                   return '<option value="' + esc(v) + '">' + esc(v) + "</option>";
                 }).join("") +
               "</select>" +
             "</div>";
    }).join("");
  }

  /* What the customer has chosen, for the quote. Read straight off the DOM so
     there is no second copy of this state to fall out of sync. */
  function selectedOptions() {
    if (!el.options) return {};
    const out = {};
    el.options.querySelectorAll("select[data-opt]").forEach(function (s) {
      out[s.dataset.opt] = s.value;
    });
    return out;
  }

  /* ------------------------------------------------------------- fonts
     Web-safe faces first: they need no download and render immediately, so
     the menu works even if the font CDN is blocked or slow. The rest are
     loaded by the stylesheet in design.html.

     `web:true` marks the ones that must be awaited before Fabric draws with
     them — canvas does not re-render itself when a font finishes loading, so
     without that wait the first render silently falls back to a default. */
  const FONTS = [
    { name: "Helvetica",       stack: "Helvetica, Arial, sans-serif" },
    { name: "Arial",           stack: "Arial, Helvetica, sans-serif" },
    { name: "Georgia",         stack: "Georgia, serif" },
    { name: "Times New Roman", stack: '"Times New Roman", Times, serif' },
    { name: "Impact",          stack: "Impact, Haettenschweiler, sans-serif" },
    { name: "Courier New",     stack: '"Courier New", Courier, monospace' },
    { name: "Montserrat",      stack: "Montserrat, sans-serif", web: true },
    { name: "Roboto",          stack: "Roboto, sans-serif",     web: true },
    { name: "Open Sans",       stack: '"Open Sans", sans-serif', web: true },
    { name: "Oswald",          stack: "Oswald, sans-serif",     web: true },
    { name: "Poppins",         stack: "Poppins, sans-serif",    web: true }
  ];

  function fontByStack(stack) {
    return FONTS.find(function (f) { return f.stack === stack; }) || FONTS[0];
  }

  /* Resolves once the face is actually usable on canvas. */
  function ensureFont(stack) {
    const f = fontByStack(stack);
    if (!f.web || !document.fonts || !document.fonts.load) return Promise.resolve();
    return document.fonts.load('700 32px "' + f.name + '"')
      .then(function () { return document.fonts.load('400 32px "' + f.name + '"'); })
      .catch(function () { /* fall back to whatever the stack resolves to */ });
  }

  function renderFonts() {
    if (!el.fontSel) return;
    el.fontSel.innerHTML = FONTS.map(function (f) {
      return '<option value="' + esc(f.stack) + '" style="font-family:' + esc(f.stack) + '">' +
               esc(f.name) + "</option>";
    }).join("");
  }

  /* ---------------------------------------------------------- elements */
  const ELEMENTS = [
    { kind: "rect",     label: "Rectangle", icon: '<rect x="4" y="7" width="16" height="10" rx="1"/>' },
    { kind: "circle",   label: "Circle",    icon: '<circle cx="12" cy="12" r="7"/>' },
    { kind: "triangle", label: "Triangle",  icon: '<path d="M12 5 20 19H4z"/>' },
    { kind: "star",     label: "Star",      icon: '<path d="m12 4 2.4 5.3 5.6.6-4.2 3.8 1.2 5.5L12 16.4 6.9 19.2l1.2-5.5L4 9.9l5.6-.6z"/>' },
    { kind: "line",     label: "Line",      icon: '<rect x="3" y="11" width="18" height="2.4" rx="1.2"/>' },
    { kind: "arrow",    label: "Arrow",     icon: '<path d="M3 10h10V6l8 6-8 6v-4H3z"/>' }
  ];

  function renderElements() {
    if (!el.elements) return;
    el.elements.innerHTML = ELEMENTS.map(function (e) {
      return '<button type="button" class="dz-el" data-shape="' + esc(e.kind) + '" ' +
             'aria-label="Add ' + esc(e.label) + '" title="' + esc(e.label) + '">' +
               '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + e.icon + "</svg>" +
             "</button>";
    }).join("");
  }

  /* ------------------------------------------------------------ layers
     Listed top of stack first, because that is how a customer sees them —
     the thing in front is the thing they are looking at. The engine's array
     is bottom-first, so this reverses for display only. */
  function renderLayers() {
    if (!el.layersBlock) return;
    const layers = CustomizerEngine.getLayers();
    el.layersBlock.hidden = layers.length === 0;
    if (!layers.length) { el.layerList.innerHTML = ""; return; }

    const active = CustomizerEngine.getActiveLayer();
    el.layerList.innerHTML = layers.slice().reverse().map(function (l) {
      const label = l.type === "text"  ? (l.text || "Text")
                  : l.type === "shape" ? (l.shape.charAt(0).toUpperCase() + l.shape.slice(1))
                  : "Artwork";
      return '<li class="dz-layer' + (active && active.id === l.id ? " is-active" : "") +
                 (l.hidden ? " is-hidden" : "") + '">' +
               '<button type="button" class="dz-layer-pick" data-pick="' + esc(l.id) + '">' +
                 '<span class="dz-layer-kind">' + esc(l.type) + "</span>" +
                 '<span class="dz-layer-name">' + esc(label.slice(0, 24)) + "</span>" +
               "</button>" +
               '<button type="button" class="dz-layer-eye" data-eye="' + esc(l.id) + '" ' +
                 'aria-pressed="' + String(!l.hidden) + '" ' +
                 'aria-label="' + (l.hidden ? "Show" : "Hide") + ' this layer">' +
                 (l.hidden ? "Show" : "Hide") +
               "</button>" +
             "</li>";
    }).join("");
  }

  /* --------------------------------------------------------- templates
     Grouped by the template's own category string, so adding a new category
     in templates.js needs no change here. */
  function renderTemplates() {
    const block = document.getElementById("templateBlock");
    const grid = document.getElementById("templateGrid");
    if (!block || !grid || typeof templatesFor !== "function") return;

    const list = templatesFor(current);
    block.hidden = list.length === 0;
    if (!list.length) { grid.innerHTML = ""; return; }

    const cats = [];
    list.forEach(function (t) { if (cats.indexOf(t.category) === -1) cats.push(t.category); });

    grid.innerHTML = cats.map(function (c) {
      return '<div class="dz-tgroup">' +
               '<p class="dz-group-h">' + esc(c) + "</p>" +
               '<div class="dz-tgroup-items">' +
                 list.filter(function (t) { return t.category === c; }).map(function (t) {
                   return '<button type="button" class="dz-template" data-tpl="' + esc(t.id) + '">' +
                            esc(t.name) +
                          "</button>";
                 }).join("") +
               "</div>" +
             "</div>";
    }).join("");
  }

  /* ---------------------------------------------------------- warnings */
  function renderWarnings() {
    if (!el.warnBlock) return;
    const list = CustomizerEngine.validate();
    el.warnBlock.hidden = list.length === 0;
    if (!list.length) { el.warnList.innerHTML = ""; return; }

    el.warnList.innerHTML = list.map(function (w) {
      return '<li class="dz-warn dz-warn-' + esc(w.level) + '">' + esc(w.message) + "</li>";
    }).join("");
  }

  /* Reflects whatever the canvas currently has selected. Called on every
     engine change so the panel can never disagree with the canvas. */
  function syncPanel() {
    el.undo.disabled = !CustomizerEngine.canUndo();
    el.redo.disabled = !CustomizerEngine.canRedo();
    renderAlso();

    renderLayers();
    renderWarnings();

    const layer = CustomizerEngine.getActiveLayer();
    el.layerBlock.hidden = !layer;
    if (!layer) { el.area.hidden = true; return; }

    /* The boundary is guidance while editing, clutter otherwise. */
    el.area.hidden = false;

    const isText  = layer.type === "text";
    const isShape = layer.type === "shape";
    const isImage = layer.type === "image";

    el.layerTitle.textContent = isText ? "Text" : isShape ? "Element" : "Artwork";
    el.textCtl.hidden  = !isText;
    if (el.imageCtl) el.imageCtl.hidden = !isImage;
    if (el.shapeCtl) el.shapeCtl.hidden = !isShape;

    if (isText) {
      if (document.activeElement !== el.textValue) el.textValue.value = layer.text || "";
      el.bold.setAttribute("aria-pressed", String(Boolean(layer.bold)));
      el.italic.setAttribute("aria-pressed", String(Boolean(layer.italic)));
      if (el.under) el.under.setAttribute("aria-pressed", String(Boolean(layer.underline)));
      el.textColor.value = layer.fill || "#16181B";
      if (el.fontSel)  el.fontSel.value = layer.font || FONTS[0].stack;
      if (el.spacing)  el.spacing.value = layer.spacing || 0;
      if (el.leading)  el.leading.value = layer.leading == null ? 1.16 : layer.leading;

      root.querySelectorAll("[data-align]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.align === (layer.align || "center")));
      });
    }

    if (isShape && el.shapeColor) el.shapeColor.value = layer.fill || "#E31B23";
    if (el.opacity) el.opacity.value = layer.opacity == null ? 1 : layer.opacity;
  }

  /* Everything a save or a cart line needs that lives outside the engine. */
  function extras() {
    return {
      qty: parseInt(el.qty.value, 10) || 1,
      options: selectedOptions()
    };
  }

  function note(msg, isError) {
    if (!el.saveNote) return;
    el.saveNote.textContent = msg || "";
    el.saveNote.classList.toggle("is-error", Boolean(isError));
    if (msg) {
      window.clearTimeout(note._t);
      note._t = window.setTimeout(function () { el.saveNote.textContent = ""; }, 6000);
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
    /* Flat products have no fabric colour at all, so this cannot assume an
       array exists — reading current.colors[0] unguarded threw the moment a
       business card became customizable. */
    color: (current.colors && current.colors[0]) || null,
    /* Start on a side the product actually prints. */
    side: (typeof sidesFor === "function" ? sidesFor(current.id)[0] : "front"),
    onChange: syncPanel
  });

  renderProducts();
  renderColors();
  renderOptions();
  renderSides();
  renderFonts();
  renderElements();
  renderTemplates();
  paintGarment();
  syncPanel();
  updateCartCount();

  /* ------------------------------------------------- arriving from the shop */

  /* "Edit this design" on shop.html hands over the design it was showing, so
     the customer lands on their graphic rather than an empty garment. The
     colour rides along because a shop design resolves its ink against the
     garment colour: loading the design without its colour would put bone ink
     on a white shirt. */
  const shopWanted = params.get("shop");
  if (shopWanted && typeof shopDesignFor === "function") {
    const shopColor = params.get("color") ||
      (current.colors && current.colors[0]) || null;
    const shopDesigns = shopDesignFor(shopWanted, shopColor);
    if (shopDesigns) {
      const seed = shopColor
        ? CustomizerEngine.setColor(shopColor)
        : Promise.resolve();
      /* Shop designs are set in the display faces, same as templates, so the
         fonts have to land before the first render or the layout is measured
         against a fallback. */
      const shopFonts = FONTS.filter(function (f) { return f.web; })
                             .map(function (f) { return ensureFont(f.stack); });
      Promise.all([seed].concat(shopFonts))
        .then(function () { return CustomizerEngine.loadDesigns(shopDesigns); })
        .then(function () {
          renderColors();
          syncPanel();
          const entry = typeof shopDesign === "function" ? shopDesign(shopWanted) : null;
          hint(entry ? "Editing " + entry.name + ". Change anything you like."
                     : "Design loaded. Change anything you like.");
        });
    }
  }

  /* ------------------------------------------------------ launch screen */

  const launch = document.getElementById("dzLaunch");
  const launchGrid = document.getElementById("launchGrid");

  function selectProduct(p) {
    if (!p || p.id === current.id) return Promise.resolve();
    current = p;
    el.products.querySelectorAll(".dz-product").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.id === p.id));
    });
    const allowed = typeof sidesFor === "function" ? sidesFor(p.id) : ["front", "back"];
    const fix = allowed.indexOf(CustomizerEngine.getSide()) === -1
      ? CustomizerEngine.setSide(allowed[0]) : Promise.resolve();
    return fix.then(function () { return CustomizerEngine.setProduct(p); })
      .then(function () {
        renderColors(); renderOptions(); renderSides(); renderTemplates();
        paintGarment(); syncPanel();
      });
  }

  if (launch && launchGrid && needsPick) {
    /* Same grouped markup as the in-editor picker, so there is one way a
       product is presented rather than two that can drift apart. */
    launchGrid.innerHTML = CATEGORIES.map(function (c) {
      const items = customizable.filter(function (p) { return p.cat === c.id; });
      if (!items.length) return "";
      return '<div class="dz-group">' +
               '<p class="dz-group-h">' + esc(c.name) + "</p>" +
               '<div class="dz-group-items">' + items.map(productThumb).join("") + "</div>" +
             "</div>";
    }).join("");

    launchGrid.querySelectorAll(".dz-product").forEach(function (b) {
      const p = productById(b.dataset.id);
      if (p && p.colors && p.art) applyGarmentColor(b, p.colors[0]);
      b.setAttribute("aria-pressed", "false");
    });

    root.hidden = true;
    launch.hidden = false;

    launchGrid.addEventListener("click", function (e) {
      const btn = e.target.closest(".dz-product");
      if (!btn) return;
      selectProduct(productById(btn.dataset.id)).then(function () {
        launch.hidden = true;
        root.hidden = false;
        /* The canvas was laid out while hidden, so it has to be told the
           stage now has a real size. */
        CustomizerEngine.resize();
        window.scrollTo(0, 0);
      });
    });
  }

  /* Restore whatever was in progress on this product. Offered rather than
     applied silently: someone arriving to start something new should not
     find last week's design already on the garment. */
  CustomizerStore.loadDesign(current.id).then(function (saved) {
    if (!saved || !saved.designs) return;
    const hasAny = (saved.designs.front || []).length || (saved.designs.back || []).length;
    if (!hasAny) return;

    el.saveNote.innerHTML =
      'You have a saved design for this product. ' +
      '<button type="button" class="dz-link" id="restoreBtn">Restore it</button>';

    const btn = document.getElementById("restoreBtn");
    btn.addEventListener("click", function () {
      CustomizerEngine.loadDesigns(saved.designs).then(function () {
        if (saved.color) { CustomizerEngine.setColor(saved.color); renderColors(); paintGarment(); }
        if (saved.qty && el.qty) el.qty.value = saved.qty;
        syncPanel();
        note("Saved design restored.");
      });
    });
  }).catch(function () { /* storage unavailable — nothing to restore */ });

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

    /* Switching to a product that does not print the current side would
       otherwise leave the canvas on a side that no longer exists. */
    const allowed = typeof sidesFor === "function" ? sidesFor(current.id) : ["front", "back"];
    const sideFix = allowed.indexOf(CustomizerEngine.getSide()) === -1
      ? CustomizerEngine.setSide(allowed[0])
      : Promise.resolve();

    sideFix.then(function () {
      return CustomizerEngine.setProduct(current);
    }).then(function (r) {
      renderColors();
      renderOptions();
      renderSides();
      renderTemplates();
      paintGarment();
      syncPanel();
      /* Say what happened rather than silently changing things underneath
         the customer — both of these are surprising otherwise. */
      if (r.colorChanged) {
        hint(current.name + " comes in " + r.color + " — colour updated.");
      } else if (r.skewed) {
        hint("This product's print area is a different shape. Check your design still sits how you want it.");
      }
    });
  });

  /* ------------------------------------------------- elements and layers */

  el.elements.addEventListener("click", function (e) {
    const btn = e.target.closest(".dz-el");
    if (!btn) return;
    CustomizerEngine.addShape(btn.dataset.shape).then(syncPanel);
  });

  const templateGrid = document.getElementById("templateGrid");
  if (templateGrid) {
    templateGrid.addEventListener("click", function (e) {
      const btn = e.target.closest(".dz-template");
      if (!btn) return;

      /* Replacing work already done is destructive and not obviously
         undoable to a customer mid-design, so it gets a confirm. Undo still
         covers it either way. */
      if (CustomizerEngine.hasAnyDesign() &&
          !window.confirm("Start from this design? What you have now will be replaced. You can undo afterwards.")) {
        return;
      }

      const design = templateDesign(btn.dataset.tpl);
      if (!design) return;

      /* Templates use the display faces — wait for them, or the first render
         draws in a fallback and the template looks wrong. */
      const webFonts = FONTS.filter(function (f) { return f.web; })
                            .map(function (f) { return ensureFont(f.stack); });
      Promise.all(webFonts)
        .then(function () { return CustomizerEngine.loadDesigns(design); })
        .then(function () {
          syncPanel();
          hint("Template applied — edit any part of it.");
        });
    });
  }

  el.layerList.addEventListener("click", function (e) {
    const pick = e.target.closest("[data-pick]");
    if (pick) { CustomizerEngine.selectById(pick.dataset.pick); syncPanel(); return; }
    const eye = e.target.closest("[data-eye]");
    if (eye) CustomizerEngine.toggleVisible(eye.dataset.eye).then(syncPanel);
  });

  /* ------------------------------------------------------ layer controls */

  function activeId() {
    const l = CustomizerEngine.getActiveLayer();
    return l ? l.id : null;
  }

  function patch(props) {
    const id = activeId();
    if (id) CustomizerEngine.updateLayer(id, props).then(syncPanel);
  }

  if (el.fontSel) {
    el.fontSel.addEventListener("change", function () {
      const stack = el.fontSel.value;
      /* Wait for the face before redrawing, or canvas silently renders the
         previous font and the menu appears not to work. */
      ensureFont(stack).then(function () { patch({ font: stack }); });
    });
  }

  if (el.under) {
    el.under.addEventListener("click", function () {
      const l = CustomizerEngine.getActiveLayer();
      if (l) patch({ underline: !l.underline });
    });
  }

  root.querySelectorAll("[data-align]").forEach(function (b) {
    b.addEventListener("click", function () { patch({ align: b.dataset.align }); });
  });

  root.querySelectorAll("[data-move]").forEach(function (b) {
    b.addEventListener("click", function () {
      const id = activeId();
      if (id) CustomizerEngine.align(id, b.dataset.move).then(syncPanel);
    });
  });

  if (el.spacing) el.spacing.addEventListener("input", function () {
    patch({ spacing: parseInt(el.spacing.value, 10) || 0 });
  });
  if (el.leading) el.leading.addEventListener("input", function () {
    patch({ leading: parseFloat(el.leading.value) || 1.16 });
  });
  if (el.opacity) el.opacity.addEventListener("input", function () {
    patch({ opacity: parseFloat(el.opacity.value) });
  });
  if (el.shapeColor) el.shapeColor.addEventListener("input", function () {
    patch({ fill: el.shapeColor.value });
  });
  if (el.flipH) el.flipH.addEventListener("click", function () {
    const l = CustomizerEngine.getActiveLayer();
    if (l) patch({ flipX: !l.flipX });
  });
  if (el.flipV) el.flipV.addEventListener("click", function () {
    const l = CustomizerEngine.getActiveLayer();
    if (l) patch({ flipY: !l.flipY });
  });
  if (el.forward) el.forward.addEventListener("click", function () {
    const id = activeId();
    if (id) CustomizerEngine.reorder(id, "up").then(syncPanel);
  });
  if (el.backward) el.backward.addEventListener("click", function () {
    const id = activeId();
    if (id) CustomizerEngine.reorder(id, "down").then(syncPanel);
  });

  /* ------------------------------------------------------ save and cart */

  if (el.save) {
    el.save.addEventListener("click", function () {
      CustomizerStore.saveDesign(CustomizerEngine.getState(), extras())
        .then(function () {
          note("Design saved to this browser. It will be here when you come back.");
        })
        .catch(function (err) {
          note(err.message || "That design could not be saved.", true);
        });
    });
  }

  if (el.cart) {
    el.cart.addEventListener("click", function () {
      if (!CustomizerEngine.hasAnyDesign()) {
        note("Add some artwork or text before adding this to your cart.", true);
        return;
      }
      const extra = extras();
      extra.preview = CustomizerEngine.exportDesignPNG();
      CustomizerStore.addToCart(CustomizerEngine.getState(), extra)
        .then(function () {
          note("Added to your cart with this design attached.");
          updateCartCount();
        })
        .catch(function (err) {
          note(err.message || "That could not be added to your cart.", true);
        });
    });
  }

  /* ---------------------------------------------------------- preview
     Composites each side the same way the editor stage does: the product
     artwork underneath, the flattened design PNG on top, positioned as a
     percentage of the shared 600x620 box. Reusing that geometry is what
     guarantees the preview matches what the customer was just looking at
     rather than being a second, subtly different rendering. */
  function previewPane(side, png) {
    const flat = typeof isFlatSurface === "function" && isFlatSurface(current.id);
    const art = flat
      ? surfaceArtwork(current.id, side)
      : '<use href="#garment-' + esc(current.art[side]) + '"/>';

    /* The design PNG is exported at canvas size, so it overlays the whole
       box — no per-side positioning maths needed. */
    return '<figure class="dz-preview-pane">' +
             '<div class="dz-preview-stage' + (flat ? " is-flat" : "") + '">' +
               '<svg viewBox="0 0 600 620" aria-hidden="true">' + art + "</svg>" +
               (png ? '<img src="' + esc(png) + '" alt="Your design, ' + esc(side) + '">' : "") +
             "</div>" +
             "<figcaption>" + esc(side.charAt(0).toUpperCase() + side.slice(1)) + "</figcaption>" +
           "</figure>";
  }

  const dlg = document.getElementById("previewDialog");
  const dlgBody = document.getElementById("previewBody");
  const dlgTitle = document.getElementById("previewTitle");

  function showPreview() {
    if (!dlg || !dlgBody) return;
    if (!CustomizerEngine.hasAnyDesign()) {
      note("Add some artwork or text first — there is nothing to preview yet.", true);
      return;
    }

    CustomizerEngine.exportSides().then(function (pngs) {
      const sides = Object.keys(pngs);
      dlgTitle.textContent = current.name + " — preview";
      dlgBody.innerHTML = sides.map(function (s) { return previewPane(s, pngs[s]); }).join("");
      dlgBody.classList.toggle("is-two", sides.length > 1);

      /* Garment colour is six custom properties, not one — so it is applied
         by the same function the editor stage uses rather than reconstructed
         here, which is how the preview stays in step when a colour is added. */
      if (current.art) {
        dlgBody.querySelectorAll(".dz-preview-stage").forEach(function (stage) {
          applyGarmentColor(stage, CustomizerEngine.getColor());
        });
      }
      /* showModal rather than show: it gives focus trapping, Escape-to-close
         and an inert background for free. */
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
      syncPanel();
    });
  }

  const previewBtn = document.getElementById("previewBtn");
  const previewClose = document.getElementById("previewClose");
  if (previewBtn) previewBtn.addEventListener("click", showPreview);
  if (previewClose) previewClose.addEventListener("click", function () {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  });
  /* Clicking the backdrop closes it, which is what the gesture means. */
  if (dlg) dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });

  function updateCartCount() {
    CustomizerStore.cartCount().then(function (n) {
      document.querySelectorAll("[data-cart-count]").forEach(function (node) {
        node.textContent = n ? String(n) : "";
        node.hidden = !n;
      });
    }).catch(function () {});
  }

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
    /* extras() carries the size/material/finish the customer chose. Sending
       only the quantity meant those never reached the shop — someone picking
       18oz vinyl got quoted without anyone knowing they had. */
    CustomizerQuote.send(state, { qty: qty, options: selectedOptions() }, png)
      .then(function (r) { el.quoteNote.textContent = r.message; })
      .catch(function () {
        el.quoteNote.textContent = "Something went wrong sending that. Call us on " +
                                   CONFIG.phone + " and we'll sort it out.";
      })
      .then(function () { el.quote.disabled = false; });
  });
})();
