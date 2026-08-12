/* ==========================================================================
   M-Power Print — product illustrations
   --------------------------------------------------------------------------
   One drawing per product, used wherever a real photo has not been supplied.
   They are vector, so they stay sharp at any size and cost almost nothing to
   load.

   These are a stand-in, not a replacement for photography. The moment a
   product gets a `photo` in products.js, the photo wins and the drawing
   stops being used for it. Delete nothing — an entry left here simply goes
   unused.

   Drawing system, so additions stay consistent:
     viewBox   0 0 200 150
     ink       #16181B  outlines, stroke-width 2
     paper     #FFFFFF  fills for stock and fabric
     red       #E31B23  exactly one accent per drawing
     grey      #C8CCD1  secondary marks, ground lines
   ========================================================================== */

/* ==========================================================================
   Shared shirt symbol
   --------------------------------------------------------------------------
   The garment used by the home-page before/after slider and the apparel
   colour customizer on product.html — defined once here so both pages draw
   from the same artwork instead of two copies drifting apart.

   Colour lives entirely in CSS custom properties (--cloth-0…--cloth-5 for
   the fabric gradient, --rib and --rib-edge for the collar). The defaults
   below render white; GARMENT_COLORS holds the full palette for every other
   swatch. Custom properties cross into an SVG <use> shadow tree normally, so
   scoping an override to one container recolors only that instance — the
   home page's two panes stay white while a product page can independently
   show any picked colour.
   ========================================================================== */
const SHIRT_DEFS_SVG = `
<svg width="0" height="0" aria-hidden="true" style="position:absolute">
  <defs>
    <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   style="stop-color:var(--cloth-0, #C6CBD0)"/>
      <stop offset="11%"  style="stop-color:var(--cloth-1, #E9ECEE)"/>
      <stop offset="34%"  style="stop-color:var(--cloth-2, #FBFCFC)"/>
      <stop offset="60%"  style="stop-color:var(--cloth-3, #F6F8F8)"/>
      <stop offset="86%"  style="stop-color:var(--cloth-4, #DDE1E4)"/>
      <stop offset="100%" style="stop-color:var(--cloth-5, #C1C7CC)"/>
    </linearGradient>
    <linearGradient id="clothV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
      <stop offset="62%"  stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".10"/>
    </linearGradient>
    <radialGradient id="neckIn" cx="50%" cy="35%" r="70%">
      <stop offset="0%"   stop-color="#8A9096"/>
      <stop offset="100%" stop-color="#5E646A"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="ground" x="-40%" y="-120%" width="180%" height="340%">
      <feGaussianBlur stdDeviation="11"/>
    </filter>
    <filter id="weave">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
    </filter>

    <clipPath id="shirtClip">
      <path d="M232 106 C214 114 196 124 182 136 L120 250 C114 262 118 276 128 286
               L170 316 C182 324 196 318 202 306 L216 272 C210 298 208 328 208 358
               L206 538 C206 550 214 558 226 558 L374 558 C386 558 394 550 394 538
               L392 358 C392 328 390 298 384 272 L398 306 C404 318 418 324 430 316
               L472 286 C482 276 486 262 480 250 L418 136 C404 124 386 114 368 106 Q300 166 232 106 Z"/>
    </clipPath>

    <symbol id="shirtArt" viewBox="0 0 600 620">
      <ellipse cx="300" cy="572" rx="138" ry="13" fill="#16181B" opacity=".17" filter="url(#ground)"/>

      <path d="M232 106 C214 114 196 124 182 136 L120 250 C114 262 118 276 128 286
               L170 316 C182 324 196 318 202 306 L216 272 C210 298 208 328 208 358
               L206 538 C206 550 214 558 226 558 L374 558 C386 558 394 550 394 538
               L392 358 C392 328 390 298 384 272 L398 306 C404 318 418 324 430 316
               L472 286 C482 276 486 262 480 250 L418 136 C404 124 386 114 368 106 Q300 166 232 106 Z"
            fill="url(#cloth)"/>

      <g clip-path="url(#shirtClip)">
        <rect x="0" y="0" width="600" height="620" fill="url(#clothV)"/>
        <ellipse cx="222" cy="286" rx="26" ry="15" fill="#0E1013" opacity=".11" filter="url(#soft)"/>
        <ellipse cx="378" cy="286" rx="26" ry="15" fill="#0E1013" opacity=".12" filter="url(#soft)"/>
        <path d="M206 300 Q232 410 218 560 L196 560 L196 300 Z" fill="#0E1013" opacity=".13" filter="url(#soft)"/>
        <path d="M394 300 Q368 410 382 560 L404 560 L404 300 Z" fill="#0E1013" opacity=".15" filter="url(#soft)"/>
        <ellipse cx="300" cy="152" rx="56" ry="10" fill="#0E1013" opacity=".08" filter="url(#soft)"/>
        <path d="M262 360 Q276 450 266 552" stroke="#0E1013" stroke-width="9" fill="none"
              opacity=".045" filter="url(#soft)"/>
        <path d="M342 372 Q332 460 342 552" stroke="#0E1013" stroke-width="8" fill="none"
              opacity=".04" filter="url(#soft)"/>
        <path d="M150 268 Q168 296 190 306" stroke="#0E1013" stroke-width="13" fill="none"
              opacity=".07" filter="url(#soft)"/>
        <path d="M450 268 Q432 296 410 306" stroke="#0E1013" stroke-width="13" fill="none"
              opacity=".08" filter="url(#soft)"/>
        <rect x="0" y="0" width="600" height="620" filter="url(#weave)" opacity=".035"/>
      </g>

      <path d="M208 534 Q300 543 392 534" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M168 306 Q186 314 200 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>
      <path d="M432 306 Q414 314 400 298" stroke="#C9CED3" stroke-width="2.2" fill="none"/>

      <path d="M232 106 Q300 166 368 106 Q300 138 232 106 Z" fill="url(#neckIn)"/>
      <path d="M232 106 Q300 166 368 106" style="stroke:var(--rib, #E9ECEE)" stroke-width="9"
            fill="none" stroke-linecap="round"/>
      <path d="M232 106 Q300 166 368 106" style="stroke:var(--rib-edge, #BFC5CB)" stroke-width="1.6" fill="none"/>
      <path d="M239 104 Q300 156 361 104" stroke="#fff" stroke-width="2.4"
            fill="none" opacity=".75"/>

      <path d="M232 106 C214 114 196 124 182 136 L120 250 C114 262 118 276 128 286
               L170 316 C182 324 196 318 202 306 L216 272 C210 298 208 328 208 358
               L206 538 C206 550 214 558 226 558 L374 558 C386 558 394 550 394 538
               L392 358 C392 328 390 298 384 272 L398 306 C404 318 418 324 430 316
               L472 286 C482 276 486 262 480 250 L418 136 C404 124 386 114 368 106 Q300 166 232 106 Z"
            fill="none" stroke="#B9BFC5" stroke-width="1.8"/>
    </symbol>
  </defs>
</svg>`;

/* Fabric palette per swatch — six cloth-gradient stops plus two rib-collar
   tones, chosen to keep the same highlight/shadow shape as the white
   default so every colour reads as the same shirt, just recoloured. */
const GARMENT_COLORS = {
  "White":        { cloth: ["#C6CBD0", "#E9ECEE", "#FBFCFC", "#F6F8F8", "#DDE1E4", "#C1C7CC"], rib: "#E9ECEE", ribEdge: "#BFC5CB" },
  "Black":        { cloth: ["#1A1B1E", "#2E3033", "#45474B", "#3A3C40", "#232427", "#141517"], rib: "#2A2C2F", ribEdge: "#17181A" },
  "Red":          { cloth: ["#9E1017", "#C41822", "#E8404A", "#DD323C", "#B41520", "#7E0D13"], rib: "#B21821", ribEdge: "#7E0D13" },
  "Navy":         { cloth: ["#10182A", "#1C2740", "#33456B", "#2A3A5C", "#182238", "#0B111F"], rib: "#202C46", ribEdge: "#0F1526" },
  "Heather Grey": { cloth: ["#7B7F84", "#96999D", "#B7BABD", "#ACAFB2", "#8C8F93", "#6E7175"], rib: "#999C9F", ribEdge: "#6C6F72" },

  /* Safety colours. A hi-vis garment's colour is a compliance property, not a
     styling choice, so these are offered only on hi-vis and the ordinary
     apparel swatches are not. */
  "Hi-Vis Yellow": { cloth: ["#B8C41A", "#D6E020", "#EDF64A", "#E4EE33", "#C7D31D", "#A3AE14"], rib: "#C7D31D", ribEdge: "#95A012" },
  "Hi-Vis Orange": { cloth: ["#C4560F", "#E06714", "#F68A34", "#EE7A22", "#D35F11", "#A6470B"], rib: "#D35F11", ribEdge: "#96410A" }
};

/* A single flat hex per swatch, for the little color-picker dots themselves
   — the fabric gradient above is for the garment, this is just "what color
   is this button." */
const SWATCH_HEX = {
  "White": "#F4F5F6", "Black": "#1A1B1E", "Red": "#C41822",
  "Navy": "#1C2740", "Heather Grey": "#9A9DA1",
  "Hi-Vis Yellow": "#DDE822", "Hi-Vis Orange": "#EE7A22"
};

/* A url-safe id fragment for a colour name: "Hi-Vis Yellow" → "hi-vis-yellow". */
function colorSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ------------------------------------------------------- per-colour fills --
   One <linearGradient> per swatch, so a garment's fabric can be recoloured by
   pointing its fill at a different gradient.

   Why not just drive the single #cloth gradient with custom properties, the
   way #shirtArt does? Because `fill="url(#cloth)"` resolves against the
   gradient's own location in the defs block, not against the <use> that
   instantiated the symbol. Custom properties set on an ancestor of the <use>
   reach elements inside the shadow tree (which is why the collar recolours)
   but never reach the gradient's <stop>s. That limits the whole page to one
   fabric colour at a time — fine for a single product page, fatal for a
   customizer that has to draw colour swatches of the same garment.

   Pointing `fill` at a per-colour gradient sidesteps it entirely: the fill
   value itself is what varies, carried in --cloth-fill, and any number of
   garments can show different colours simultaneously. */
function clothGradients() {
  return Object.keys(GARMENT_COLORS).map(function (name) {
    const g = GARMENT_COLORS[name];
    const offs = ["0%", "11%", "34%", "60%", "86%", "100%"];
    return '<linearGradient id="cloth-' + colorSlug(name) + '" x1="0" y1="0" x2="1" y2="0">' +
      g.cloth.map(function (hex, i) {
        return '<stop offset="' + offs[i] + '" stop-color="' + hex + '"/>';
      }).join("") +
    "</linearGradient>";
  }).join("");
}

/* Recolours every garment inside `el` — and only inside `el`. Sets the fabric
   fill reference plus the collar-rib tones, all of which do cascade into the
   <use> shadow tree.

   Still sets --cloth-0…5 as well, so the older #shirtArt symbol used by the
   home page's before/after slider keeps working unchanged. */
function applyGarmentColor(el, colorName) {
  const name = GARMENT_COLORS[colorName] ? colorName : "White";
  const g = GARMENT_COLORS[name];
  g.cloth.forEach(function (hex, i) { el.style.setProperty("--cloth-" + i, hex); });
  el.style.setProperty("--cloth-fill", "url(#cloth-" + colorSlug(name) + ")");
  el.style.setProperty("--rib", g.rib);
  el.style.setProperty("--rib-edge", g.ribEdge);
}

/* Injects SHIRT_DEFS_SVG once per page, however many previews use it. */
function ensureShirtDefs() {
  if (document.getElementById("shirtArt")) return;
  const holder = document.createElement("div");
  holder.innerHTML = SHIRT_DEFS_SVG;
  document.body.insertBefore(holder.firstElementChild, document.body.firstChild);
}

const ILLUSTRATIONS = {

  /* ------------------------------------------------------ signs --------- */
  "banners": `
    <path d="M12 26h176" stroke="#16181B" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 26v8M174 26v8" stroke="#16181B" stroke-width="2"/>
    <rect x="26" y="34" width="148" height="76" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <circle cx="34" cy="42" r="2.6" fill="#16181B"/><circle cx="166" cy="42" r="2.6" fill="#16181B"/>
    <circle cx="34" cy="102" r="2.6" fill="#16181B"/><circle cx="166" cy="102" r="2.6" fill="#16181B"/>
    <rect x="46" y="54" width="72" height="11" fill="#E31B23"/>
    <rect x="46" y="73" width="108" height="6" fill="#C8CCD1"/>
    <rect x="46" y="85" width="80" height="6" fill="#C8CCD1"/>`,

  "yard-signs": `
    <path d="M64 96v34M136 96v34" stroke="#16181B" stroke-width="3"/>
    <rect x="34" y="28" width="132" height="68" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <rect x="50" y="46" width="62" height="12" fill="#E31B23"/>
    <rect x="50" y="66" width="94" height="6" fill="#C8CCD1"/>
    <path d="M18 130h164" stroke="#C8CCD1" stroke-width="3" stroke-linecap="round"/>`,

  "foam-boards": `
    <path d="M62 118 78 44M138 118 122 44" stroke="#16181B" stroke-width="2.5"/>
    <path d="M100 46v76" stroke="#16181B" stroke-width="2.5"/>
    <rect x="46" y="26" width="108" height="70" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <circle cx="74" cy="52" r="9" fill="#E31B23"/>
    <path d="M60 84h84" stroke="#C8CCD1" stroke-width="6"/>
    <path d="M22 122h156" stroke="#C8CCD1" stroke-width="3" stroke-linecap="round"/>`,

  "window-vinyls": `
    <rect x="26" y="20" width="148" height="106" fill="#fff" stroke="#16181B" stroke-width="2.5"/>
    <path d="M100 20v106M26 73h148" stroke="#C8CCD1" stroke-width="2"/>
    <rect x="42" y="38" width="52" height="10" fill="#E31B23"/>
    <rect x="42" y="54" width="40" height="5" fill="#C8CCD1"/>
    <rect x="112" y="88" width="46" height="5" fill="#C8CCD1"/>
    <rect x="112" y="98" width="30" height="5" fill="#C8CCD1"/>`,

  "posters": `
    <rect x="52" y="18" width="96" height="114" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <circle cx="100" cy="24" r="3.4" fill="#16181B"/>
    <rect x="66" y="40" width="68" height="34" fill="#E31B23"/>
    <rect x="66" y="84" width="68" height="6" fill="#C8CCD1"/>
    <rect x="66" y="96" width="46" height="6" fill="#C8CCD1"/>
    <rect x="66" y="112" width="30" height="6" fill="#16181B"/>`,

  "signs": `
    <path d="M70 92v38M130 92v38" stroke="#16181B" stroke-width="4"/>
    <rect x="28" y="30" width="144" height="62" rx="3" fill="#fff" stroke="#16181B" stroke-width="2.5"/>
    <rect x="44" y="46" width="14" height="30" fill="#E31B23"/>
    <rect x="66" y="50" width="86" height="8" fill="#C8CCD1"/>
    <rect x="66" y="64" width="60" height="8" fill="#C8CCD1"/>`,

  /* ------------------------------------------------------ print --------- */
  "business-cards": `
    <rect x="30" y="66" width="104" height="60" rx="3" fill="#fff" stroke="#16181B" stroke-width="2" transform="rotate(-8 82 96)"/>
    <rect x="66" y="34" width="104" height="60" rx="3" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <rect x="80" y="48" width="34" height="10" fill="#E31B23"/>
    <rect x="80" y="66" width="62" height="5" fill="#C8CCD1"/>
    <rect x="80" y="76" width="46" height="5" fill="#C8CCD1"/>`,

  "flyers": `
    <rect x="44" y="16" width="112" height="118" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <rect x="60" y="32" width="80" height="30" fill="#E31B23"/>
    <rect x="60" y="72" width="80" height="5" fill="#C8CCD1"/>
    <rect x="60" y="84" width="80" height="5" fill="#C8CCD1"/>
    <rect x="60" y="96" width="56" height="5" fill="#C8CCD1"/>
    <rect x="60" y="112" width="36" height="8" fill="#16181B"/>`,

  "postcards": `
    <rect x="24" y="34" width="152" height="84" rx="3" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M100 34v84" stroke="#C8CCD1" stroke-width="2"/>
    <rect x="146" y="46" width="18" height="20" fill="#E31B23"/>
    <rect x="112" y="80" width="52" height="4" fill="#C8CCD1"/>
    <rect x="112" y="90" width="40" height="4" fill="#C8CCD1"/>
    <rect x="38" y="52" width="48" height="34" fill="#C8CCD1" opacity=".55"/>`,

  "menus": `
    <path d="M100 22 44 34v96l56-10z" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M100 22l56 12v96l-56-10z" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <rect x="58" y="52" width="30" height="8" fill="#E31B23"/>
    <rect x="58" y="70" width="30" height="4" fill="#C8CCD1"/>
    <rect x="58" y="80" width="24" height="4" fill="#C8CCD1"/>
    <rect x="112" y="56" width="30" height="4" fill="#C8CCD1"/>
    <rect x="112" y="66" width="24" height="4" fill="#C8CCD1"/>`,

  "letterhead": `
    <rect x="52" y="14" width="96" height="122" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <rect x="52" y="14" width="96" height="18" fill="#E31B23"/>
    <rect x="66" y="48" width="44" height="5" fill="#16181B"/>
    <rect x="66" y="64" width="68" height="4" fill="#C8CCD1"/>
    <rect x="66" y="74" width="68" height="4" fill="#C8CCD1"/>
    <rect x="66" y="84" width="52" height="4" fill="#C8CCD1"/>
    <rect x="66" y="106" width="30" height="4" fill="#C8CCD1"/>`,

  "envelopes": `
    <rect x="24" y="38" width="152" height="80" rx="2" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M24 40l76 46 76-46" fill="none" stroke="#16181B" stroke-width="2"/>
    <rect x="128" y="52" width="30" height="4" fill="#C8CCD1"/>
    <circle cx="150" cy="100" r="9" fill="#E31B23"/>`,

  "catalogs": `
    <path d="M100 30 40 42v88l60-12z" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M100 30l60 12v88l-60-12z" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <path d="M100 30v88" stroke="#16181B" stroke-width="2"/>
    <path d="M96 52h8M96 74h8M96 96h8" stroke="#16181B" stroke-width="3"/>
    <rect x="54" y="58" width="32" height="18" fill="#E31B23"/>
    <rect x="54" y="86" width="32" height="4" fill="#C8CCD1"/>
    <rect x="116" y="62" width="30" height="4" fill="#C8CCD1"/>
    <rect x="116" y="72" width="24" height="4" fill="#C8CCD1"/>`,

  /* --------------------------------------------------- stickers --------- */
  "stickers": `
    <path d="M62 26h64a14 14 0 0 1 14 14v52l-30 30H62a14 14 0 0 1-14-14V40a14 14 0 0 1 14-14z"
          fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M140 92h-18a12 12 0 0 0-12 12v18" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <circle cx="94" cy="62" r="18" fill="#E31B23"/>
    <rect x="70" y="92" width="34" height="5" fill="#C8CCD1"/>`,

  "labels": `
    <path d="M72 20h56v110H72z" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <path d="M64 44h72v62H64z" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <rect x="78" y="58" width="44" height="10" fill="#E31B23"/>
    <rect x="78" y="76" width="44" height="4" fill="#C8CCD1"/>
    <rect x="78" y="86" width="30" height="4" fill="#C8CCD1"/>
    <path d="M72 20c-10 4-10 10 0 14M128 20c10 4 10 10 0 14" fill="none" stroke="#C8CCD1" stroke-width="2"/>`,

  "magnets": `
    <path d="M34 52h108l22 26v34H34z" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M96 52v26h68" fill="none" stroke="#C8CCD1" stroke-width="2"/>
    <circle cx="66" cy="112" r="12" fill="none" stroke="#16181B" stroke-width="2.5"/>
    <circle cx="136" cy="112" r="12" fill="none" stroke="#16181B" stroke-width="2.5"/>
    <rect x="46" y="62" width="40" height="9" fill="#E31B23"/>
    <rect x="46" y="78" width="30" height="4" fill="#C8CCD1"/>`,

  /* ---------------------------------------------------- apparel --------- */
  "t-shirts": `
    <path d="M76 24 44 40l10 26 16-6v56h60V60l16 6 10-26-32-16z"
          fill="#fff" stroke="#16181B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M76 24a24 24 0 0 0 48 0" fill="none" stroke="#16181B" stroke-width="2"/>
    <circle cx="100" cy="76" r="14" fill="#E31B23"/>`,

  "hoodies": `
    <path d="M74 30 42 46l10 28 16-6v58h64V68l16 6 10-28-32-16z"
          fill="#fff" stroke="#16181B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M74 30c6 16 46 16 52 0" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <path d="M92 44v18M108 44v18" stroke="#C8CCD1" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="78" y="92" width="44" height="20" rx="3" fill="none" stroke="#16181B" stroke-width="2"/>
    <circle cx="128" cy="74" r="9" fill="#E31B23"/>`,

  "polos": `
    <path d="M78 26 46 42l10 26 16-6v56h56V62l16 6 10-26-32-16z"
          fill="#fff" stroke="#16181B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M78 26 100 46 122 26" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <path d="M100 46v22" stroke="#16181B" stroke-width="2"/>
    <circle cx="96" cy="54" r="1.8" fill="#16181B"/><circle cx="96" cy="64" r="1.8" fill="#16181B"/>
    <circle cx="128" cy="62" r="8" fill="#E31B23"/>`,

  "hi-vis": `
    <path d="M74 26 46 42v76h108V42l-28-16z" fill="#fff" stroke="#16181B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M74 26 100 50 126 26" fill="none" stroke="#16181B" stroke-width="2"/>
    <path d="M100 50v68" stroke="#16181B" stroke-width="2"/>
    <path d="M46 74h44M110 74h44" stroke="#C8CCD1" stroke-width="8"/>
    <path d="M46 92h44M110 92h44" stroke="#C8CCD1" stroke-width="4"/>
    <rect x="60" y="54" width="24" height="8" fill="#E31B23"/>`,

  "uniforms": `
    <path d="M76 24 44 40l10 26 16-6v56h60V60l16 6 10-26-32-16z"
          fill="#fff" stroke="#16181B" stroke-width="2" stroke-linejoin="round"/>
    <path d="M76 24 100 46 124 24" fill="none" stroke="#16181B" stroke-width="2"/>
    <path d="M100 46v70" stroke="#C8CCD1" stroke-width="2"/>
    <rect x="112" y="60" width="22" height="14" rx="2" fill="#E31B23"/>
    <rect x="66" y="62" width="24" height="4" fill="#C8CCD1"/>
    <rect x="66" y="72" width="18" height="4" fill="#C8CCD1"/>`
};

/* Used when a product id has no drawing of its own — keyed by category. */
const ILLUSTRATION_FALLBACK = {
  signs:    "banners",
  print:    "flyers",
  stickers: "stickers",
  apparel:  "t-shirts"
};
