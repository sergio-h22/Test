/* ==========================================================================
   M-Power Print — design templates
   --------------------------------------------------------------------------
   A starting point for customers who do not want to face a blank product.
   Each template is just a layer list in the same normalised format the engine
   already uses, so applying one is CustomizerEngine.loadDesigns() and nothing
   else. No template-specific code exists anywhere in the editor.

   ADDING A TEMPLATE
   -----------------
   Add an entry below. Required:

     id        unique
     name      what the customer sees
     category  groups it in the picker; any string, new ones appear on their own
     fits      product ids, or catalogue category ids, this suits.
               ["*"] means every product.
     design    { front: [layers], back: [layers] }

   A layer is exactly what the engine stores:

     text   { type:"text",  text, x, y, w, angle, font, fill, bold, align }
     shape  { type:"shape", shape, x, y, w, h, angle, fill, opacity }

   x/y are the centre as a fraction of the print area; w is width as a
   fraction of it. That is why one template works on a business card and a
   banner — it is laid out in proportions, not pixels.

   These are deliberately type-and-shape only. An image layer would need
   artwork we do not have the rights to redistribute, and a template that
   ships someone else's clipart is a liability rather than a feature. Real
   artwork belongs to the customer's upload.
   ========================================================================== */

const TEMPLATE_FONTS = {
  display: "Oswald, sans-serif",
  clean:   "Montserrat, sans-serif",
  serif:   "Georgia, serif",
  heavy:   "Impact, Haettenschweiler, sans-serif"
};

const TEMPLATES = [

  /* ------------------------------------------------------------ business */
  {
    id: "biz-stack",
    name: "Name & details",
    category: "Business",
    fits: ["print", "stickers"],
    design: {
      front: [
        { type: "text", text: "YOUR BUSINESS", x: 0.5, y: 0.32, w: 0.86, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#16181B", bold: true, align: "center" },
        { type: "shape", shape: "line", x: 0.5, y: 0.48, w: 0.4, h: 0.012, angle: 0,
          fill: "#E31B23", opacity: 1 },
        { type: "text", text: "What you do", x: 0.5, y: 0.6, w: 0.6, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" },
        { type: "text", text: "(555) 555-5555", x: 0.5, y: 0.78, w: 0.5, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#16181B", align: "center" }
      ],
      back: []
    }
  },
  {
    id: "biz-band",
    name: "Red band",
    category: "Business",
    fits: ["*"],
    design: {
      front: [
        { type: "shape", shape: "rect", x: 0.5, y: 0.5, w: 1, h: 0.34, angle: 0,
          fill: "#E31B23", opacity: 1 },
        { type: "text", text: "YOUR NAME HERE", x: 0.5, y: 0.5, w: 0.82, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#FFFFFF", bold: true, align: "center" }
      ],
      back: []
    }
  },

  /* --------------------------------------------------------------- work */
  {
    id: "work-crew",
    name: "Crew shirt",
    category: "Work",
    fits: ["apparel"],
    design: {
      front: [
        { type: "text", text: "YOUR COMPANY", x: 0.5, y: 0.42, w: 0.9, angle: 0,
          font: TEMPLATE_FONTS.heavy, fill: "#16181B", bold: true, align: "center" },
        { type: "text", text: "EST. 2026", x: 0.5, y: 0.66, w: 0.42, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" }
      ],
      back: [
        { type: "text", text: "YOUR COMPANY", x: 0.5, y: 0.3, w: 0.94, angle: 0,
          font: TEMPLATE_FONTS.heavy, fill: "#16181B", bold: true, align: "center" },
        { type: "text", text: "yourwebsite.com", x: 0.5, y: 0.62, w: 0.6, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" }
      ]
    }
  },

  /* ------------------------------------------------------------- events */
  {
    id: "event-open",
    name: "Grand opening",
    category: "Events",
    fits: ["signs", "print"],
    design: {
      front: [
        { type: "text", text: "GRAND", x: 0.5, y: 0.26, w: 0.7, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#E31B23", bold: true, align: "center" },
        { type: "text", text: "OPENING", x: 0.5, y: 0.48, w: 0.86, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#16181B", bold: true, align: "center" },
        { type: "shape", shape: "line", x: 0.5, y: 0.66, w: 0.5, h: 0.014, angle: 0,
          fill: "#16181B", opacity: 1 },
        { type: "text", text: "Saturday · 9am", x: 0.5, y: 0.8, w: 0.62, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" }
      ],
      back: []
    }
  },
  {
    id: "event-sale",
    name: "Sale burst",
    category: "Events",
    fits: ["signs", "print", "stickers"],
    design: {
      front: [
        { type: "shape", shape: "star", x: 0.5, y: 0.5, w: 0.92, angle: 0,
          fill: "#E31B23", opacity: 1 },
        { type: "text", text: "SALE", x: 0.5, y: 0.5, w: 0.42, angle: 0,
          font: TEMPLATE_FONTS.heavy, fill: "#FFFFFF", bold: true, align: "center" }
      ],
      back: []
    }
  },

  /* ------------------------------------------------------------ notices */
  {
    id: "notice-plain",
    name: "Plain notice",
    category: "Signs & notices",
    fits: ["signs"],
    design: {
      front: [
        { type: "shape", shape: "rect", x: 0.5, y: 0.5, w: 0.98, h: 0.96, angle: 0,
          fill: "#FFFFFF", opacity: 1 },
        { type: "text", text: "NOTICE", x: 0.5, y: 0.3, w: 0.66, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#16181B", bold: true, align: "center" },
        { type: "text", text: "Your message here", x: 0.5, y: 0.58, w: 0.8, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" }
      ],
      back: []
    }
  },
  {
    id: "notice-arrow",
    name: "This way",
    category: "Signs & notices",
    fits: ["signs"],
    design: {
      front: [
        { type: "text", text: "PARKING", x: 0.5, y: 0.3, w: 0.78, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#16181B", bold: true, align: "center" },
        { type: "shape", shape: "arrow", x: 0.5, y: 0.65, w: 0.6, angle: 0,
          fill: "#E31B23", opacity: 1 }
      ],
      back: []
    }
  },

  /* -------------------------------------------------------------- family */
  {
    id: "family-reunion",
    name: "Reunion",
    category: "Family",
    fits: ["apparel", "print"],
    design: {
      front: [
        { type: "text", text: "FAMILY", x: 0.5, y: 0.3, w: 0.72, angle: 0,
          font: TEMPLATE_FONTS.serif, fill: "#16181B", align: "center" },
        { type: "text", text: "REUNION", x: 0.5, y: 0.52, w: 0.88, angle: 0,
          font: TEMPLATE_FONTS.display, fill: "#E31B23", bold: true, align: "center" },
        { type: "text", text: "2026", x: 0.5, y: 0.74, w: 0.34, angle: 0,
          font: TEMPLATE_FONTS.clean, fill: "#5C626B", align: "center" }
      ],
      back: []
    }
  }
];

/* Templates that suit a given product. A template lists product ids, category
   ids, or "*" — checking all three here means the list can be written in
   whichever way is least repetitive for that template. */
function templatesFor(product) {
  if (typeof TEMPLATES === "undefined" || !product) return [];
  return TEMPLATES.filter(function (t) {
    const fits = t.fits || ["*"];
    return fits.indexOf("*") !== -1 ||
           fits.indexOf(product.id) !== -1 ||
           fits.indexOf(product.cat) !== -1;
  });
}

/* A fresh copy every time. Handing out the shared object would let the
   customer's edits write straight back into the template definition, so the
   second person to use it would start from the first person's changes. */
function templateDesign(id) {
  const t = TEMPLATES.find(function (x) { return x.id === id; });
  if (!t) return null;
  return JSON.parse(JSON.stringify(t.design));
}
