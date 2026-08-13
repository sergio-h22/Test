/* ==========================================================================
   M-Power Print — flat print surfaces
   --------------------------------------------------------------------------
   The customizer was built for garments: every product rendered as one of
   five SVG shirt symbols, and printAreaFor() fell back to the t-shirt for
   anything it did not recognise. A business card therefore came out shaped
   like a tee.

   This file is the other half of that system. A garment is a fixed silhouette
   with a small print panel on it; a business card, banner or yard sign is a
   flat rectangle that IS the print area. Those need different geometry and
   different artwork, so they get their own module rather than being forced
   through GARMENT_SHAPES.

   Both halves meet at one function — printAreaFor() in garments.js — which
   asks here first and falls back to the garment table. Everything downstream
   (engine, quote, UI) keeps working unchanged, because all of it already
   speaks in normalised 0-1 coordinates relative to whatever that function
   returns.

   ADDING A PRODUCT
   ----------------
   Add an entry to SURFACES keyed by the product id in products.js, then set
   `customizable: true` on that product. No customizer code changes.
   ========================================================================== */

/* The canvas the engine draws into. Flat surfaces are laid out inside this
   same box so the engine's coordinate space never has to change. */
const SURFACE_BOX = { w: 600, h: 620 };

/* How much of the box a flat product is allowed to fill. Leaving a margin
   means the drop shadow, the trim marks and the grommets have somewhere to
   live instead of being clipped at the canvas edge. */
const SURFACE_FIT = { w: 520, h: 500 };

/* Every flat product. `ratio` is width/height of the finished piece, which is
   what decides the shape on screen — a 3.5x2 card and a 6x3 banner are both
   "a rectangle", and the ratio is the entire difference.

   `safe` is the print-safe inset as a fraction: commercial printing trims
   into the sheet, so artwork closer to the edge than this risks being cut.
   The customizer draws it as a guide and warns when artwork crosses it.

   `material` picks the artwork routine below. `sides` decides whether the
   front/back toggle appears at all — a yard sign printed one side should not
   offer a back. */
const SURFACES = {

  /* ------------------------------------------------------ business print */
  "business-cards": {
    label: "Business card", ratio: 3.5 / 2, safe: 0.06,
    material: "card", sides: ["front", "back"],
    sizeNote: '3.5" × 2"'
  },
  "flyers": {
    label: "Flyer", ratio: 8.5 / 11, safe: 0.05,
    material: "paper", sides: ["front", "back"],
    sizeNote: '8.5" × 11"'
  },
  "postcards": {
    label: "Postcard", ratio: 6 / 4, safe: 0.06,
    material: "card", sides: ["front", "back"],
    sizeNote: '6" × 4"'
  },
  "menus": {
    label: "Menu", ratio: 8.5 / 14, safe: 0.05,
    material: "paper", sides: ["front", "back"],
    sizeNote: '8.5" × 14"'
  },
  "letterhead": {
    label: "Letterhead", ratio: 8.5 / 11, safe: 0.07,
    material: "paper", sides: ["front"],
    sizeNote: '8.5" × 11"'
  },
  "envelopes": {
    label: "Envelope", ratio: 9.5 / 4.125, safe: 0.07,
    material: "envelope", sides: ["front"],
    sizeNote: '#10 business'
  },
  "catalogs": {
    label: "Catalog", ratio: 8.5 / 11, safe: 0.06,
    material: "booklet", sides: ["front", "back"],
    sizeNote: '8.5" × 11", saddle stitched'
  },

  /* -------------------------------------------------- signs & large format */
  "banners": {
    label: "Vinyl banner", ratio: 6 / 2, safe: 0.05,
    material: "banner", sides: ["front"],
    sizeNote: "6ft × 2ft"
  },
  "yard-signs": {
    label: "Yard sign", ratio: 24 / 18, safe: 0.06,
    material: "yardsign", sides: ["front", "back"],
    sizeNote: '24" × 18"'
  },
  "foam-boards": {
    label: "Foam board", ratio: 24 / 36, safe: 0.05,
    material: "board", sides: ["front"],
    sizeNote: '24" × 36"'
  },
  "window-vinyls": {
    label: "Window vinyl", ratio: 36 / 24, safe: 0.05,
    material: "vinyl", sides: ["front"],
    sizeNote: "Cut to size"
  },
  "posters": {
    label: "Poster", ratio: 18 / 24, safe: 0.05,
    material: "paper", sides: ["front"],
    sizeNote: '18" × 24"'
  },
  "signs": {
    label: "Rigid sign", ratio: 24 / 18, safe: 0.06,
    material: "board", sides: ["front"],
    sizeNote: '24" × 18"'
  },

  /* -------------------------------------------------------- stickers etc. */
  "stickers": {
    label: "Sticker", ratio: 1, safe: 0.10,
    material: "sticker", sides: ["front"],
    sizeNote: "Die-cut to your shape"
  },
  "labels": {
    label: "Label", ratio: 3 / 2, safe: 0.08,
    material: "label", sides: ["front"],
    sizeNote: "Sheets or rolls"
  },
  "magnets": {
    label: "Magnet", ratio: 12 / 6, safe: 0.07,
    material: "magnet", sides: ["front"],
    sizeNote: '12" × 6" vehicle'
  }
};

/* Is this product a flat surface rather than a garment? The single question
   the rest of the customizer asks. */
function isFlatSurface(productId) {
  return Object.prototype.hasOwnProperty.call(SURFACES, productId);
}

function surfaceFor(productId) {
  return SURFACES[productId] || null;
}

/* The finished piece's rectangle inside the canvas box, centred, sized to fill
   as much of SURFACE_FIT as its own aspect ratio allows. This is the physical
   edge of the product — the trim line. */
function surfaceRect(productId) {
  const s = SURFACES[productId];
  if (!s) return null;

  let w = SURFACE_FIT.w;
  let h = w / s.ratio;
  if (h > SURFACE_FIT.h) {           /* too tall to fit — constrain by height */
    h = SURFACE_FIT.h;
    w = h * s.ratio;
  }
  return {
    x: (SURFACE_BOX.w - w) / 2,
    y: (SURFACE_BOX.h - h) / 2,
    w: w,
    h: h
  };
}

/* The printable area: the trim rectangle pulled in by the safe margin.

   Note this is deliberately NOT the full piece. Artwork is allowed to sit
   outside it — full-bleed backgrounds should — but anything that must survive
   the cut belongs inside, and that is what the customizer draws a guide for
   and warns about. */
function surfacePrintArea(productId, side) {
  const s = SURFACES[productId];
  const r = surfaceRect(productId);
  if (!s || !r) return null;

  const inset = Math.min(r.w, r.h) * s.safe;
  return {
    x: r.x + inset,
    y: r.y + inset,
    w: r.w - inset * 2,
    h: r.h - inset * 2,
    label: s.sides.length > 1 && side === "back" ? "Back — safe area" : "Safe area"
  };
}

/* Which sides a product actually prints. Garments always answer front/back;
   a banner answers front only, and the UI hides the toggle rather than
   offering a back that does not exist. */
function surfaceSides(productId) {
  const s = SURFACES[productId];
  return s ? s.sides : ["front", "back"];
}

/* --------------------------------------------------------------- artwork ---
   One routine per material. These draw the blank product the design sits on:
   the paper, the vinyl, the coroplast. They are deliberately plain — this is
   a substrate for the customer's artwork, not an illustration competing with
   it, so the palette stays to the site's paper/ink/steel and the detail stops
   at whatever makes the material legible (grommets, stake, die-cut edge).

   Each returns SVG markup positioned in the 600x620 box. */

function surfaceArtwork(productId, side) {
  const s = SURFACES[productId];
  const r = surfaceRect(productId);
  if (!s || !r) return "";

  const x = r.x.toFixed(1), y = r.y.toFixed(1);
  const w = r.w.toFixed(1), h = r.h.toFixed(1);

  /* A contact shadow, so the piece reads as an object on a surface rather
     than a rectangle floating in space. Deliberately tight and faint: pushed
     wider or darker it stops looking like contact and starts looking like a
     separate grey oval sitting under the product.

     `atY` exists because the contact point is not always the bottom of the
     artwork — a yard sign touches the ground at the foot of its stakes, and a
     shadow drawn at the panel's edge would cut across them. */
  function contactShadow(atY, spread) {
    return '<ellipse cx="300" cy="' + atY.toFixed(1) + '" ' +
      'rx="' + (r.w * (spread || 0.40)).toFixed(1) + '" ry="6" ' +
      'fill="#16181B" opacity=".11"/>';
  }
  const shadow = contactShadow(r.y + r.h + 7);

  const sheet =
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' +
    'rx="2" fill="#FFFFFF" stroke="#D9DDE2" stroke-width="1.4"/>';

  switch (s.material) {

    /* Heavier stock reads as thickness at the bottom edge. */
    case "card":
      return shadow +
        '<rect x="' + x + '" y="' + (r.y + 5).toFixed(1) + '" width="' + w + '" height="' + h + '" ' +
          'rx="3" fill="#E4E7EA"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' +
          'rx="3" fill="#FFFFFF" stroke="#D0D5DA" stroke-width="1.4"/>';

    case "paper":
      return shadow + sheet;

    /* A booklet shows a spine so it does not read as a loose sheet. */
    case "booklet":
      return shadow +
        '<rect x="' + (r.x + 6).toFixed(1) + '" y="' + (r.y + 4).toFixed(1) + '" width="' + w + '" height="' + h + '" rx="2" fill="#E8EBEE"/>' +
        sheet +
        '<line x1="' + (r.x + 14).toFixed(1) + '" y1="' + y + '" x2="' + (r.x + 14).toFixed(1) + '" y2="' + (r.y + r.h).toFixed(1) + '" ' +
          'stroke="#D9DDE2" stroke-width="1.2"/>';

    /* The flap is the whole reason an envelope is recognisable. */
    case "envelope": {
      const midX = (r.x + r.w / 2).toFixed(1);
      const flapY = (r.y + r.h * 0.42).toFixed(1);
      return shadow + sheet +
        '<path d="M' + x + ' ' + y + ' L' + midX + ' ' + flapY + ' L' + (r.x + r.w).toFixed(1) + ' ' + y + '" ' +
          'fill="none" stroke="#D9DDE2" stroke-width="1.4"/>';
    }

    /* Grommets along the top and bottom edge — the detail that says "vinyl
       banner" rather than "white rectangle". */
    case "banner": {
      let g = "";
      const n = 5;
      for (let i = 0; i < n; i++) {
        const gx = r.x + (r.w * (i + 0.5)) / n;
        [r.y + 11, r.y + r.h - 11].forEach(function (gy) {
          g += '<circle cx="' + gx.toFixed(1) + '" cy="' + gy.toFixed(1) + '" r="5.5" fill="#F2F4F6" stroke="#9AA1A9" stroke-width="1.6"/>';
        });
      }
      return shadow +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#FFFFFF" stroke="#C9CFD5" stroke-width="1.6"/>' + g;
    }

    /* Coroplast on an H-stake. The stake sits below the trim line, which is
       also why yard signs get a taller bottom margin in SURFACE_FIT. */
    case "yardsign": {
      const legY = (r.y + r.h).toFixed(1);
      const legBottomN = Math.min(SURFACE_BOX.h - 10, r.y + r.h + 58);
      const legBottom = legBottomN.toFixed(1);
      const l1 = (r.x + r.w * 0.3).toFixed(1), l2 = (r.x + r.w * 0.7).toFixed(1);
      /* Shadow at the foot of the stakes — that is where it meets the ground,
         and drawing it at the panel edge would slice through the legs. */
      return contactShadow(legBottomN, 0.30) +
        '<g stroke="#9AA1A9" stroke-width="4" stroke-linecap="round">' +
          '<line x1="' + l1 + '" y1="' + legY + '" x2="' + l1 + '" y2="' + legBottom + '"/>' +
          '<line x1="' + l2 + '" y1="' + legY + '" x2="' + l2 + '" y2="' + legBottom + '"/>' +
        '</g>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#FFFFFF" stroke="#C9CFD5" stroke-width="1.6"/>';
    }

    /* Rigid board reads by its edge thickness. */
    case "board":
      return shadow +
        '<rect x="' + (r.x + 4).toFixed(1) + '" y="' + (r.y + 4).toFixed(1) + '" width="' + w + '" height="' + h + '" fill="#DDE1E5"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#FFFFFF" stroke="#C4CAD1" stroke-width="1.5"/>';

    /* Vinyl on glass: a faint blue cast and a frame, so it reads as applied
       to a window rather than printed on paper. */
    case "vinyl":
      return '<rect x="' + (r.x - 16).toFixed(1) + '" y="' + (r.y - 16).toFixed(1) + '" ' +
          'width="' + (r.w + 32).toFixed(1) + '" height="' + (r.h + 32).toFixed(1) + '" ' +
          'fill="#EAF0F4" stroke="#C2CBD3" stroke-width="3"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' +
          'fill="#FFFFFF" opacity=".92" stroke="#B9C3CC" stroke-width="1.4"/>';

    /* Die-cut stickers get the classic offset white border. */
    case "sticker":
      return shadow +
        '<rect x="' + (r.x - 7).toFixed(1) + '" y="' + (r.y - 7).toFixed(1) + '" ' +
          'width="' + (r.w + 14).toFixed(1) + '" height="' + (r.h + 14).toFixed(1) + '" ' +
          'rx="14" fill="#FFFFFF" stroke="#D3D8DD" stroke-width="1.4" stroke-dasharray="5 4"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="#FFFFFF"/>';

    case "label":
      return shadow +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" ' +
          'fill="#FFFFFF" stroke="#D3D8DD" stroke-width="1.4"/>';

    /* Rounded corners and a slightly grey body — a magnet is not paper. */
    case "magnet":
      return shadow +
        '<rect x="' + x + '" y="' + (r.y + 4).toFixed(1) + '" width="' + w + '" height="' + h + '" rx="9" fill="#C8CDD2"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" ' +
          'fill="#FFFFFF" stroke="#BFC5CB" stroke-width="1.4"/>';

    default:
      return shadow + sheet;
  }
}

/* The trim/safe guides drawn over the artwork while editing. Two rectangles:
   the physical edge, and the safe area inside it. Commercial print customers
   recognise these immediately; everyone else at least sees where it is risky
   to put something. Hidden when nothing is being edited. */
function surfaceGuides(productId) {
  const s = SURFACES[productId];
  const r = surfaceRect(productId);
  if (!s || !r) return "";
  const a = surfacePrintArea(productId, "front");

  return '<g class="dz-guides" aria-hidden="true">' +
      '<rect x="' + r.x.toFixed(1) + '" y="' + r.y.toFixed(1) + '" ' +
        'width="' + r.w.toFixed(1) + '" height="' + r.h.toFixed(1) + '" ' +
        'fill="none" stroke="#E31B23" stroke-width="1.2" stroke-dasharray="6 5" opacity=".55"/>' +
      '<rect x="' + a.x.toFixed(1) + '" y="' + a.y.toFixed(1) + '" ' +
        'width="' + a.w.toFixed(1) + '" height="' + a.h.toFixed(1) + '" ' +
        'fill="none" stroke="#16181B" stroke-width="1" stroke-dasharray="3 4" opacity=".35"/>' +
    '</g>';
}
