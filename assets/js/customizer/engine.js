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

  /* Production output density. 300 is the standard for direct-to-garment and
     screen print; 150 is the floor below which print shops reject artwork. */
  const PRODUCTION_DPI = 300;
  /* Ceiling on either dimension of a production export, so a large print area
     cannot demand a canvas that exhausts memory on a phone. */
  const PRODUCTION_MAX_PX = 6000;

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

  /* A layer's on-screen height as a fraction of the print area.

     Read from the live canvas object when there is one, because only Fabric
     knows how tall a given string in a given font actually rendered. The
     fallback covers the moment before a layer has been drawn — align() can
     be called on a freshly added layer — and is deliberately rough, since
     the next render corrects it. */
  function estimateNormalHeight(layer) {
    const a = area();
    if (canvas) {
      const obj = canvas.getObjects().find(function (o) { return o.layerId === layer.id; });
      if (obj) return obj.getScaledHeight() / a.h;
    }
    if (layer.h) return layer.h;
    if (layer.type === "text") return (layer.w || 0.5) * 0.32;
    return layer.w || 0.4;
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
  /* Copies geometry off the canvas and back into the design array.
     
     This must only ever run after the customer has actually transformed
     something, which in practice means from the object:modified handler.
     Calling it on a read is not harmless, because the round trip is lossy:
     buildText asks Fabric for a given width with scaleToWidth(), and reading
     getScaledWidth() back returns a consistently larger number. Feeding that
     number into the design and rendering from it again compounds, measured at
     +0.762% per cycle, so text grew about 10% over a dozen ordinary edits and
     kept going. Reads must leave the design exactly as they found it. */
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
        opacity: layer.opacity == null ? 1 : layer.opacity,
        flipX: Boolean(layer.flipX),
        flipY: Boolean(layer.flipY),
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
      underline: Boolean(layer.underline),
      textAlign: layer.align || "center",
      /* Fabric measures letter spacing in 1/1000 em, which is the unit the
         UI slider works in too so the two never need converting. */
      charSpacing: layer.spacing || 0,
      lineHeight: layer.leading == null ? 1.16 : layer.leading,
      opacity: layer.opacity == null ? 1 : layer.opacity,
      fill: layer.fill || "#16181B",
      layerId: layer.id,
      clipPath: clipRect()
    });
    t.scaleToWidth(c.scaleW);
    return Promise.resolve(t);
  }

  /* ---------------------------------------------------------------- shapes
     Vector elements the customer can add without uploading anything. Drawn
     from the normalised box like every other layer, so they move, scale and
     survive a product switch identically.

     `h` is carried only by shapes. Text and images derive their height from
     their own content and aspect ratio; a rectangle does not have one to
     derive, so it needs its own. */

  function starPoints(spikes, outer, inner) {
    const pts = [];
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = i * step - Math.PI / 2;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return pts;
  }

  const ARROW_POINTS = [
    { x: -50, y: -12 }, { x: 14, y: -12 }, { x: 14, y: -30 }, { x: 50, y: 0 },
    { x: 14, y: 30 },   { x: 14, y: 12 },  { x: -50, y: 12 }
  ];

  function buildShape(layer) {
    const c = toCanvas(layer);
    const common = {
      left: c.left, top: c.top,
      originX: "center", originY: "center",
      angle: layer.angle || 0,
      fill: layer.fill || "#E31B23",
      opacity: layer.opacity == null ? 1 : layer.opacity,
      layerId: layer.id,
      clipPath: clipRect()
    };

    let obj;
    switch (layer.shape) {
      case "circle":
        obj = new fabric.Circle(Object.assign({ radius: 50 }, common));
        break;
      case "line":
        /* A line has no fill — colour lives on the stroke, so the shared
           `fill` would silently do nothing. */
        obj = new fabric.Line([-50, 0, 50, 0], Object.assign({}, common, {
          fill: null, stroke: layer.fill || "#E31B23", strokeWidth: 8, strokeLineCap: "round"
        }));
        break;
      case "star":
        obj = new fabric.Polygon(starPoints(5, 50, 21), common);
        break;
      case "arrow":
        obj = new fabric.Polygon(ARROW_POINTS, common);
        break;
      case "triangle":
        obj = new fabric.Triangle(Object.assign({ width: 100, height: 88 }, common));
        break;
      default: /* rect */
        obj = new fabric.Rect(Object.assign({ width: 100, height: 70, rx: 0 }, common));
    }

    obj.scaleToWidth(c.scaleW);
    /* Shapes keep an independent height, so a divider line or a banner block
       can be wide and thin rather than locked to one ratio. */
    if (layer.h) {
      const a = area();
      obj.set("scaleY", (layer.h * a.h) / (obj.height || 1));
    }
    return Promise.resolve(obj);
  }
  /* Every render is stamped, and only the newest one is allowed to touch the
     canvas.

     This function rebuilds the whole side from the design array, and building
     an image goes through fabric.Image.fromURL, which is asynchronous. Text
     and shapes resolve almost immediately. So two renders started close
     together do not finish in the order they began, and the version that
     cleared the canvas first was not necessarily the version that filled it
     last.

     Previously the canvas was cleared at the top and refilled in the callback,
     which meant two overlapping renders each cleared once and each added once:
     the canvas ended up holding both result sets. Uploading artwork and then
     immediately adding text duplicated the artwork, and dragging a slider
     could let an older render land last and silently undo the newest edit.
     Both were reproducible.

     Clearing now happens in the callback, next to the add, so the swap is one
     uninterrupted step and a stale render leaves the canvas untouched. */
  let renderToken = 0;

  function renderSide() {
    if (!canvas) return Promise.resolve();
    const token = ++renderToken;

    /* Hidden layers stay in the design but off the canvas — the layer panel
       toggles them so a customer can check what sits underneath something
       without deleting it. */
    const layers = designs[side].filter(function (l) { return !l.hidden; });

    if (!layers.length) {
      if (token !== renderToken) return Promise.resolve();
      canvas.remove.apply(canvas, canvas.getObjects());
      canvas.requestRenderAll();
      return Promise.resolve();
    }

    return Promise.all(layers.map(function (l) {
      if (l.type === "text")  return buildText(l);
      if (l.type === "shape") return buildShape(l);
      return buildImage(l);
    })).then(function (objs) {
      /* A newer render started while these were building. Its snapshot of the
         design is the current one, so these objects are already out of date
         and adding them is exactly the bug. Drop them. */
      if (token !== renderToken) return;
      canvas.remove.apply(canvas, canvas.getObjects());
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
           canvas would rasterise it and throw away the reason to use it.
           natural:0 marks it as "never warn about resolution". */
        if (file.type === "image/svg+xml") {
          resolve({ src: reader.result, natural: 0 });
          return;
        }

        const img = new Image();
        img.onerror = function () { reject(new Error("That image could not be decoded.")); };
        img.onload = function () {
          const big = Math.max(img.width, img.height);
          if (big <= MAX_UPLOAD_PX) {
            resolve({ src: reader.result, natural: img.width });
            return;
          }
          const k = MAX_UPLOAD_PX / big;
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          /* PNG keeps transparency, which matters for a logo on a garment.
             `natural` records the post-downscale width — the pixels actually
             available to print, which is what the warning should judge. */
          resolve({ src: c.toDataURL("image/png"), natural: c.width });
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
      return readImageFile(file).then(function (res) {
        const layer = {
          id: makeId(), type: "image", src: res.src, natural: res.natural,
          /* Centred, 60% of the print area's width — big enough to see, small
             enough to leave obvious room to resize. */
          x: 0.5, y: 0.5, w: 0.6, angle: 0, opacity: 1
        };
        designs[side].push(layer);
        return renderSide().then(function () {
          selectLayer(layer.id);
          pushHistory();
          return layer.id;
        });
      });
    },

    /* Adds artwork that has already been rasterised elsewhere, which is how a
       rendered PDF page enters the design. It is deliberately the same layer
       shape addImage() produces, so nothing downstream, not the canvas, not
       undo, not the cart, not the production export, needs to know where the
       pixels came from.

       meta carries the provenance the shop needs on the order: which file and
       which page this came from. */
    addRendered: function (res, meta) {
      if (!res || !res.src) return Promise.reject(new Error("That artwork could not be prepared."));
      const layer = {
        id: makeId(), type: "image", src: res.src, natural: res.natural || 0,
        x: 0.5, y: 0.5, w: 0.6, angle: 0, opacity: 1
      };
      if (meta) {
        layer.source = meta.source || null;       // "pdf"
        layer.sourceName = meta.name || null;     // original filename
        layer.sourcePage = meta.pageNumber || null;
      }
      designs[side].push(layer);
      return renderSide().then(function () {
        selectLayer(layer.id);
        pushHistory();
        return layer.id;
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

    /* A vector element. Sized so it lands clearly visible but obviously
       resizable, same reasoning as an uploaded image. */
    addShape: function (kind) {
      const layer = {
        id: makeId(), type: "shape", shape: kind || "rect",
        x: 0.5, y: 0.5, w: 0.45, angle: 0,
        fill: "#E31B23", opacity: 1
      };
      /* A line is a rule, not a block — it wants to be thin. */
      if (kind === "line") layer.h = 0.03;
      designs[side].push(layer);
      return renderSide().then(function () {
        selectLayer(layer.id);
        pushHistory();
        return layer.id;
      });
    },

    /* ------------------------------------------------------- layer order
       Array order IS stacking order (renderSide adds in sequence and the
       canvas has preserveObjectStacking), so reordering is an array move
       rather than anything Fabric has to be told about. */
    reorder: function (id, dir) {
      const list = designs[side];
      const i = list.findIndex(function (l) { return l.id === id; });
      if (i === -1) return Promise.resolve();
      const j = dir === "up" ? i + 1 : i - 1;
      if (j < 0 || j >= list.length) return Promise.resolve();
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
      return renderSide().then(function () {
        selectLayer(id);
        pushHistory();
      });
    },

    toggleVisible: function (id) {
      const layer = designs[side].find(function (l) { return l.id === id; });
      if (!layer) return Promise.resolve();
      layer.hidden = !layer.hidden;
      return renderSide().then(function () { pushHistory(); });
    },

    /* Alignment works on the normalised box, which is why it needs no canvas
       measurement: "centre horizontally" is x = 0.5 by definition, whatever
       product or print area is underneath. */
    align: function (id, how) {
      const layer = designs[side].find(function (l) { return l.id === id; });
      if (!layer) return Promise.resolve();

      /* Half the layer's own size, so edge alignment sits the object flush
         inside the area rather than centring it on the boundary. */
      const halfW = (layer.w || 0) / 2;
      const halfH = estimateNormalHeight(layer) / 2;

      switch (how) {
        case "center-h": layer.x = 0.5; break;
        case "center-v": layer.y = 0.5; break;
        case "left":     layer.x = halfW; break;
        case "right":    layer.x = 1 - halfW; break;
        case "top":      layer.y = halfH; break;
        case "bottom":   layer.y = 1 - halfH; break;
      }
      return renderSide().then(function () {
        selectLayer(id);
        pushHistory();
      });
    },

    selectById: function (id) { selectLayer(id); },

    updateLayer: function (id, props) {
      const layer = designs[side].find(function (l) { return l.id === id; });
      if (!layer) return Promise.resolve();
      Object.assign(layer, props);
      /* renderSide() rebuilds every object from scratch, which throws away
         the canvas selection. Without re-selecting, changing a font or
         dragging a slider would close the very panel the customer is
         working in. */
      return renderSide().then(function () {
        if (!layer.hidden) selectLayer(id);
        pushHistory();
      });
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
      /* No sync here. Any transform the customer made was already captured by
         object:modified, and syncing immediately before a re-render is the
         exact cycle that made text creep wider on every side flip. */
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
      /* A read. Geometry is already current: object:modified syncs it the
         moment a transform finishes. */
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

    /* -------------------------------------------------------- validation
       Problems worth telling a customer about before the job reaches the
       press. All warnings, never blockers: a design that bleeds off the edge
       is usually deliberate, and refusing to accept it would be wrong. The
       shop still sees the artwork either way.

       Returns [{ level, layerId, message }]. */
    validate: function () {
      const out = [];
      const a = area();

      designs[side].forEach(function (l) {
        if (l.hidden) return;
        const hN = estimateNormalHeight(l);
        const halfW = (l.w || 0) / 2, halfH = hN / 2;
        const name = l.type === "text" ? '"' + (l.text || "").slice(0, 18) + '"'
                   : l.type === "shape" ? "A shape" : "Your artwork";

        /* Outside the safe area entirely, or crossing it. */
        if (l.x - halfW < -0.02 || l.x + halfW > 1.02 ||
            l.y - halfH < -0.02 || l.y + halfH > 1.02) {
          out.push({
            level: "warn", layerId: l.id,
            message: name + " runs outside the printable area. Anything past the edge may be trimmed off."
          });
        } else if (l.x - halfW < 0.04 || l.x + halfW > 0.96 ||
                   l.y - halfH < 0.04 || l.y + halfH > 0.96) {
          out.push({
            level: "note", layerId: l.id,
            message: name + " sits very close to the edge. Move it in a little to be safe."
          });
        }

        /* Upload resolution. The stored src is already downscaled to at most
           MAX_UPLOAD_PX, so this checks the pixels actually available against
           the size it is being printed at — which is the question that
           matters, not the raw file size. */
        if (l.type === "image" && l.natural) {
          const printedPx = l.natural * (1 / Math.max(l.w, 0.01));
          if (printedPx < 900) {
            out.push({
              level: "warn", layerId: l.id,
              message: "Your artwork may print blurry at this size. A larger file, or a smaller placement, will print sharper."
            });
          }
        }

        /* Very small text. Below roughly 4% of the print area's height, type
           stops being reliably readable once printed. */
        if (l.type === "text" && hN < 0.04) {
          out.push({
            level: "note", layerId: l.id,
            message: "That text is very small and may be hard to read once printed."
          });
        }
      });

      return out;
    },

    getLayers: function () { return designs[side]; },
    getAllDesigns: function () { return { front: serializeSide("front"), back: serializeSide("back") }; },

    /* Replaces the whole design — used by save/restore and by templates. */
    loadDesigns: function (data) {
      if (!data) return Promise.resolve();
      SIDES.forEach(function (s) {
        designs[s] = Array.isArray(data[s]) ? data[s] : [];
      });
      /* Ids must not collide with anything added afterwards. */
      let max = 0;
      SIDES.forEach(function (s) {
        designs[s].forEach(function (l) {
          const n = parseInt(String(l.id).replace(/\D/g, ""), 10);
          if (n > max) max = n;
        });
      });
      nextId = max + 1;
      return renderSide().then(function () { pushHistory(); });
    },
    getArea: function () { return area(); },
    getSide: function () { return side; },
    getColor: function () { return color; },
    getProduct: function () { return product; },
    hasAnyDesign: function () { return designs.front.length > 0 || designs.back.length > 0; },

    /* A flattened PNG of the design layers alone, transparent where there is
       no artwork. The garment sits behind the canvas as SVG rather than on
       it, so this exports what would actually be printed — which is what the
       shop needs — not a picture of a shirt. */
    /* ------------------------------------------------------- production ---
       The preview and the production file are different products and must not
       be the same bitmap.

       exportDesignPNG() renders the whole 600x620 editor canvas at multiplier
       2. For a t-shirt that puts the artwork itself at 328x432 pixels, which
       across a 12 inch print is 27 DPI. Print wants 300, and will not accept
       less than 150. Sending that file to a press produces visibly blocky
       work, so it is fit for showing the customer and for nothing else.

       This crops to the print area alone and scales by whatever it takes to
       reach the target density. Text and shapes are vector objects, so Fabric
       redraws them at the larger size and they come out genuinely sharp;
       uploaded bitmaps cannot gain detail they never had, which is what the
       low-resolution warning in validate() already tells the customer about.

       The garment silhouette is SVG in the page behind the canvas, not a
       canvas object, so it is absent from this export and the background is
       transparent, which is what a press needs. */
    exportProduction: function (which) {
      if (!canvas) return null;

      const target = which || side;
      const original = side;
      const restore = target === original ? null : original;

      const run = function () {
        const a = area();
        const inches = typeof printPhysicalFor === "function"
          ? printPhysicalFor(product.id, target)
          : [12, 16];

        /* Scale to hit PRODUCTION_DPI, then clamp so an unusually large print
           area cannot ask for a canvas big enough to exhaust memory on a
           phone. Clamping lowers density; it never crops the artwork. */
        let multiplier = (inches[0] * PRODUCTION_DPI) / a.w;
        const widest = a.w * multiplier;
        const tallest = a.h * multiplier;
        if (Math.max(widest, tallest) > PRODUCTION_MAX_PX) {
          multiplier = PRODUCTION_MAX_PX / Math.max(a.w, a.h);
        }

        canvas.discardActiveObject();
        canvas.requestRenderAll();

        const png = canvas.toDataURL({
          format: "png",
          multiplier: multiplier,
          left: a.x, top: a.y, width: a.w, height: a.h
        });

        return {
          png: png,
          side: target,
          productId: product.id,
          widthPx: Math.round(a.w * multiplier),
          heightPx: Math.round(a.h * multiplier),
          widthIn: inches[0],
          heightIn: inches[1],
          dpi: Math.round((a.w * multiplier) / inches[0]),
          transparent: true
        };
      };

      if (!restore) return Promise.resolve(run());
      /* Exporting a side means making it the live one first. */
      side = target;
      return renderSide()
        .then(run)
        .then(function (out) {
          side = restore;
          return renderSide().then(function () { return out; });
        });
    },

    /* The design array is the source of truth and the canvas is meant to be a
       mirror of it. Any difference between the two is a bug, so the count is
       exposed rather than left to be guessed at from exported pixels. Used by
       the customizer tests to assert that invariant directly. */
    /* Clears the design on both sides and starts the history over, so an
       undo cannot walk back into work the customer asked to discard. The
       product, colour and side selections are deliberately kept: resetting
       the artwork is not the same as leaving the editor. */
    resetDesign: function () {
      designs.front.length = 0;
      designs.back.length = 0;
      history = [];
      historyAt = -1;
      return renderSide().then(function () {
        pushHistory();
      });
    },

    canvasObjectCount: function () {
      return canvas ? canvas.getObjects().length : -1;
    },

    visibleLayerCount: function () {
      return designs[side].filter(function (l) { return !l.hidden; }).length;
    },

    exportDesignPNG: function () {
      if (!canvas) return null;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return canvas.toDataURL({ format: "png", multiplier: 2 });
    },

    /* A flattened PNG per side that actually carries artwork, for the preview
       screen. Rendering a side means making it the live one, so this walks
       them in sequence and puts the original side back afterwards — the
       customer must not find themselves on the back of the shirt because
       they opened a preview. */
    exportSides: function () {
      const original = side;
      const withArt = SIDES.filter(function (s) { return designs[s].length; });
      const out = {};

      return withArt.reduce(function (chain, s) {
        return chain.then(function () {
          side = s;
          return renderSide().then(function () {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            out[s] = canvas.toDataURL({ format: "png", multiplier: 2 });
          });
        });
      }, Promise.resolve()).then(function () {
        side = original;
        return renderSide();
      }).then(function () { return out; });
    },

    resize: function () { if (canvas) canvas.requestRenderAll(); },

    CANVAS_W: CANVAS_W,
    CANVAS_H: CANVAS_H
  };
})();
