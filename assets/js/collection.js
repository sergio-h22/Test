/* Drop 01: the designs a customer can buy as they are, or take into the
 * editor and make their own.
 *
 * This file is the single source of truth for the collection. Nothing about a
 * design is repeated in the HTML: the homepage, the modal and the editor all
 * read from here, so adding an eleventh design is a data change and no more.
 * That is also the shape a Supabase `designs` table would take, which is why
 * the fields are named the way they are (see services/catalog.js).
 *
 * Artwork is vector, held as the same layer vocabulary the customizer uses.
 * That is deliberate rather than a stopgap: a design defined as data recolours
 * itself for a black or a white garment, scales to any print size without
 * resampling, separates cleanly for screen print, and cannot drift away from
 * what the production export renders, because both come from these numbers.
 *
 * prices is null on every entry. No prices have been set for this collection
 * and putting invented numbers in front of paying customers is not a thing to
 * do; the modal shows the garment choice without a figure until real prices
 * are supplied, and getPrice() in the service layer is where they will arrive.
 */

const COLLECTION_SCHEMA_VERSION = 1;

/* The three garments this collection prints on. Anything not listed here is
   still a product on the site; it is simply not part of the drop. */
const COLLECTION_GARMENTS = ["t-shirts", "hoodies", "long-sleeve"];

const COLLECTION_CATEGORIES = [
  { id: "anime",    name: "Anime Inspired" },
  { id: "japanese", name: "Japanese Inspired" },
  { id: "vintage",  name: "Vintage" },
  { id: "racing",   name: "Racing" },
  { id: "gothic",   name: "Gothic" },
  { id: "futurist", name: "Futurist" },
  { id: "athletic", name: "Athletic" }
];

/* Ink tokens, resolved per garment colour at render time. Keeping them as
   tokens rather than literals is what lets one design serve a black shirt and
   a white one without a second copy of the artwork. */
const COLLECTION_INK = {
  onDark:  "#EDE9E3",
  onLight: "#0B0C0E",
  accent:  "#E31B23"
};
const COLLECTION_DARK_GARMENT_COLORS = ["Black", "Navy"];

const COLLECTION_FONTS = {
  display: "Oswald, sans-serif",
  clean:   "Montserrat, sans-serif",
  heavy:   "Impact, Haettenschweiler, sans-serif"
};

const COLLECTION = [
  {
    id: "dragon-ascension-001",
    slug: "dragon-ascension",
    name: "Dragon Ascension",
    description: "A rising column of type behind a coiled mark. Reads as a crest at distance.",
    category: "japanese",
    tags: ["mythology", "vertical", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "White", "Navy", "Heather Grey"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 1,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "shape", shape: "circle", x: 0.5, y: 0.28, w: 0.32, h: 0.32, angle: 0, fill: "@accent", opacity: 1 },
        { type: "shape", shape: "circle", x: 0.5, y: 0.28, w: 0.22, h: 0.22, angle: 0, fill: "@ink", opacity: 1 },
        { type: "text", text: "昇", x: 0.5, y: 0.28, w: 0.12, angle: 0, font: COLLECTION_FONTS.display, fill: "@accent", bold: true, align: "center" },
        { type: "text", text: "DRAGON", x: 0.5, y: 0.62, w: 0.72, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 120 },
        { type: "text", text: "ASCENSION", x: 0.5, y: 0.74, w: 0.82, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 120 }
      ],
      back: [
        { type: "text", text: "昇", x: 0.5, y: 0.34, w: 0.5, angle: 0, font: COLLECTION_FONTS.display, fill: "@accent", bold: true, align: "center" },
        { type: "shape", shape: "rect", x: 0.5, y: 0.62, w: 0.8, h: 0.012, angle: 0, fill: "@ink", opacity: 1 },
        { type: "text", text: "RISE THROUGH IT", x: 0.5, y: 0.72, w: 0.8, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 200 }
      ]
    }
  },
  {
    id: "ronin-legacy-002",
    slug: "ronin-legacy",
    name: "Ronin Legacy",
    description: "A struck badge with crossed bars. Small on the chest, full crest on the back.",
    category: "japanese",
    tags: ["badge", "crest", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "Navy", "Heather Grey"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 2,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "shape", shape: "rect", x: 0.5, y: 0.46, w: 0.36, h: 0.014, angle: 30, fill: "@accent", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.46, w: 0.36, h: 0.014, angle: -30, fill: "@accent", opacity: 1 },
        { type: "text", text: "RONIN", x: 0.5, y: 0.6, w: 0.46, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 180 }
      ],
      back: [
        { type: "shape", shape: "circle", x: 0.5, y: 0.4, w: 0.62, h: 0.62, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "circle", x: 0.5, y: 0.4, w: 0.54, h: 0.54, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "RONIN", x: 0.5, y: 0.36, w: 0.42, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 90 },
        { type: "text", text: "LEGACY", x: 0.5, y: 0.46, w: 0.42, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 90 },
        { type: "text", text: "NO MASTER  NO LIMIT", x: 0.5, y: 0.78, w: 0.84, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 180 }
      ]
    }
  },
  {
    id: "kaiju-protocol-003",
    slug: "kaiju-protocol",
    name: "Kaiju Protocol",
    description: "Warning-panel layout with a heavy stencil call. Built for a black garment.",
    category: "anime",
    tags: ["stencil", "panel", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "Navy"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 3,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "shape", shape: "rect", x: 0.5, y: 0.42, w: 0.86, h: 0.2, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "KAIJU", x: 0.5, y: 0.42, w: 0.74, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 },
        { type: "text", text: "PROTOCOL 03", x: 0.5, y: 0.6, w: 0.7, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 200 }
      ],
      back: [
        { type: "text", text: "KAIJU", x: 0.5, y: 0.26, w: 0.92, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 30 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.42, w: 0.92, h: 0.05, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "CONTAINMENT FAILED", x: 0.5, y: 0.56, w: 0.88, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 160 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.7, w: 0.92, h: 0.05, angle: 0, fill: "@accent", opacity: 1 }
      ]
    }
  },
  {
    id: "sixth-form-004",
    slug: "sixth-form",
    name: "Sixth Form",
    description: "Six stacked rules under a single word. Quiet at a glance, deliberate up close.",
    category: "anime",
    tags: ["minimal", "one colour", "stacked"],
    garments: COLLECTION_GARMENTS,
    colors: ["White", "Heather Grey", "Black"],
    prices: null,
    featured: false,
    published: true,
    displayOrder: 4,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "text", text: "SIXTH FORM", x: 0.5, y: 0.34, w: 0.8, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 140 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.46, w: 0.8, h: 0.008, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.51, w: 0.68, h: 0.008, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.56, w: 0.56, h: 0.008, angle: 0, fill: "@accent", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.61, w: 0.44, h: 0.008, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.66, w: 0.32, h: 0.008, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.71, w: 0.2, h: 0.008, angle: 0, fill: "@ink", opacity: 1 }
      ],
      back: []
    }
  },
  {
    id: "union-press-005",
    slug: "union-press",
    name: "Union Press",
    description: "Workwear lettering with a year band. Ages well on heather.",
    category: "vintage",
    tags: ["workwear", "vintage", "one colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Heather Grey", "White", "Navy", "Black"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 5,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "text", text: "UNION PRESS", x: 0.5, y: 0.4, w: 0.84, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 70 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.52, w: 0.84, h: 0.035, angle: 0, fill: "@ink", opacity: 1 },
        { type: "text", text: "SOUTHERN CALIFORNIA", x: 0.5, y: 0.63, w: 0.8, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 190 }
      ],
      back: [
        { type: "text", text: "PRESSED", x: 0.5, y: 0.34, w: 0.86, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 },
        { type: "text", text: "BY HAND", x: 0.5, y: 0.5, w: 0.86, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@accent", bold: true, align: "center", spacing: 40 },
        { type: "text", text: "EST. SOUTHERN CALIFORNIA", x: 0.5, y: 0.68, w: 0.88, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 170 }
      ]
    }
  },
  {
    id: "faded-glory-006",
    slug: "faded-glory",
    name: "Faded Glory",
    description: "An arc over a solid block. The oldest layout there is, and it still works.",
    category: "vintage",
    tags: ["arc", "collegiate", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Heather Grey", "Navy", "Black", "White"],
    prices: null,
    featured: false,
    published: true,
    displayOrder: 6,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "text", text: "FADED", x: 0.5, y: 0.32, w: 0.66, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 110 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.52, w: 0.86, h: 0.19, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "GLORY", x: 0.5, y: 0.52, w: 0.76, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 },
        { type: "text", text: "SINCE THE FIRST RUN", x: 0.5, y: 0.7, w: 0.78, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 170 }
      ],
      back: []
    }
  },
  {
    id: "midnight-velocity-007",
    slug: "midnight-velocity",
    name: "Midnight Velocity",
    description: "A racing number under a chequer band, set on the angle.",
    category: "racing",
    tags: ["racing", "number", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "White", "Red"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 7,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "shape", shape: "rect", x: 0.5, y: 0.3, w: 0.86, h: 0.05, angle: -6, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.36, w: 0.86, h: 0.02, angle: -6, fill: "@accent", opacity: 1 },
        { type: "text", text: "07", x: 0.5, y: 0.54, w: 0.44, angle: -6, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center" },
        { type: "text", text: "MIDNIGHT VELOCITY", x: 0.5, y: 0.74, w: 0.88, angle: -6, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 150 }
      ],
      back: [
        { type: "text", text: "07", x: 0.5, y: 0.42, w: 0.7, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@accent", bold: true, align: "center" },
        { type: "text", text: "RUN IT AT NIGHT", x: 0.5, y: 0.68, w: 0.86, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 120 }
      ]
    }
  },
  {
    id: "celestial-fallen-008",
    slug: "celestial-fallen",
    name: "Celestial Fallen",
    description: "A struck star over close-set type. Heavy on black, stark on white.",
    category: "gothic",
    tags: ["celestial", "gothic", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "White", "Navy"],
    prices: null,
    featured: false,
    published: true,
    displayOrder: 8,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "shape", shape: "star", x: 0.5, y: 0.36, w: 0.4, h: 0.4, angle: 0, fill: "@ink", opacity: 1 },
        { type: "shape", shape: "star", x: 0.5, y: 0.36, w: 0.22, h: 0.22, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "CELESTIAL", x: 0.5, y: 0.62, w: 0.8, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 90 },
        { type: "text", text: "FALLEN", x: 0.5, y: 0.72, w: 0.56, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 90 }
      ],
      back: [
        { type: "shape", shape: "star", x: 0.5, y: 0.42, w: 0.72, h: 0.72, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "FALLEN", x: 0.5, y: 0.78, w: 0.66, angle: 0, font: COLLECTION_FONTS.display, fill: "@ink", bold: true, align: "center", spacing: 150 }
      ]
    }
  },
  {
    id: "neo-tokyo-signal-009",
    slug: "neo-tokyo-signal",
    name: "Neo Tokyo Signal",
    description: "Interference bars cutting through the word. Reads as a broken transmission.",
    category: "futurist",
    tags: ["cyberpunk", "glitch", "two colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "Navy"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 9,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "text", text: "NEO TOKYO", x: 0.5, y: 0.42, w: 0.9, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 30 },
        { type: "shape", shape: "rect", x: 0.42, y: 0.38, w: 0.5, h: 0.016, angle: 0, fill: "@accent", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.62, y: 0.44, w: 0.42, h: 0.016, angle: 0, fill: "@accent", opacity: 1 },
        { type: "shape", shape: "rect", x: 0.38, y: 0.48, w: 0.3, h: 0.016, angle: 0, fill: "@accent", opacity: 1 },
        { type: "text", text: "SIGNAL LOST", x: 0.5, y: 0.64, w: 0.7, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 210 }
      ],
      back: [
        { type: "text", text: "SIGNAL", x: 0.5, y: 0.3, w: 0.88, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 30 },
        { type: "text", text: "LOST", x: 0.5, y: 0.48, w: 0.66, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@accent", bold: true, align: "center", spacing: 30 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.64, w: 0.9, h: 0.012, angle: 0, fill: "@ink", opacity: 1 },
        { type: "text", text: "NEO TOKYO", x: 0.5, y: 0.74, w: 0.8, angle: 0, font: COLLECTION_FONTS.clean, fill: "@ink", align: "center", spacing: 190 }
      ]
    }
  },
  {
    id: "heavyweight-spirit-010",
    slug: "heavyweight-spirit",
    name: "Heavyweight Spirit",
    description: "Two words filling the whole chest. Nothing else, on purpose.",
    category: "athletic",
    tags: ["typography", "bold", "one colour"],
    garments: COLLECTION_GARMENTS,
    colors: ["Black", "White", "Navy", "Heather Grey"],
    prices: null,
    featured: true,
    published: true,
    displayOrder: 10,
    assets: { front: "", back: "", model: "" },
    design: {
      front: [
        { type: "text", text: "HEAVY", x: 0.5, y: 0.34, w: 0.94, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 },
        { type: "text", text: "WEIGHT", x: 0.5, y: 0.52, w: 0.94, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 },
        { type: "shape", shape: "rect", x: 0.5, y: 0.66, w: 0.36, h: 0.022, angle: 0, fill: "@accent", opacity: 1 }
      ],
      back: [
        { type: "text", text: "SPIRIT", x: 0.5, y: 0.44, w: 0.92, angle: 0, font: COLLECTION_FONTS.heavy, fill: "@ink", bold: true, align: "center", spacing: 40 }
      ]
    }
  }
];
