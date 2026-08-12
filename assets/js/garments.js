/* ==========================================================================
   M-Power Print — garment artwork for the customizer
   --------------------------------------------------------------------------
   Front and back artwork for every customizable apparel product, plus the
   print-area geometry that says where a design is allowed to sit.

   Why this file exists separately from illustrations.js: those drawings are
   150x200 catalogue thumbnails. These are 600x620 garments a customer is
   going to drag artwork onto, so they need real shading, a back view, and
   coordinates the customizer can reason about.

   Drawing system
     viewBox    0 0 600 620, shared by every garment so print areas and
                design coordinates mean the same thing across products
     colour     entirely CSS custom properties (--cloth-0…--cloth-5, --rib,
                --rib-edge) — see GARMENT_COLORS in illustrations.js. Nothing
                here hardcodes a fabric colour.
     shading    written once in SHARED_SHADING and clipped to each garment's
                own outline, so all five read as the same material

   Adding a garment
     1. add an entry to GARMENT_SHAPES with `front` and `back`
     2. point a product at it via `art` in products.js
     3. give it printAreas
   Nothing in the customizer engine needs to change.
   ========================================================================== */

/* --------------------------------------------------------------- outlines --
   All five garments are drawn on the same 600x620 grid with the body centred
   on x=300, so a design at a given normalised position lands in a comparable
   place whichever garment is picked. That is what makes switching products
   without losing the design possible. */

const TEE_BODY =
  "M232 106 C214 114 196 124 182 136 L120 250 C114 262 118 276 128 286 " +
  "L170 316 C182 324 196 318 202 306 L216 272 C210 298 208 328 208 358 " +
  "L206 538 C206 550 214 558 226 558 L374 558 C386 558 394 550 394 538 " +
  "L392 358 C392 328 390 298 384 272 L398 306 C404 318 418 324 430 316 " +
  "L472 286 C482 276 486 262 480 250 L418 136 C404 124 386 114 368 106 ";

/* The only difference between a tee's front and back is the neck: the front
   scoops down, the back sits high and almost flat. Same body, so the two
   views line up exactly when the customer flips between them. */
const TEE_FRONT = TEE_BODY + "Q300 166 232 106 Z";
const TEE_BACK  = TEE_BODY + "Q300 130 232 106 Z";

/* Heavier, longer, wider sleeves, ribbed hem. */
const HOOD_BODY =
  "M226 118 C206 127 186 138 171 151 L104 262 C97 275 102 290 113 301 " +
  "L158 333 C171 342 186 335 193 322 L209 286 C202 314 200 346 200 378 " +
  "L198 548 C198 561 207 570 220 570 L380 570 C393 570 402 561 402 548 " +
  "L400 378 C400 346 398 314 391 286 L407 322 C414 335 429 342 442 333 " +
  "L487 301 C498 290 503 275 496 262 L429 151 C414 138 394 127 374 118 ";
const HOODIE_FRONT = HOOD_BODY + "Q300 172 226 118 Z";
const HOODIE_BACK  = HOOD_BODY + "Q300 140 226 118 Z";

/* Tee body with a slightly narrower shoulder and a shorter sleeve. */
const POLO_BODY =
  "M238 112 C220 120 202 130 189 142 L131 250 C125 262 129 276 139 286 " +
  "L177 313 C189 321 202 315 208 303 L221 271 C215 297 213 327 213 357 " +
  "L211 534 C211 546 219 554 231 554 L369 554 C381 554 389 546 389 534 " +
  "L387 357 C387 327 385 297 379 271 L392 303 C398 315 411 321 423 313 " +
  "L461 286 C471 276 475 262 469 250 L411 142 C398 130 380 120 362 112 ";
const POLO_FRONT = POLO_BODY + "Q300 158 238 112 Z";
const POLO_BACK  = POLO_BODY + "Q300 132 238 112 Z";

/* Genuinely sleeveless: the armhole cuts straight back in to the body rather
   than continuing out into a sleeve. A safety vest with sleeves would be a
   different garment and would put the print area in the wrong place. */
const VEST_BODY =
  "M238 122 C222 128 210 136 202 148 L188 202 C184 214 190 224 202 228 " +
  "L214 233 C212 280 211 320 211 356 L210 520 C210 532 218 540 230 540 " +
  "L370 540 C382 540 390 532 390 520 L389 356 C389 320 388 280 386 233 " +
  "L398 228 C410 224 416 214 412 202 L398 148 C390 136 378 128 362 122 ";
const VEST_FRONT = VEST_BODY + "Q300 160 236 120 Z";
const VEST_BACK  = VEST_BODY + "Q300 134 236 120 Z";

/* Structured work shirt: straighter body, longer sleeves, proper collar. */
const WORK_BODY =
  "M240 114 C221 122 203 132 190 145 L136 252 C130 264 134 278 144 288 " +
  "L180 314 C192 322 205 316 211 304 L223 273 C217 299 215 329 215 359 " +
  "L214 542 C214 554 222 562 234 562 L366 562 C378 562 386 554 386 542 " +
  "L385 359 C385 329 383 299 377 273 L389 304 C395 316 408 322 420 314 " +
  "L456 288 C466 278 470 264 464 252 L410 145 C397 132 379 122 360 114 ";
const UNIFORM_FRONT = WORK_BODY + "Q300 156 240 114 Z";
const UNIFORM_BACK  = WORK_BODY + "Q300 130 240 114 Z";

/* ---------------------------------------------------------------- shading --
   One block of fabric shading, clipped to whichever garment outline is being
   drawn. Written once so all five garments catch light the same way — the
   thing that makes them read as one product family rather than five drawings
   by five people. */
function sharedShading(clipId, sleeveless) {
  /* Sleeve shading is drawn at fixed coordinates that only make sense on a
     garment that has sleeves there. On the vest it would paint shadows onto
     bare armholes, so it is skipped rather than clipped away and hoped for. */
  const sleeves = sleeveless ? "" : `
      <ellipse cx="222" cy="286" rx="26" ry="15" fill="#0E1013" opacity=".11" filter="url(#soft)"/>
      <ellipse cx="378" cy="286" rx="26" ry="15" fill="#0E1013" opacity=".12" filter="url(#soft)"/>
      <path d="M150 268 Q168 296 190 306" stroke="#0E1013" stroke-width="13" fill="none"
            opacity=".07" filter="url(#soft)"/>
      <path d="M450 268 Q432 296 410 306" stroke="#0E1013" stroke-width="13" fill="none"
            opacity=".08" filter="url(#soft)"/>`;

  return `
    <g clip-path="url(#${clipId})">
      <rect x="0" y="0" width="600" height="620" fill="url(#clothV)"/>
      ${sleeves}
      <path d="M206 300 Q232 410 218 560 L196 560 L196 300 Z" fill="#0E1013" opacity=".13" filter="url(#soft)"/>
      <path d="M394 300 Q368 410 382 560 L404 560 L404 300 Z" fill="#0E1013" opacity=".15" filter="url(#soft)"/>
      <ellipse cx="300" cy="152" rx="56" ry="10" fill="#0E1013" opacity=".08" filter="url(#soft)"/>
      <path d="M262 360 Q276 450 266 552" stroke="#0E1013" stroke-width="9" fill="none"
            opacity=".045" filter="url(#soft)"/>
      <path d="M342 372 Q332 460 342 552" stroke="#0E1013" stroke-width="8" fill="none"
            opacity=".04" filter="url(#soft)"/>
      <rect x="0" y="0" width="600" height="620" filter="url(#weave)" opacity=".035"/>
    </g>`;
}

/* Collar rib, coloured from the same custom properties as the cloth so it
   tracks every swatch. `dip` is how far the neckline drops — the one number
   that separates a front view from a back view. */
function collar(dip) {
  return `
    <path d="M232 106 Q300 ${dip} 368 106 Q300 ${dip - 28} 232 106 Z" fill="url(#neckIn)"/>
    <path d="M232 106 Q300 ${dip} 368 106" style="stroke:var(--rib, #E9ECEE)" stroke-width="9"
          fill="none" stroke-linecap="round"/>
    <path d="M232 106 Q300 ${dip} 368 106" style="stroke:var(--rib-edge, #BFC5CB)" stroke-width="1.6" fill="none"/>`;
}

/* ------------------------------------------------------------- the shapes --
   `details` is drawn over the cloth but under the outline: pockets, plackets,
   drawstrings, reflective striping. Anything that is part of the garment
   rather than part of the customer's design. */
const GARMENT_SHAPES = {

  tshirtFront: {
    outline: TEE_FRONT,
    collarDip: 166,
    details: `
      <path d="M208 534 Q300 543 392 534" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M168 306 Q186 314 200 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M432 306 Q414 314 400 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>`
  },

  tshirtBack: {
    outline: TEE_BACK,
    collarDip: 130,
    details: `
      <path d="M208 534 Q300 543 392 534" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M168 306 Q186 314 200 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M432 306 Q414 314 400 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M262 128 Q300 140 338 128" stroke="#C9CED3" stroke-width="1.8" fill="none" opacity=".7"/>`
  },

  /* The hood is drawn as a raised mass sitting behind the shoulders and
     rising well above the collar line — at tee-collar scale it just reads as
     a thick neckband, which is what made the first pass indistinguishable
     from a t-shirt. */
  hoodieFront: {
    outline: HOODIE_FRONT,
    collarDip: 172,
    hood: `
      <path d="M214 132 C206 78 250 44 300 44 C350 44 394 78 386 132
               C368 106 336 92 300 92 C264 92 232 106 214 132 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M226 122 C238 96 266 82 300 82 C334 82 362 96 374 122"
            stroke="#0E1013" stroke-width="1.5" fill="none" opacity=".2"/>`,
    details: `
      <path d="M272 176 L266 256" stroke="#C9CED3" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M328 176 L334 256" stroke="#C9CED3" stroke-width="5.5" stroke-linecap="round"/>
      <circle cx="266" cy="260" r="5" fill="#C9CED3"/>
      <circle cx="334" cy="260" r="5" fill="#C9CED3"/>
      <path d="M232 404 L368 404 L360 476 L240 476 Z"
            fill="#0E1013" opacity=".05"/>
      <path d="M232 404 L368 404 L360 476 L240 476 Z"
            fill="none" stroke="#C9CED3" stroke-width="2.4"/>
      <path d="M198 542 Q300 552 402 542" stroke="#C9CED3" stroke-width="3.5" fill="none"/>`
  },

  hoodieBack: {
    outline: HOODIE_BACK,
    collarDip: 140,
    hood: `
      <path d="M212 138 C202 76 250 40 300 40 C350 40 398 76 388 138
               C384 118 372 104 356 100 L244 100 C228 104 216 118 212 138 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M244 100 Q300 122 356 100" stroke="#0E1013" stroke-width="1.5"
            fill="none" opacity=".18"/>`,
    details: `
      <path d="M198 542 Q300 552 402 542" stroke="#C9CED3" stroke-width="3.5" fill="none"/>`
  },

  poloFront: {
    outline: POLO_FRONT,
    collarDip: 158,
    details: `
      <path d="M262 124 L300 176 L338 124 L352 132 L300 196 L248 132 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M290 176 L290 268 L310 268 L310 176" fill="none" stroke="#C9CED3" stroke-width="2.2"/>
      <circle cx="300" cy="200" r="3.6" fill="#C9CED3"/>
      <circle cx="300" cy="238" r="3.6" fill="#C9CED3"/>
      <path d="M213 530 Q300 539 387 530" stroke="#C9CED3" stroke-width="2.2" fill="none"/>`
  },

  poloBack: {
    outline: POLO_BACK,
    collarDip: 132,
    details: `
      <path d="M252 118 Q300 146 348 118 L352 130 Q300 160 248 130 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M213 530 Q300 539 387 530" stroke="#C9CED3" stroke-width="2.2" fill="none"/>`
  },

  /* Hi-vis is the one garment whose own colour is not the customer's choice —
     the fluorescent ground and the reflective striping are what make it a
     safety garment. Striping is drawn deliberately clear of the print area so
     artwork never lands on top of it. */
  /* Reflective striping is silver-grey and deliberately kept clear of the
     print area — artwork printed over a reflective band does not survive and
     defeats the point of the garment. */
  hivisFront: {
    outline: VEST_FRONT,
    collarDip: 160,
    sleeveless: true,
    details: `
      <g clip-path="url(#clip-hivisFront)">
        <path d="M211 388 L389 388" stroke="#D6DADD" stroke-width="20" opacity=".97"/>
        <path d="M211 388 L389 388" stroke="#9AA0A6" stroke-width="1.2" opacity=".55"/>
        <path d="M211 452 L389 452" stroke="#D6DADD" stroke-width="20" opacity=".97"/>
        <path d="M211 452 L389 452" stroke="#9AA0A6" stroke-width="1.2" opacity=".55"/>
        <path d="M256 233 L256 540" stroke="#D6DADD" stroke-width="17" opacity=".97"/>
        <path d="M344 233 L344 540" stroke="#D6DADD" stroke-width="17" opacity=".97"/>
      </g>
      <path d="M300 168 L300 540" stroke="#0E1013" stroke-width="1.6" opacity=".3"/>
      <circle cx="300" cy="300" r="4" fill="#0E1013" opacity=".22"/>
      <circle cx="300" cy="360" r="4" fill="#0E1013" opacity=".22"/>`
  },

  hivisBack: {
    outline: VEST_BACK,
    collarDip: 134,
    sleeveless: true,
    details: `
      <g clip-path="url(#clip-hivisBack)">
        <path d="M211 388 L389 388" stroke="#D6DADD" stroke-width="20" opacity=".97"/>
        <path d="M211 452 L389 452" stroke="#D6DADD" stroke-width="20" opacity=".97"/>
        <path d="M256 233 L256 540" stroke="#D6DADD" stroke-width="17" opacity=".97"/>
        <path d="M344 233 L344 540" stroke="#D6DADD" stroke-width="17" opacity=".97"/>
      </g>`
  },

  uniformFront: {
    outline: UNIFORM_FRONT,
    collarDip: 156,
    details: `
      <path d="M258 120 L300 172 L342 120 L358 130 L300 194 L242 130 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M300 172 L300 548" stroke="#C9CED3" stroke-width="2.2"/>
      <circle cx="300" cy="230" r="3.4" fill="#C9CED3"/>
      <circle cx="300" cy="290" r="3.4" fill="#C9CED3"/>
      <circle cx="300" cy="350" r="3.4" fill="#C9CED3"/>
      <circle cx="300" cy="410" r="3.4" fill="#C9CED3"/>
      <path d="M228 232 L280 232 L280 288 L228 288 Z" fill="none" stroke="#C9CED3" stroke-width="2"/>
      <path d="M228 246 L280 246" stroke="#C9CED3" stroke-width="1.6"/>
      <path d="M215 538 Q300 547 385 538" stroke="#C9CED3" stroke-width="2.2" fill="none"/>`
  },

  uniformBack: {
    outline: UNIFORM_BACK,
    collarDip: 130,
    details: `
      <path d="M250 116 Q300 144 350 116 L356 128 Q300 158 244 128 Z"
            style="fill:var(--cloth-fill, url(#cloth-white))" stroke="#B9BFC5" stroke-width="1.8"/>
      <path d="M232 190 L368 190" stroke="#C9CED3" stroke-width="2" opacity=".8"/>
      <path d="M215 538 Q300 547 385 538" stroke="#C9CED3" stroke-width="2.2" fill="none"/>`
  }
};

/* ----------------------------------------------------------- print areas --
   Rectangles in the same 600x620 space as the garments, so the customizer can
   clip to them directly and translate a design's position into something the
   press can act on.

   These are per product AND per side because they genuinely differ: a polo
   takes a left-chest embroidery, a hoodie's front print has to clear the
   pocket, hi-vis has to clear the reflective striping. Assuming one shared
   area would put artwork somewhere it cannot actually be printed. */
const PRINT_AREAS = {
  "t-shirts": {
    front: { x: 218, y: 196, w: 164, h: 216, label: "Front print" },
    back:  { x: 212, y: 178, w: 176, h: 268, label: "Full back" }
  },
  "hoodies": {
    /* Stops above the pocket at y=400. */
    front: { x: 228, y: 208, w: 144, h: 176, label: "Front chest" },
    back:  { x: 210, y: 192, w: 180, h: 272, label: "Full back" }
  },
  "polos": {
    /* Left chest as worn, which is the viewer's right of centre. */
    front: { x: 322, y: 206, w: 92, h: 92, label: "Left chest" },
    back:  { x: 228, y: 186, w: 144, h: 168, label: "Upper back" }
  },
  "hi-vis": {
    /* Between the collar and the first reflective band. */
    front: { x: 246, y: 246, w: 108, h: 104, label: "Front panel" },
    back:  { x: 232, y: 256, w: 136, h: 104, label: "Back panel" }
  },
  "uniforms": {
    /* Wearer's left chest = viewer's right. The single patch pocket is drawn
       on the opposite side precisely so this stays clear. */
    front: { x: 316, y: 214, w: 92, h: 92, label: "Left chest" },
    back:  { x: 228, y: 196, w: 144, h: 176, label: "Upper back" }
  }
};

/* ------------------------------------------------------------- assembly --- */

/* Builds one <symbol> from a shape spec. Every garment gets the same
   treatment — ground shadow, cloth fill, shared shading, its own details,
   collar, then a containing outline — so consistency is structural rather
   than something that has to be remembered. */
function garmentSymbol(key, spec) {
  const clipId = "clip-" + key;
  return `
    <clipPath id="${clipId}"><path d="${spec.outline}"/></clipPath>
    <symbol id="garment-${key}" viewBox="0 0 600 620">
      <ellipse cx="300" cy="578" rx="140" ry="13" fill="#16181B" opacity=".17" filter="url(#ground)"/>
      ${spec.hood || ""}
      <path d="${spec.outline}" style="fill:var(--cloth-fill, url(#cloth-white))"/>
      ${sharedShading(clipId, spec.sleeveless)}
      ${spec.details || ""}
      ${collar(spec.collarDip)}
      <path d="${spec.outline}" fill="none" stroke="#B9BFC5" stroke-width="1.8"/>
    </symbol>`;
}

/* Injects every garment symbol once per page. Depends on the gradients and
   filters in SHIRT_DEFS_SVG (illustrations.js), so that goes in first —
   ensureShirtDefs() is idempotent, so calling it here is safe even when the
   page has already done it. */
function ensureGarmentDefs() {
  if (document.getElementById("garmentDefs")) return;
  if (typeof ensureShirtDefs === "function") ensureShirtDefs();

  const symbols = Object.keys(GARMENT_SHAPES)
    .map(function (k) { return garmentSymbol(k, GARMENT_SHAPES[k]); })
    .join("");

  /* Per-colour fabric gradients go in the same defs block as the symbols that
     reference them — see clothGradients() in illustrations.js for why the
     fill is swapped rather than the gradient's stops recoloured. */
  const gradients = typeof clothGradients === "function" ? clothGradients() : "";

  const holder = document.createElement("div");
  holder.innerHTML =
    '<svg id="garmentDefs" width="0" height="0" aria-hidden="true" style="position:absolute">' +
      "<defs>" + gradients + symbols + "</defs>" +
    "</svg>";
  document.body.insertBefore(holder.firstElementChild, document.body.firstChild);
}

/* The print area for a product/side, falling back to the t-shirt's so a
   half-configured product still renders something usable rather than
   throwing. */
function printAreaFor(productId, side) {
  const areas = PRINT_AREAS[productId] || PRINT_AREAS["t-shirts"];
  return areas[side] || areas.front;
}
