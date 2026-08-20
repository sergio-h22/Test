/* ==========================================================================
   M-Power Print — product catalogue
   --------------------------------------------------------------------------
   This array IS the catalogue. Add, edit or delete an entry here and the
   home page, the catalogue and every product page update together.

   Fields
     id     url-safe, must be unique — it becomes product.html?id=THIS
     name   what customers call it
     cat    must match one of CATEGORIES below
     blurb  one sentence, shown on the grid card
     copy   a short paragraph, shown on the product page
     specs  rows on the product page. Add or remove freely.
     photo  file in photos/ — leave "" and a labelled slot shows instead

   Customizer fields (apparel only — see design.html)
     colors        swatches offered. Hexes live in illustrations.js.
     customizable  true puts the product in the "Design Your Own" picker
     art           { front, back } keys into GARMENT_SHAPES in garments.js
     pricing       null until real numbers exist. Never invent one — the
                   customizer shows "Quote on request" while this is null.

   Print areas live in PRINT_AREAS in garments.js, keyed by this product's id,
   because they are geometry rather than catalogue copy.

   Prices are deliberately absent. Nothing on this site quotes a number the
   shop has not given.
   ========================================================================== */

const CATEGORIES = [
  { id: "signs",    name: "Signs & Large Format" },
  { id: "print",    name: "Business Print" },
  { id: "stickers", name: "Stickers & Labels" },
  { id: "apparel",  name: "Custom Apparel" }
];

const PRODUCTS = [
  /* ---------------------------------------------------------- signs ----- */
  {
    id: "banners", name: "Vinyl Banners", cat: "signs", photo: "photos/banners.jpg",
    customizable: true,
    options: {
      sizes: ["2ft × 4ft", "3ft × 6ft", "4ft × 8ft", "Custom"],
      material: ["13oz vinyl", "18oz heavy duty", "Mesh"]
    },
    pricing: null,
    blurb: "Heavy vinyl banners for storefronts, events and job sites.",
    copy: "Printed on heavy vinyl and finished with hemmed edges and grommets so they hang flat and survive weather. Sized to whatever the space needs — grand openings, sponsorships, construction fencing, trade show backdrops.",
    specs: [["Material", "Heavy vinyl"], ["Finishing", "Hemmed edges, grommets"], ["Use", "Indoor or outdoor"], ["Artwork", "PDF, AI, EPS or SVG"]]
  },
  {
    id: "yard-signs", name: "Yard Signs", cat: "signs", photo: "photos/yard-signs.jpg",
    customizable: true,
    options: {
      sizes: ['18" × 24"', '24" × 18"', '12" × 18"'],
      material: ["4mm coroplast", "10mm coroplast"],
      sided: ["Single sided", "Double sided"]
    },
    pricing: null,
    blurb: "Coroplast signs with stakes — real estate, elections, events.",
    copy: "Lightweight corrugated plastic that stands up to sun and sprinklers. Single or double sided, with H-stakes included. The workhorse of local advertising.",
    specs: [["Material", "Coroplast"], ["Sides", "Single or double"], ["Includes", "H-stakes"], ["Artwork", "PDF, AI or SVG"]]
  },
  {
    id: "foam-boards", name: "Foam Boards", cat: "signs", photo: "photos/foam-boards.jpg",
    customizable: true,
    options: {
      sizes: ['18" × 24"', '24" × 36"', '36" × 48"'],
      material: ["3/16in foam", "1/2in foam"]
    },
    pricing: null,
    blurb: "Rigid mounted boards for presentations and displays.",
    copy: "Prints mounted to rigid foam core — clean, light and easy to stand on an easel. Good for presentations, directional signage, photo displays and event backdrops.",
    specs: [["Material", "Foam core"], ["Use", "Indoor"], ["Mounting", "Easel or wall"], ["Artwork", "PDF or high-res JPG"]]
  },
  {
    id: "window-vinyls", name: "Window Vinyls", cat: "signs", photo: "photos/window-vinyls.jpg",
    customizable: true,
    options: {
      sizes: ["Cut to size"],
      material: ["Clear", "Frosted", "Perforated", "Opaque"]
    },
    pricing: null,
    blurb: "Storefront window graphics, lettering and full wraps.",
    copy: "Cut vinyl lettering or full printed window graphics. Turns your glass into signage — hours, phone number, logo, promotions, or a full frosted privacy treatment.",
    specs: [["Type", "Cut vinyl or printed"], ["Surface", "Glass"], ["Removable", "Yes"], ["Artwork", "Vector preferred"]]
  },
  {
    id: "posters", name: "Posters", cat: "signs", photo: "photos/posters.jpg",
    customizable: true,
    options: {
      sizes: ['11" × 17"', '18" × 24"', '24" × 36"'],
      finish: ["Matte", "Gloss", "Satin"]
    },
    pricing: null,
    blurb: "Large format posters in gloss or matte.",
    copy: "Big, sharp and colour-accurate. Events, promotions, menus, wayfinding, or anything that needs to read from a distance.",
    specs: [["Finish", "Gloss or matte"], ["Use", "Indoor"], ["Artwork", "PDF, AI or high-res JPG"]]
  },
  {
    id: "signs", name: "Rigid Signs", cat: "signs", photo: "photos/signs.jpg",
    customizable: true,
    options: {
      sizes: ['12" × 18"', '18" × 24"', '24" × 36"'],
      material: ["Aluminum", "PVC", "Dibond"]
    },
    pricing: null,
    blurb: "Durable panel signs for permanent installation.",
    copy: "Rigid panel signage built to stay up. Parking and safety notices, business identification, directional signs and site boards.",
    specs: [["Use", "Indoor or outdoor"], ["Mounting", "Wall, post or frame"], ["Artwork", "Vector preferred"]]
  },

  /* ---------------------------------------------------------- print ----- */
  {
    id: "business-cards", name: "Business Cards", cat: "print", photo: "photos/business-cards.jpg",
    customizable: true,
    options: {
      sizes: ['3.5" × 2" standard'],
      finish: ["Matte", "Gloss", "Soft touch", "Uncoated"],
      sided: ["Single sided", "Double sided"]
    },
    pricing: null,
    blurb: "Gloss, matte or spot UV — the card that brought you here.",
    copy: "The card in your hand came off our press. Heavy stock, tight registration, and a choice of gloss laminate, soft matte, or spot UV where you want a raised shine against a flat ground.",
    specs: [["Finishes", "Gloss, matte, spot UV"], ["Sides", "Single or double"], ["Artwork", "PDF with bleed preferred"]]
  },
  {
    id: "flyers", name: "Flyers", cat: "print", photo: "photos/flyers.jpg",
    customizable: true,
    options: {
      sizes: ['8.5" × 11"', '5.5" × 8.5"', '4" × 6"'],
      finish: ["Matte", "Gloss", "Uncoated"],
      sided: ["Single sided", "Double sided"]
    },
    pricing: null,
    blurb: "Full colour flyers for handouts, mailers and counters.",
    copy: "Full colour both sides on your choice of stock. The cheapest way to put something physical in a lot of hands at once.",
    specs: [["Sides", "Single or double"], ["Stock", "Text or card weight"], ["Artwork", "PDF, AI or PSD"]]
  },
  {
    id: "postcards", name: "Postcards", cat: "print", photo: "photos/postcards.jpg",
    customizable: true,
    options: {
      sizes: ['4" × 6"', '5" × 7"', '6" × 9"'],
      finish: ["Matte", "Gloss", "Uncoated"],
      sided: ["Single sided", "Double sided"]
    },
    pricing: null,
    blurb: "Card stock postcards for promotions and direct mail.",
    copy: "Heavier than a flyer and built to survive the mail. Promotions, appointment reminders, save-the-dates and new-location announcements.",
    specs: [["Stock", "Card weight"], ["Finish", "Gloss or matte"], ["Mailable", "Yes"]]
  },
  {
    id: "menus", name: "Menus", cat: "print", photo: "photos/menus.jpg",
    customizable: true,
    options: {
      sizes: ['8.5" × 11"', '8.5" × 14"', '11" × 17" folded'],
      finish: ["Gloss", "Matte", "Laminated"]
    },
    pricing: null,
    blurb: "Single sheet or folded menus, wipeable finishes available.",
    copy: "Printed to survive service. Single sheet, folded, or laminated so they can be wiped down between customers.",
    specs: [["Formats", "Flat or folded"], ["Finish", "Gloss, matte or laminated"], ["Artwork", "PDF preferred"]]
  },
  {
    id: "letterhead", name: "Letterhead", cat: "print", photo: "photos/letterhead.jpg",
    customizable: true,
    options: {
      sizes: ['8.5" × 11"'],
      material: ["Bond", "Premium"]
    },
    pricing: null,
    blurb: "Branded letterhead on quality stock.",
    copy: "Your logo and details on proper paper. Quotes, invoices and letters that look like they came from an established business.",
    specs: [["Stock", "Bond or premium"], ["Sides", "Single"], ["Artwork", "PDF or AI"]]
  },
  {
    id: "envelopes", name: "Envelopes", cat: "print", photo: "photos/envelopes.jpg",
    customizable: true,
    options: {
      sizes: ["#10 business", "A2", "9in × 12in"],
      material: ["Standard", "Windowed"]
    },
    pricing: null,
    blurb: "Printed envelopes to match your letterhead.",
    copy: "Branded envelopes in standard business sizes, printed to match your letterhead so the whole set arrives looking deliberate.",
    specs: [["Sizes", "Standard business"], ["Windowed", "Available"], ["Artwork", "PDF or AI"]]
  },
  {
    id: "catalogs", name: "Catalogs", cat: "print", photo: "photos/catalogs.jpg",
    customizable: true,
    options: {
      sizes: ['8.5" × 11"', '5.5" × 8.5"'],
      finish: ["Saddle stitch"]
    },
    pricing: null,
    blurb: "Multi-page booklets, saddle stitched.",
    copy: "Multi-page booklets bound and trimmed. Product ranges, programmes, lookbooks and service guides.",
    specs: [["Binding", "Saddle stitch"], ["Pages", "Multiples of 4"], ["Artwork", "Print-ready PDF"]]
  },

  /* ------------------------------------------------------- stickers ----- */
  {
    id: "stickers", name: "Stickers", cat: "stickers", photo: "photos/stickers.jpg",
    customizable: true,
    options: {
      sizes: ['2" × 2"', '3" × 3"', '4" × 4"', "Custom die-cut"],
      material: ["Indoor", "Weatherproof"]
    },
    pricing: null,
    blurb: "Die-cut to your shape, indoor or weatherproof.",
    copy: "Cut to the outline of your artwork rather than a rectangle. Weatherproof stock available for anything going on a truck, a laptop or a hard hat.",
    specs: [["Cut", "Die-cut to shape"], ["Stock", "Indoor or weatherproof"], ["Artwork", "Vector preferred"]]
  },
  {
    id: "labels", name: "Labels", cat: "stickers", photo: "photos/labels.jpg",
    customizable: true,
    options: {
      sizes: ['2" × 3"', '3" × 4"', "Custom"],
      material: ["Sheets", "Rolls"],
      finish: ["Gloss", "Matte"]
    },
    pricing: null,
    blurb: "Product and packaging labels, sheets or rolls.",
    copy: "Product labels, packaging seals, jar and bottle wraps. Supplied on sheets or rolls depending on how you apply them.",
    specs: [["Format", "Sheets or rolls"], ["Finish", "Gloss or matte"], ["Artwork", "Vector preferred"]]
  },
  {
    id: "magnets", name: "Magnets", cat: "stickers", photo: "photos/magnets.jpg",
    customizable: true,
    options: {
      sizes: ['12" × 6" vehicle', '4" × 6"', '3" × 3"'],
      material: ["Vehicle grade", "Promotional"]
    },
    pricing: null,
    blurb: "Vehicle and fridge magnets that come off clean.",
    copy: "Vehicle door magnets that turn any car into a work vehicle and come off when you need it back, plus promotional fridge magnets that keep your number in the kitchen.",
    specs: [["Use", "Vehicle or promotional"], ["Removable", "Yes"], ["Artwork", "Vector preferred"]]
  },

  /* -------------------------------------------------------- apparel ----- */
  {
    id: "t-shirts", name: "T-Shirts", cat: "apparel", photo: "photos/t-shirts.jpg",
    blurb: "Custom printed tees for crews, teams and events.",
    copy: "Your logo or artwork on shirts for staff, teams, events and merch. Full colour artwork and photographs handled as easily as a single-colour logo.",
    specs: [["Sizes", "Youth through 5XL"], ["Placement", "Front, back, sleeve"], ["Artwork", "High-res PNG, AI or SVG"]],
    colors: ["White", "Black", "Red", "Navy", "Heather Grey"],
    customizable: true,
    art: { front: "tshirtFront", back: "tshirtBack" },
    pricing: null
  },
  {
    id: "long-sleeve", name: "Long Sleeve Tees", cat: "apparel", photo: "",
    blurb: "Long sleeve tees for cooler days, printed front and back.",
    copy: "The same heavyweight cotton as our tees with full-length sleeves. Prints on the chest and across the back, and the sleeves can carry a small hit as well.",
    specs: [["Material", "Heavyweight cotton"], ["Sides", "Front and back"], ["Sizes", "S to 3XL"], ["Artwork", "Vector or high-res raster"]],
    colors: ["White", "Black", "Red", "Navy", "Heather Grey"],
    customizable: true,
    art: { front: "longsleeveFront", back: "longsleeveBack" },
    pricing: null
  },
  {
    id: "hoodies", name: "Hoodies & Sweatshirts", cat: "apparel", photo: "photos/hoodies.jpg",
    blurb: "Pullovers and zip hoodies, printed or embroidered.",
    copy: "Heavier pieces for cold mornings on site and for merch people actually keep. Printed or embroidered depending on the look you want.",
    specs: [["Styles", "Pullover or full zip"], ["Decoration", "Print or embroidery"], ["Artwork", "High-res PNG, AI or SVG"]],
    colors: ["White", "Black", "Red", "Navy", "Heather Grey"],
    customizable: true,
    art: { front: "hoodieFront", back: "hoodieBack" },
    pricing: null
  },
  {
    id: "polos", name: "Polos", cat: "apparel", photo: "photos/polos.jpg",
    blurb: "Embroidered polos for staff and business wear.",
    copy: "The default staff shirt. Embroidered left chest logo reads as more permanent and more professional than a print, and survives commercial washing.",
    specs: [["Decoration", "Embroidery"], ["Placement", "Left chest standard"], ["Artwork", "Vector for embroidery"]],
    colors: ["White", "Black", "Red", "Navy", "Heather Grey"],
    customizable: true,
    art: { front: "poloFront", back: "poloBack" },
    pricing: null
  },
  {
    id: "hi-vis", name: "Hi-Vis & Workwear", cat: "apparel", photo: "photos/hi-vis.jpg",
    blurb: "Safety vests and jackets with your company branding.",
    copy: "Hi-vis vests and jackets branded with your company name so a crew reads as a crew on site. Reflective striping kept clear of the print area.",
    specs: [["Use", "Job site"], ["Decoration", "Print or embroidery"], ["Artwork", "Vector preferred"]],
    /* Safety garments come in safety colours — offering navy or white here
       would let someone configure a vest that is not a hi-vis vest. */
    colors: ["Hi-Vis Yellow", "Hi-Vis Orange"],
    customizable: true,
    art: { front: "hivisFront", back: "hivisBack" },
    pricing: null
  },
  {
    id: "uniforms", name: "Uniforms", cat: "apparel", photo: "photos/uniforms.jpg",
    blurb: "Full staff uniform programmes, names and numbers.",
    copy: "Kitting out a whole team, including individual names and numbers. Set the artwork up once and reorder as staff change.",
    specs: [["Personalisation", "Names and numbers"], ["Reorders", "Artwork kept on file"], ["Artwork", "Vector preferred"]],
    colors: ["White", "Black", "Red", "Navy", "Heather Grey"],
    customizable: true,
    art: { front: "uniformFront", back: "uniformBack" },
    pricing: null
  }
];

/* ==========================================================================
   Portfolio — finished work
   --------------------------------------------------------------------------
   Photographs of real jobs. Empty on purpose: nothing here is invented, and
   a print shop's portfolio has to be its own work or it is worth nothing.

   The section on the home page stays hidden entirely while this array is
   empty — no placeholder grid, no "coming soon". Add one entry and the
   section appears by itself.

   Each entry:
     photo    file in photos/, e.g. "photos/work-acme-tees.jpg"
     title    what it was, e.g. "Acme Plumbing — crew tees"
     cat      one of: apparel, signs, print, stickers  (matches CATEGORIES)
     blurb    one short line. Optional.
     before   optional second photo of the blank/unprinted item. Supply this
              and the card becomes a drag-to-compare before/after, the way
              the home page shirt already works. Shoot both from the same
              spot or the effect breaks.

   Do not put photos of garments carrying another company's logo here unless
   that company is your customer and has agreed to it.
   ========================================================================== */
const PORTFOLIO = [
  /* Example of the shape — delete this comment and add real entries:
  {
    photo: "photos/work-acme-tees.jpg",
    before: "",
    title: "Acme Plumbing — crew tees",
    cat: "apparel",
    blurb: "24 shirts, one-colour front and back."
  },
  */
];
