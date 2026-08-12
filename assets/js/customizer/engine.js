/* ==========================================================================
   M-Power Print — customizer engine
   --------------------------------------------------------------------------
   Owns the canvas and the design state. Knows nothing about buttons, panels
   or the quote form — assets/js/customizer/ui.js drives this, and
   customizer/quote.js reads from it. Keeping that boundary is what lets the
   UI be rebuilt without touching design logic.

   The one idea worth understanding before reading further
   ------------------------------------------------------
   Every object's position and size is stored NORMALISED — as a fraction of
   the print area, not as canvas pixels. A logo at { x: 0.5, y: 0.25, w: 0.4 }
   sits centred, a quarter of the way down, and takes 40% of the print area's
   width, whatever garment it happens to be on.

   That is what makes switching t-shirt → hoodie without losing the design
   possible: the print areas are different rectangles, but the fractions
   remain meaningful, so the design re-lays-out into the new area instead of
   landing wherever the old pixel coordinates happened to point.
   ========================================================================== */

/* Canvas is drawn at this size internally and scaled with CSS, so the design
   is resolution-independent and the exported preview is sharp. Matches the
   600x620 garment viewBox exactly so print-area coordinates need no
   conversion. */
const CANVAS_W = 600;
const CANVAS_H = 620;

const SIDES = ["front", "back"];

/* Anything larger is downscaled before it ever reaches the canvas. A 6000px
   phone photo dropped onto a shirt will otherwise sit in memory at full size
   on every render, which is what makes naive customizers crawl on mobile. */
const MAX_UPLOAD_PX = 1600;

const CustomizerEngine = (function () {

  let canvas = null;          // the Fabric canvas
  let product = null;         // current product from PRODUCTS
  let color = null;           // current colour name
  let side = "front";
  let onChange = function () {};

  /* One design per side, kept apart so the front and back genuinely hold
     different artwork rather than sharing one layer list. */
  const designs = { front: [], back: [] };

  /* Undo/redo over whole-state snapshots. Snapshots rather than inverse
     operations because a design has few objects and many operation types —
     the memory is trivial and it cannot drift out of sync the way a
     hand-written undo for each operation would. */
  let history = [];
  let historyAt = -1;
  let restoring = false;      // suppresses history writes during a restore

  /* ------------------------------------------------------------- geometry */

  function area() {
    return printAreaFor(product.id, side);
  }

  /* Normalised (0-1 of the print area) → canvas pixels. */
  function toCanvas(n) {
    const a = area();
    return {
      left:   a.x + n.x * a.w,
      top:    a.y + n.y * a.h,
      scaleW: n.w * a.w
    };
  }

  /* Canvas pixels → normalised. The inverse of toCanvas, and the only place
     allowed to write normalised values, so the two can never disagree. */
  function toNormal(obj) {
    const a = area();
    return {
      x: (obj.left - a.x) / a.w,
      y: (obj.top - a.y) / a.h,
      w: (obj.getScaledWidth()) / a.w,
      angle: obj.angle || 0
    };
  }

  /* ------------------------------------------------------------- history */

  function snapshot() {
    return JSON.stringify({
      front: serializeSide("front"),
      back:  serializeSide("back")
    });
  }

  function pushHistory() {
    if (restoring) return;
    const snap = snapshot();
    if (history[historyAt] === snap) return;      // nothing actually changed
    history = history.slice(0, historyAt + 1);    // drop any redo branch
    history.push(snap);
    /* Bounded so a long session cannot grow without limit. */
    if (history.length > 60) history.shift();
    historyAt = history.length - 1;
    onChange();
  }

  function restore(snap) {
    const state = JSON.parse(snap);
    restoring = true;
    SIDES.forEach(function (s) { designs[s] = state[s] || []; });
    renderSide().then(function () {
      restoring = false;
      onChange();
    });
  }

  /* ---------------------------------------------------------- serialising */

  /* The stored form of a design: plain data, no Fabric objects, safe to
     JSON-stringify into a quote or localStorage. */
  function serializeSide(s) {
    return designs[s].map(function (layer) { return Object.assign({}, layer); });
  }

  /* Reads the live canvas back into the normalised layer list. Called after
     any drag/scale/rotate so `designs` is always the source of truth. */
  function syncFromCanvas() {
    if (!canvas) return;
    canvas.getObjects().forEach(function (obj) {
      if (!obj.layerId) return;
      const layer = designs[side].find(function (l) { return l.id === obj.layerId; });
      if (!layer) return;
      Object.assign(layer, toNormal(obj));
    });
  }

  /* ------------------------------------------------------------ rendering */

  function clipRect() {
    const a = area();
    return new fabric.Rect({
      left: a.x, top: a.y, width: a.w, height: a.h,
      absolutePositioned: true
    });
  }

  function buildImage(layer) {
    return fabric.Image.fromURL(layer.src).then(function (img) {
      const c = toCanvas(layer);
      img.set({
        left: c.left, top: c.top,
        originX: "center", originY: "center",
        angle: layer.angle || 0,
        layerId: layer.id,
        clipPath: clipRect()
      });
      /* Scale from the image's own natural width so the normalised width
         means the same thing regardless of the file's pixel dimensions. */
      img.scaleToWidth(c.scaleW);
      return img;
    });
  }

  function buildText(layer) {
    const c = toCanvas(layer);
    const t = new fabric.IText(layer.text || "Your text", {
      left: c.left, top: c.top,
      originX: "center", originY: "center",
      angle: layer.angle || 0,
      fontFamily: layer.font || "Helvetica",
      fontWeight: layer.bold ? "700" : "400",
      fontStyle: layer.italic ? "italic" : "normal",
      textAlign: layer.align || "center",
      fill: layer.fill || "#16181B",
      layerId: layer.id,
      clipPath: clipRect()
    });
    t.scaleToWidth(c.scaleW);
    return Promise.resolve(t);
  }

  /* Draws the current side's layers. Async because images load async, and
     the order of the returned array is the layer order, so a Promise.all
     keeps stacking deterministic rather than "whichever image decoded
     first". */
  function renderSide() {
    if (!canvas) return Promise.resolve();
    canvas.remove.apply(canvas, canvas.getObjects());

    const layers = designs[side];
    if (!layers.length) { canvas.requestRenderAll(); return Promise.resolve(); }

    return Promise.all(layers.map(function (l) {
      return l.type === "text" ? buildText(l) : buildImage(l);
    })).then(function (objs) {
      objs.forEach(function (o) { canvas.add(o); });
      canvas.requestRenderAll();
    });
  }

  /* ------------------------------------------------------------- uploads */

  /* Downscales oversized uploads and returns a data URL. Kept in the engine
     rather than the UI because the size ceiling is a rendering concern. */
  function readImageFile(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) {
        reject(new Error("That file is not an image. Use PNG, JPG, WebP or SVG."));
        return;
      }
      const reader = new FileReader();
      reader.onerror = function () { reject(new Error("That file could not be read.")); };
      reader.onload = function () {
        /* SVG is already resolution-independent — downscaling it through a
           canvas would rasterise it and throw away the reason to use it. */
        if (file.type === "image/svg+xml") { resolve(reader.result); return; }

        const img = new Image();
        img.onerror = function () { reject(new Error("That image could not be decoded.")); };
        img.onload = function () {
          const big = Math.max(img.width, img.height);
          if (big <= MAX_UPLOAD_PX) { resolve(reader.result); return; }
          const k = MAX_UPLOAD_PX / big;
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          /* PNG keeps transparency, which matters for a logo on a garment. */
          resolve(c.toDataURL("image/png"));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* Puts a layer into the selected state, which is what makes the transform
     handles appear and the UI's layer panel open. Called after adding
     anything: a design that lands on the garment with no handles reads as
     "nothing happened" and the customer has to guess it is draggable. */
  function selectLayer(id) {
    if (!canvas) return;
    const obj = canvas.getObjects().find(function (o) { return o.layerId === id; });
    if (!obj) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }

  /* Dark garments need light text and vice versa. Picking the default from
     the garment rather than always defaulting to near-black means the first
     thing the customer types is legible instead of invisible on a black
     hoodie. They can still change it. */
  function defaultTextFill() {
    const dark = ["Black", "Navy"];
    return dark.indexOf(color) !== -1 ? "#FFFFFF" : "#16181B";
  }

  /* ---------------------------------------------------------------- API */

  let nextId = 1;
  function makeId() { return "L" + (nextId++); }

  return {

    init: function (canvasEl, opts) {
      canvas = new fabric.Canvas(canvasEl, {
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundColor: "transparent",
        preserveObjectStacking: true,
        selection: false           // one object at a time keeps it simple
      });

      /* Red handles, matching the site's single accent. */
      fabric.InteractiveFabricObject.ownDefaults = Object.assign(
        {}, fabric.InteractiveFabricObject.ownDefaults, {
          borderColor: "#E31B23",
          cornerColor: "#E31B23",
          cornerStrokeColor: "#FFFFFF",
          cornerStyle: "circle",
          cornerSize: 14,
          touchCornerSize: 28,      // fingers are not mice
          transparentCorners: false,
          padding: 4
        });

      product = opts.product;
      color = opts.color;
      side = opts.side || "front";
      onChange = opts.onChange || function () {};

      canvas.on("object:modified", function () { syncFromCanvas(); pushHistory(); });
      canvas.on("text:changed", function (e) {
        const layer = designs[side].find(function (l) { return l.id === e.target.layerId; });
        if (layer) layer.text = e.target.text;
      });
      canvas.on("selection:created", onChange);
      canvas.on("selection:updated", onChange);
      canvas.on("selection:cleared", onChange);

      pushHistory();
      return this;
    },

    /* ------------------------------------------------------------ layers */

    addImage: function (file) {
      return readImageFile(file).then(function (src) {
        const layer = {
          id: makeId(), type: "image", src: src,
          /* Centred, 60% of the print area's width — big enough to see, small
             enough to leave obvious room to resize. */
          x: 0.5, y: 0.5, w: 0.6, angle: 0
        };
        designs[side].push(layer);
        return renderSide().then(function () {
          selectLayer(layer.id);
          pushHistory();
          return layer.id;
        });
      });
    },

    addText: function (text) {
      const layer = {
        id: makeId(), type: "text", text: text || "Your text",
        x: 0.5, y: 0.5, w: 0.7, angle: 0,
        font: "Helvetica", fill: defaultTextFill(), bold: false, italic: false, align: "center"
      };
      designs[side].push(layer);
      return renderSide().then(function () {
        selectLayer(layer.id);
        pushHistory();
        return layer.id;
      });
    },

    updateLayer: function (id, props) {
      const layer = designs[side].find(function (l) { return l.id === id; });
      if (!layer) return Promise.resolve();
      Object.assign(layer, props);
      return renderSide().then(function () { pushHistory(); });
    },

    removeActive: function () {
      const obj = canvas.getActiveObject();
      if (!obj || !obj.layerId) return Promise.resolve();
      designs[side] = designs[side].filter(function (l) { return l.id !== obj.layerId; });
      canvas.discardActiveObject();
      return renderSide().then(function () { pushHistory(); });
    },

    duplicateActive: function () {
      const obj = canvas.getActiveObject();
      if (!obj || !obj.layerId) return Promise.resolve();
      const src = designs[side].find(function (l) { return l.id === obj.layerId; });
      if (!src) return Promise.resolve();
      const copy = Object.assign({}, src, {
        id: makeId(),
        /* Offset so the duplicate is visibly a second object rather than
           appearing to have done nothing. */
        x: Math.min(0.9, src.x + 0.06),
        y: Math.min(0.9, src.y + 0.06)
      });
      designs[side].push(copy);
      return renderSide().then(function () {
        selectLayer(copy.id);
        pushHistory();
      });
    },

    /* ------------------------------------------------- product and colour */

    /* Switching product keeps the design: the layers are normalised, so they
       simply re-lay-out into the new garment's print area. */
    setProduct: function (p) {
      const from = area();
      product = p;
      const to = area();

      /* If the new area is a very different shape, the design will land
         technically inside it but look wrong — a full-back graphic dropped
         into a left-chest area, say. Report that rather than silently
         distorting it; the UI decides how loudly to say so. */
      const ratioFrom = from.w / from.h;
      const ratioTo = to.w / to.h;
      const skew = Math.abs(ratioTo - ratioFrom) / ratioFrom;

      /* Colour may not survive the move — hi-vis only comes in safety
         colours, everything else does not offer them. */
      let colorChanged = false;
      if (p.colors && p.colors.indexOf(color) === -1) {
        color = p.colors[0];
        colorChanged = true;
      }

      return renderSide().then(function () {
        return { skewed: skew > 0.15, colorChanged: colorChanged, color: color };
      });
    },

    setColor: function (c) { color = c; },

    setSide: function (s) {
      if (SIDES.indexOf(s) === -1) return Promise.resolve();
      syncFromCanvas();
      side = s;
      canvas.discardActiveObject();
      return renderSide();
    },

    /* ----------------------------------------------------- undo and redo */

    undo: function () {
      if (historyAt <= 0) return false;
      historyAt--;
      restore(history[historyAt]);
      return true;
    },

    redo: function () {
      if (historyAt >= history.length - 1) return false;
      historyAt++;
      restore(history[historyAt]);
      return true;
    },

    canUndo: function () { return historyAt > 0; },
    canRedo: function () { return historyAt < history.length - 1; },

    /* ------------------------------------------------------------ reading */

    getState: function () {
      syncFromCanvas();
      return {
        product: product,
        color: color,
        side: side,
        designs: { front: serializeSide("front"), back: serializeSide("back") }
      };
    },

    getActiveLayer: function () {
      const obj = canvas && canvas.getActiveObject();
      if (!obj || !obj.layerId) return null;
      return designs[side].find(function (l) { return l.id === obj.layerId; }) || null;
    },

    getLayers: function () { return designs[side]; },
    getArea: function () { return area(); },
    getSide: function () { return side; },
    getColor: function () { return color; },
    getProduct: function () { return product; },
    hasAnyDesign: function () { return designs.front.length > 0 || designs.back.length > 0; },

    /* A flattened PNG of the design layers alone, transparent where there is
       no artwork. The garment sits behind the canvas as SVG rather than on
       it, so this exports what would actually be printed — which is what the
       shop needs — not a picture of a shirt. */
    exportDesignPNG: function () {
      if (!canvas) return null;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return canvas.toDataURL({ format: "png", multiplier: 2 });
    },

    resize: function () { if (canvas) canvas.requestRenderAll(); },

    CANVAS_W: CANVAS_W,
    CANVAS_H: CANVAS_H
  };
})();
