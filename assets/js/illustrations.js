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

  "caps": `
    <path d="M46 88a54 40 0 0 1 108 0z" fill="#fff" stroke="#16181B" stroke-width="2"/>
    <path d="M46 88h116a16 12 0 0 1-16 12H46z" fill="#F5F6F7" stroke="#16181B" stroke-width="2"/>
    <path d="M100 48v40" stroke="#C8CCD1" stroke-width="2"/>
    <circle cx="100" cy="50" r="4" fill="#16181B"/>
    <circle cx="76" cy="72" r="10" fill="#E31B23"/>`,

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
