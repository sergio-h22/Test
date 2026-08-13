/* ==========================================================================
   M-Power Print — shared behaviour
   Loaded by every page, after products.js.
   ========================================================================== */

/* --------------------------------------------------------------- CONFIG --
   Change these and the whole site updates. Leave a value empty ("") and its
   row disappears rather than showing a blank label.                        */
const CONFIG = {
  phone:     "(949) 228-1226",
  email:     "sales@m-powerprint.com",
  email2:    "mikey@m-powerprint.com",
  address:   "Southern California",
  instagram: "",
  hours:     ""
};

/* Hero video. 1280×720, 10s, 2.6 MB — H.264 MP4, which every current browser
   plays natively. Phones get the same file; object-fit crops it to portrait.
   Add a 9:16 cut as video/hero-mobile.mp4 and point `mobile` at it whenever
   you have one. See docs/hero-video-brief.md.                             */
const HERO_VIDEO = {
  desktop: "video/hero.mp4",
  mobile:  "video/hero.mp4",
  poster:  ""
};

/* The address the site is published at. Used for canonical URLs, the sitemap
   and structured data — change it if you deploy somewhere else. Keep the
   trailing slash. */
const SITE_URL = "https://lacamisanegra.com/";

/* The home page FAQ. Also becomes the FAQPage structured data Google reads,
   so edit here and both update together.
   TODO marks answers that need the shop's real numbers. */
const FAQ = [
  { q: "What file formats can I send?",
    a: "PDF, AI, EPS and SVG are ideal because they stay sharp at any size. High-resolution PNG, JPG and PSD are fine too. For anything die-cut or embroidered, vector artwork gives the cleanest result." },
  { q: "What if I don't have artwork?",
    a: "Tell us the idea and we will set it up for you. Plenty of jobs start as a sketch, a photo of an old sign, or a description over the phone." },
  { q: "Do I get to see it before it prints?",
    a: "Yes. Every job gets a digital proof and a firm price before anything goes to the press, and changes at that stage are free. Nothing prints until you approve it." },
  { q: "Can I collect it, or do you ship?",
    a: "Either. Collect from the shop, or we will box it and send it to you — your call when you order." },
  { q: "How long does a job take?",
    a: "TODO — replace with your real turnaround. Ask us for a date when you request the quote and we will confirm it with the proof." },
  { q: "Is there a minimum order?",
    a: "TODO — replace with your real minimums. Small runs are welcome; ask and we will tell you what is worth doing." },
  { q: "Where are you based?",
    a: "We are in Southern California and work with businesses, schools and organisations across the area. Call (949) 228-1226 or email sales@m-powerprint.com to get started." }
];

/* ---------------------------------------------------------- design ideas --
   Most people arrive knowing the occasion, not the product. These route from
   "family reunion" to the thing that actually prints it.

   Every destination is a real page: either the customizer with a product
   preselected, or a catalogue search that returns results. Nothing here
   invents a product the shop does not offer — `to` is checked against the
   catalogue at render time and an idea pointing nowhere is dropped rather
   than shown as a dead end. */
const IDEAS = [
  { label: "Business apparel",     blurb: "Staff shirts and polos with your logo.",        to: "design.html?product=polos" },
  { label: "Work uniforms",        blurb: "Kitted-out crews, names and numbers.",          to: "design.html?product=uniforms" },
  { label: "Sports teams",         blurb: "Team tees and hoodies for the season.",         to: "design.html?product=t-shirts" },
  { label: "School events",        blurb: "Spirit wear, fundraisers, field trips.",        to: "design.html?product=t-shirts" },
  { label: "Family reunions",      blurb: "Matching shirts everyone keeps.",               to: "design.html?product=t-shirts" },
  { label: "Church events",        blurb: "Shirts, banners and programmes.",               to: "products.html?q=banner" },
  { label: "Branded merch",        blurb: "Hoodies and tees people actually wear.",        to: "design.html?product=hoodies" },
  { label: "Job site gear",        blurb: "Hi-vis and workwear that reads as a crew.",     to: "design.html?product=hi-vis" },
  { label: "Grand openings",       blurb: "Banners, yard signs and flyers.",               to: "products.html?q=banner" },
  { label: "Promotional giveaways", blurb: "Stickers, magnets and labels.",                to: "products.html?q=sticker" },
  { label: "New business kit",     blurb: "Cards, letterhead and envelopes.",              to: "products.html?q=card" }
];

/* ------------------------------------------------------- recommendations --
   What a customer ordering one thing usually needs alongside it. Same-category
   "related products" misses the useful pairings: someone ordering staff polos
   is far more likely to want business cards than another style of polo.

   Every value is a product id from the catalogue above, so these can never
   point at something the shop does not print — recommendFor() drops anything
   that fails to resolve. */
const RECOMMENDS = {
  "t-shirts":       ["hoodies", "stickers", "banners"],
  "hoodies":        ["t-shirts", "polos", "stickers"],
  "polos":          ["uniforms", "business-cards", "hi-vis"],
  "hi-vis":         ["uniforms", "magnets", "yard-signs"],
  "uniforms":       ["polos", "hi-vis", "business-cards"],

  "business-cards": ["letterhead", "envelopes", "flyers"],
  "flyers":         ["postcards", "posters", "business-cards"],
  "postcards":      ["flyers", "letterhead", "stickers"],
  "menus":          ["flyers", "posters", "window-vinyls"],
  "letterhead":     ["envelopes", "business-cards", "catalogs"],
  "envelopes":      ["letterhead", "business-cards", "postcards"],
  "catalogs":       ["flyers", "posters", "business-cards"],

  "banners":        ["yard-signs", "foam-boards", "t-shirts"],
  "yard-signs":     ["banners", "magnets", "foam-boards"],
  "foam-boards":    ["posters", "banners", "signs"],
  "window-vinyls":  ["signs", "menus", "stickers"],
  "posters":        ["foam-boards", "flyers", "banners"],
  "signs":          ["window-vinyls", "banners", "yard-signs"],

  "stickers":       ["labels", "magnets", "t-shirts"],
  "labels":         ["stickers", "postcards", "catalogs"],
  "magnets":        ["stickers", "yard-signs", "business-cards"]
};

/* Resolves a product's recommendations, topping up from its own category if
   the map is short or an id has gone stale. Never returns the product itself. */
function recommendFor(p, limit) {
  const max = limit || 4;
  const seen = { };
  seen[p.id] = true;
  const out = [];

  (RECOMMENDS[p.id] || []).forEach(function (id) {
    const other = productById(id);
    if (other && !seen[id]) { seen[id] = true; out.push(other); }
  });

  /* Fall back to the same category so a product with no map entry — a newly
     added one, say — still shows something useful rather than nothing. */
  PRODUCTS.forEach(function (other) {
    if (out.length >= max) return;
    if (seen[other.id] || other.cat !== p.cat) return;
    seen[other.id] = true;
    out.push(other);
  });

  return out.slice(0, max);
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------- utilities */
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function catName(id) {
  const c = CATEGORIES.find(function (x) { return x.id === id; });
  return c ? c.name : id;
}

function productById(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

/* An image slot, in order of preference:
     1. the real photo, once products.js has one
     2. the product's illustration
     3. a labelled placeholder
   Keeping this in one place means adding photography never touches layout. */
function slot(photo, label, classes, id, cat) {
  const cls = "slot " + (classes || "");

  if (photo) {
    return '<div class="' + cls + '"><img src="' + esc(photo) + '" alt="' + esc(label) + '" loading="lazy"></div>';
  }

  const art = typeof ILLUSTRATIONS !== "undefined"
    ? (ILLUSTRATIONS[id] || ILLUSTRATIONS[ILLUSTRATION_FALLBACK[cat]])
    : null;

  if (art) {
    return '<div class="' + cls + ' slot-art">' +
             '<svg viewBox="0 0 200 150" role="img" aria-label="' + esc(label) + '">' + art + '</svg>' +
           '</div>';
  }

  return '<div class="' + cls + '"><span class="slot-label"><b>' + esc(label) + '</b>photo slot</span></div>';
}

/* ---------------------------------------------------------- contact fill */
const igHandle = CONFIG.instagram.replace(/^@/, "");
const values = {
  phone: CONFIG.phone,
  email: CONFIG.email,
  email2: CONFIG.email2,
  instagram: CONFIG.instagram,
  address: CONFIG.address,
  hours: CONFIG.hours,
  phoneHref: "tel:" + CONFIG.phone.replace(/[^\d+]/g, ""),
  emailHref: "mailto:" + CONFIG.email,
  email2Href: "mailto:" + CONFIG.email2,
  instagramHref: igHandle ? "https://instagram.com/" + igHandle : ""
};

function fillFields(root) {
  (root || document).querySelectorAll("[data-field]").forEach(function (el) {
    const key = el.dataset.field;
    const value = values[key];
    if (value) {
      if (key.endsWith("Href")) el.setAttribute("href", value);
      else el.textContent = value;
      return;
    }
    const row = el.closest(".contact-row, li");
    if (row) row.remove();
  });
}

/* ------------------------------------------------------------ nav toggle */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
  });
}

/* Header search on any page sends you to the catalogue with the query. */
function initHeaderSearch() {
  const form = document.getElementById("utilSearch");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = form.querySelector("input").value.trim();
    window.location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  });
}

/* ------------------------------------------------------------ hero video */
function initHeroVideo() {
  const layer = document.getElementById("heroVideo");
  const video = document.getElementById("heroVideoEl");
  if (!layer || !video) return;

  const src = window.matchMedia("(max-width: 700px)").matches
    ? HERO_VIDEO.mobile
    : HERO_VIDEO.desktop;

  /* Nothing configured — remove the layer so no request is made at all. */
  if (!src) { layer.remove(); return; }

  /* Don't spend someone's data plan on decoration. */
  const net = navigator.connection;
  if (net && (net.saveData || /^([23]g|slow-2g)$/.test(net.effectiveType || ""))) {
    layer.remove();
    return;
  }

  if (HERO_VIDEO.poster) video.poster = HERO_VIDEO.poster;
  video.addEventListener("error", function () { layer.remove(); });
  video.addEventListener("loadeddata", function () {
    layer.hidden = false;
    document.getElementById("hero").classList.add("has-video");
    /* Someone who asked for reduced motion gets a still frame, not a loop. */
    if (!reduced) video.play().catch(function () {});
  });

  /* Fetch only once the hero is actually on screen. Setting src at load time
     pulled megabytes down ahead of everything that matters. */
  function load() { if (!video.src) video.src = src; }

  if (!("IntersectionObserver" in window)) { load(); return; }

  /* Watch the hero section, not the video layer: the layer starts `hidden`,
     and a display:none element never reports as intersecting, so observing
     it would mean the video never loads at all. */
  const target = document.getElementById("hero") || layer;

  const io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) {
      io.disconnect();
      load();
    }
  }, { rootMargin: "200px" });
  io.observe(target);
}

/* ------------------------------------------------------- structured data */
/* Injected from CONFIG and PRODUCTS so the markup can never drift from what
   the page actually says. */
function jsonLd(obj) {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}

function business() {
  const emails = [CONFIG.email, CONFIG.email2].filter(Boolean);
  const b = {
    "@type": "LocalBusiness",
    "@id": SITE_URL + "#business",
    name: "M-Power Print",
    description: "Printing for banners, signs, business cards, flyers, stickers, labels, magnets and custom apparel.",
    url: SITE_URL,
    logo: SITE_URL + "assets/img/logo-mark.png",
    image: SITE_URL + "assets/img/og-card.png",
    telephone: CONFIG.phone,
    email: emails[0],
    priceRange: "$$",
    /* No street address is published by choice, so the service area carries
       the location signal instead. */
    areaServed: { "@type": "Place", name: CONFIG.address }
  };
  if (CONFIG.hours) b.openingHours = CONFIG.hours;
  if (values.instagramHref) b.sameAs = [values.instagramHref];
  return b;
}

function initStructuredData() {
  const page = document.body.dataset.page;

  if (page === "home") {
    jsonLd({
      "@context": "https://schema.org",
      "@graph": [
        business(),
        {
          "@type": "WebSite",
          url: SITE_URL,
          name: "M-Power Print",
          potentialAction: {
            "@type": "SearchAction",
            target: SITE_URL + "products.html?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQ.map(function (f) {
            return {
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a }
            };
          })
        }
      ]
    });
  }

  if (page === "catalog") {
    jsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "M-Power Print products",
      itemListElement: PRODUCTS.map(function (p, i) {
        return {
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: SITE_URL + "product.html?id=" + encodeURIComponent(p.id)
        };
      })
    });
  }
}

/* Product pages render from a query string, so their markup is emitted once
   the product resolves. Modelled as Service rather than Product: everything
   is quote-on-request, and a Product with no offers reports a missing price. */
function productStructuredData(p) {
  const url = SITE_URL + "product.html?id=" + encodeURIComponent(p.id);
  jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: p.name,
        description: p.copy,
        serviceType: catName(p.cat),
        url: url,
        provider: business(),
        areaServed: { "@type": "Place", name: CONFIG.address }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Products", item: SITE_URL + "products.html" },
          { "@type": "ListItem", position: 3, name: p.name, item: url }
        ]
      }
    ]
  });
}

/* ------------------------------------------------------------- card HTML */
function cardHTML(p) {
  return '' +
    '<a class="card" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
      slot(p.photo, p.name, "slot-wide", p.id, p.cat) +
      '<div class="card-body">' +
        '<span class="card-cat">' + esc(catName(p.cat)) + '</span>' +
        '<h3 class="card-name">' + esc(p.name) + '</h3>' +
        '<p class="card-desc">' + esc(p.blurb) + '</p>' +
        '<span class="card-go">View details <span aria-hidden="true">&rarr;</span></span>' +
      '</div>' +
    '</a>';
}

/* --------------------------------------------------------- hero collage */
function initHeroCollage() {
  const wrap = document.getElementById("heroCollage");
  if (!wrap) return;

  /* First tile is the large one; the rest fill the small squares. */
  const tiles = ["t-shirts", "polos", "hoodies", "stickers", "uniforms"];

  wrap.innerHTML = tiles.map(function (id, i) {
    const p = productById(id);
    if (!p) return "";
    return slot(p.photo, p.name, i === 0 ? "slot-lg" : "slot-ratio", p.id, p.cat);
  }).join("");
}

/* ------------------------------------------------------------ hero demo --
   Shows the product instead of asserting it: a blank garment, artwork
   landing on it, the colour changing, finished. Four steps, auto-advancing,
   and every one of them is a thing the real customizer does — the artwork is
   the shop's own logo and the garment is the same SVG design.html draws, so
   this cannot drift into promising something the tool will not do.

   It pauses on hover and on focus, because an animation that keeps moving
   while someone is reading it or tabbing through it is a nuisance rather
   than a demonstration. */
const HERO_DEMO_STEPS = [
  { color: "White", art: false, cap: "Start with a blank." },
  { color: "White", art: true,  cap: "Drop your logo or artwork straight onto it." },
  { color: "Navy",  art: true,  cap: "Change the colour and your design stays put." },
  { color: "Black", art: true,  cap: "That's your finished product — ready to quote." }
];

/* Garments dark enough that dark ink would disappear into them. A shop
   prints light ink on these, so the demo swaps to the white logo rather
   than showing artwork that is technically present and visually absent. */
const DARK_GARMENTS = ["Black", "Navy"];

function initHeroDemo() {
  const wrap = document.getElementById("heroDemo");
  if (!wrap) return;

  const stage = wrap.querySelector(".herodemo-stage");
  const logo  = document.getElementById("heroDemoLogo");
  const cap   = document.getElementById("heroDemoCap");
  const btns  = Array.prototype.slice.call(wrap.querySelectorAll(".herodemo-steps button"));

  let at = 0;
  let timer = null;

  function paint(i) {
    at = i;
    const step = HERO_DEMO_STEPS[i];
    applyGarmentColor(stage, step.color);

    /* Dark ink multiplied onto a dark garment is invisible — which is both a
       bad demo and a lie about what the shop would actually print. Light
       garments get the dark mark blended into the weave; dark garments get
       the white one laid on top, the way light ink really behaves. */
    const dark = DARK_GARMENTS.indexOf(step.color) !== -1;
    logo.src = dark ? "assets/img/logo-mark-white.png" : "assets/img/logo-mark.png";
    logo.style.mixBlendMode = dark ? "normal" : "multiply";

    wrap.classList.toggle("has-art", step.art);
    cap.textContent = step.cap;
    btns.forEach(function (b, n) { b.setAttribute("aria-pressed", String(n === i)); });
  }

  function advance() { paint((at + 1) % HERO_DEMO_STEPS.length); }

  function play() {
    if (timer || reduced) return;
    timer = window.setInterval(advance, 2600);
  }
  function pause() {
    window.clearInterval(timer);
    timer = null;
  }

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      pause();
      paint(Number(b.dataset.step));
      /* Clicking is a deliberate choice, so hand control back rather than
         yanking it away again a moment later. */
    });
  });

  wrap.addEventListener("mouseenter", pause);
  wrap.addEventListener("mouseleave", play);
  wrap.addEventListener("focusin", pause);
  wrap.addEventListener("focusout", play);

  /* Anyone who asked for reduced motion gets the finished garment outright —
     the point of the sequence is the end state, so that is what they see. */
  if (reduced) { paint(HERO_DEMO_STEPS.length - 1); return; }

  paint(0);

  /* Do not animate off-screen: on a phone the hero scrolls away quickly and
     there is no reason to keep a timer running against it. */
  if (!("IntersectionObserver" in window)) { play(); return; }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) play(); else pause(); });
  }, { threshold: 0.25 });
  io.observe(wrap);
}

/* ------------------------------------------------------------- portfolio --
   Real finished work, or nothing at all. The whole section removes itself
   while PORTFOLIO is empty rather than showing placeholder tiles: a grid of
   "photo coming soon" boxes on a print shop's portfolio actively damages
   trust, which is the opposite of what the section is for.

   An entry with a `before` photo becomes a drag-to-compare card, reusing the
   same interaction the home page shirt already uses. */
function initPortfolio() {
  const section = document.getElementById("work");
  if (!section) return;

  const list = typeof PORTFOLIO !== "undefined" ? PORTFOLIO.filter(function (w) { return w.photo; }) : [];
  if (!list.length) { section.remove(); return; }

  const grid = document.getElementById("workGrid");
  grid.innerHTML = list.map(function (w, i) {
    const caption =
      '<div class="work-cap">' +
        '<b>' + esc(w.title) + '</b>' +
        (w.blurb ? "<span>" + esc(w.blurb) + "</span>" : "") +
      "</div>";

    if (w.before) {
      return '<figure class="work work-cmp" data-i="' + i + '">' +
               '<div class="work-shot">' +
                 '<img class="work-before" src="' + esc(w.before) + '" alt="' + esc(w.title) + ', before printing" loading="lazy">' +
                 '<img class="work-after" src="' + esc(w.photo) + '" alt="' + esc(w.title) + '" loading="lazy">' +
                 '<span class="work-line" aria-hidden="true"></span>' +
                 '<input type="range" min="0" max="100" value="50" ' +
                        'aria-label="Reveal the printed version of ' + esc(w.title) + '">' +
               "</div>" + caption +
             "</figure>";
    }
    return '<figure class="work">' +
             '<div class="work-shot"><img src="' + esc(w.photo) + '" alt="' + esc(w.title) + '" loading="lazy"></div>' +
             caption +
           "</figure>";
  }).join("");

  grid.querySelectorAll(".work-cmp").forEach(function (fig) {
    const range = fig.querySelector("input[type=range]");
    const shot = fig.querySelector(".work-shot");
    function apply() {
      shot.style.setProperty("--pos", range.value + "%");
      range.setAttribute("aria-valuetext", (100 - range.value) + "% printed showing");
    }
    range.addEventListener("input", apply);
    apply();
  });
}

/* ----------------------------------------------------------- design ideas */
function initIdeas() {
  const wrap = document.getElementById("ideaGrid");
  if (!wrap) return;

  /* An idea whose destination does not exist is worse than no idea at all,
     so anything pointing at a product that is not in the catalogue is
     dropped rather than rendered as a broken promise. */
  const live = IDEAS.filter(function (idea) {
    const m = /product=([^&]+)/.exec(idea.to);
    return m ? Boolean(productById(decodeURIComponent(m[1]))) : true;
  });

  wrap.innerHTML = live.map(function (idea) {
    return '<a class="idea" href="' + esc(idea.to) + '">' +
             '<b>' + esc(idea.label) + '</b>' +
             '<span>' + esc(idea.blurb) + '</span>' +
             '<i aria-hidden="true">&rarr;</i>' +
           "</a>";
  }).join("");
}

/* ------------------------------------------------------------------- FAQ */
function initFaq() {
  const wrap = document.getElementById("faqList");
  if (!wrap) return;

  /* <details> gives keyboard support and works with JS disabled. */
  wrap.innerHTML = FAQ.map(function (f) {
    return '<details class="faq">' +
             '<summary>' + esc(f.q) + '</summary>' +
             '<div class="faq-a"><p>' + esc(f.a) + '</p></div>' +
           '</details>';
  }).join("");
}

/* ------------------------------------------------- before / after slider */
function initCompare() {
  const box = document.getElementById("compare");
  const range = document.getElementById("compareRange");
  if (!box || !range) return;

  function apply() {
    box.style.setProperty("--pos", range.value + "%");
    /* Left of the divider is the blank shirt, right of it is the printed one,
       so a raw "46" would tell a screen reader nothing useful. */
    range.setAttribute("aria-valuetext", (100 - range.value) + "% printed shirt showing");
  }

  range.addEventListener("input", apply);
  apply();
}

/* -------------------------------------------------------------- catalogue */
function initCatalog() {
  const grid = document.getElementById("catGrid");
  if (!grid) return;

  const countEl = document.getElementById("catCount");
  const searchInput = document.getElementById("catSearchInput");
  const filterWrap = document.getElementById("catFilters");

  let activeCat = "all";
  let query = new URLSearchParams(window.location.search).get("q") || "";
  if (query) searchInput.value = query;

  /* Category buttons, with a live count against each. */
  filterWrap.innerHTML =
    '<button class="filter-btn" data-cat="all" aria-pressed="true">All products <i>' + PRODUCTS.length + '</i></button>' +
    CATEGORIES.map(function (c) {
      const n = PRODUCTS.filter(function (p) { return p.cat === c.id; }).length;
      return '<button class="filter-btn" data-cat="' + c.id + '" aria-pressed="false">' + esc(c.name) + ' <i>' + n + '</i></button>';
    }).join("");

  function matches(p) {
    if (activeCat !== "all" && p.cat !== activeCat) return false;
    if (!query) return true;
    const hay = (p.name + " " + p.blurb + " " + p.copy + " " + catName(p.cat)).toLowerCase();
    /* Every word must appear somewhere, so "vinyl banner" narrows properly. */
    return query.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function render() {
    const hits = PRODUCTS.filter(matches);
    countEl.textContent = hits.length + (hits.length === 1 ? " product" : " products");

    grid.innerHTML = hits.length
      ? hits.map(cardHTML).join("")
      : '<div class="empty"><b>Nothing matches "' + esc(query) + '"</b>' +
        '<p>Try a broader word, or <a href="index.html#quote" style="color:var(--red)">ask us</a> — the card says ' +
        '<em>and much more</em> for a reason.</p></div>';
  }

  filterWrap.addEventListener("click", function (e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeCat = btn.dataset.cat;
    filterWrap.querySelectorAll(".filter-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    render();
  });

  searchInput.addEventListener("input", function () {
    query = searchInput.value.trim();
    render();
  });

  document.getElementById("catSearchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    render();
  });

  render();
}

/* ------------------------------------------------------------ product page */
/* ------------------------------------------------------- color customizer
   Applies to apparel products with a `colors` array. T-shirts get a live
   recolor of the shared shirt symbol with the real logo composited on top;
   every other apparel item keeps its existing flat illustration and simply
   records which color was picked — recoloring a line-art icon by swatch
   would read as a broken tint rather than "the garment in that color," so
   we don't pretend otherwise. Either way the choice carries into the quote. */

function quoteHref(p, color) {
  var href = "index.html?product=" + encodeURIComponent(p.id);
  if (color) href += "&color=" + encodeURIComponent(color);
  return href + "#quote";
}

function shirtPreviewHTML(p) {
  return '<div class="slot slot-wide slot-art">' +
           '<svg viewBox="0 0 600 620" role="img" aria-label="' + esc(p.name) + '">' +
             '<use href="#shirtArt"/>' +
             '<image href="assets/img/logo-mark.png" x="238" y="246" width="124" height="142" ' +
                    'opacity=".93" style="mix-blend-mode:multiply"/>' +
           '</svg>' +
         '</div>';
}

function colorSwatchesHTML(p) {
  return '<div class="swatches" id="colorSwatches">' +
           '<span class="swatches-label">Color</span>' +
           '<div class="swatch-row" role="group" aria-label="Choose a color">' +
             p.colors.map(function (c, i) {
               return '<button type="button" class="swatch" data-color="' + esc(c) + '" ' +
                      'aria-pressed="' + (i === 0 ? "true" : "false") + '" ' +
                      'style="--sw:' + esc(SWATCH_HEX[c] || "#C8CCD1") + '" ' +
                      'aria-label="' + esc(c) + '"></button>';
             }).join("") +
           '</div>' +
           '<p class="swatch-note" id="swatchNote"></p>' +
         '</div>';
}

function initColorCustomizer(p) {
  const wrap = document.getElementById("colorSwatches");
  const note = document.getElementById("swatchNote");
  const btn = document.getElementById("pdpQuoteBtn");
  if (!wrap) return;

  const isShirt = p.id === "t-shirts";

  function select(color) {
    wrap.querySelectorAll(".swatch").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.color === color));
    });

    if (isShirt) {
      /* The shared <linearGradient id="cloth"> lives in the defs block
         ensureShirtDefs() injects at the top of <body> — a sibling of
         #garmentPreview, not a descendant of it. Custom properties only
         cascade down the DOM, so setting them on the preview's own <svg>
         never reaches those <stop> elements. Only one shirt is ever being
         colored on a page at a time (the home page slider never calls this
         at all), so scoping to the document root is correct, not just
         convenient. */
      applyGarmentColor(document.documentElement, color);
      note.textContent = color;
    } else {
      note.textContent = color + " — color noted for your quote";
    }

    if (btn) btn.setAttribute("href", quoteHref(p, color));
  }

  wrap.addEventListener("click", function (e) {
    const b = e.target.closest(".swatch");
    if (!b) return;
    select(b.dataset.color);
  });

  select(p.colors[0]);
}

function initProductPage() {
  const root = document.getElementById("pdp");
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const p = id ? productById(id) : null;

  if (!p) {
    root.innerHTML =
      '<div class="empty" style="grid-column:1/-1"><b>That product is not in the catalogue</b>' +
      '<p>It may have been renamed. <a href="products.html" style="color:var(--red)">Browse everything</a> ' +
      'or <a href="index.html#quote" style="color:var(--red)">ask us for it</a>.</p></div>';
    return;
  }

  document.title = p.name + " — M-Power Print";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", p.blurb);

  const hasColors = Array.isArray(p.colors) && p.colors.length > 0;
  const isShirt = p.id === "t-shirts";

  root.innerHTML =
    '<div>' +
      '<div id="garmentPreview">' + (isShirt ? shirtPreviewHTML(p) : slot(p.photo, p.name, "slot-wide", p.id, p.cat)) + '</div>' +
      (hasColors ? colorSwatchesHTML(p) : '') +
    '</div>' +
    '<div>' +
      '<p class="crumb"><a href="products.html">Products</a> / ' + esc(catName(p.cat)) + '</p>' +
      '<h1 class="h2">' + esc(p.name) + '</h1>' +
      '<p class="lede">' + esc(p.copy) + '</p>' +
      '<ul class="spec-list">' +
        p.specs.map(function (s) {
          return '<li><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></li>';
        }).join("") +
        '<li><b>Pricing</b><span>Quote on request</span></li>' +
      '</ul>' +
      '<div class="hero-cta">' +
        /* Customizable products lead with designing rather than asking, since
           seeing the artwork on the garment is what makes the decision. */
        (p.customizable
          ? '<a class="btn btn-red" href="design.html?product=' + encodeURIComponent(p.id) + '">Design your own</a>' +
            '<a class="btn btn-white" id="pdpQuoteBtn" href="' + quoteHref(p) + '">Get a quote</a>'
          : '<a class="btn btn-red" id="pdpQuoteBtn" href="' + quoteHref(p) + '">' +
              (hasColors ? 'Get a quote in this color' : 'Get a quote for this') +
            '</a>') +
        '<a class="btn btn-white" href="#" data-field="phoneHref">Call <span data-field="phone"></span></a>' +
      '</div>' +
    '</div>';

  fillFields(root);
  productStructuredData(p);
  if (hasColors) initColorCustomizer(p);

  /* What people ordering this usually need alongside it — see RECOMMENDS.
     Cross-category on purpose: staff polos pair with business cards far more
     often than with another style of polo. */
  const rel = document.getElementById("related");
  if (rel) {
    const others = recommendFor(p, 4);
    if (others.length) rel.innerHTML = others.map(cardHTML).join("");
    else rel.closest("section").remove();
  }
}

/* ------------------------------------------------------------- quote form */
function initQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const note = document.getElementById("formNote");
  const select = document.getElementById("qService");

  /* Fill the dropdown from the catalogue so it can never drift out of sync. */
  if (select) {
    select.innerHTML =
      CATEGORIES.map(function (c) {
        const opts = PRODUCTS.filter(function (p) { return p.cat === c.id; })
          .map(function (p) { return '<option value="' + esc(p.name) + '">' + esc(p.name) + '</option>'; })
          .join("");
        return '<optgroup label="' + esc(c.name) + '">' + opts + '</optgroup>';
      }).join("") +
      '<option value="Something else">Something else</option>';

    /* Arriving from a product page preselects that product, and — from the
       apparel color customizer — pre-fills the color they picked. */
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("product");
    const color = params.get("color");
    const p = wanted ? productById(wanted) : null;
    if (p) select.value = p.name;

    const notes = document.getElementById("qNotes");
    const lines = [];
    if (color) lines.push("Color: " + color);

    /* "We'll design it for you" lands here rather than on a second form.
       Saying so in the notes is what turns a generic quote into a design
       request, and it means the customer starts with the prompt already
       written rather than a blank box. */
    if (params.get("help") === "design") {
      lines.push("I'd like help with the design.");
      lines.push("");
      lines.push("What it's for:");
      lines.push("Wording or ideas I have so far:");
      lines.push("Anything I want it to look like:");
    }

    /* Deliberately not focused on load: the hash already scrolls the form
       into view, and stealing focus on arrival pops the keyboard on a phone
       before the customer has read what the field is asking for. */
    if (notes && !notes.value && lines.length) notes.value = lines.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = new FormData(form);
    const get = function (k) { return (data.get(k) || "").toString().trim(); };

    const lines = [
      "Name: " + get("name"),
      "Contact: " + get("contact"),
      "Product: " + get("service"),
      "Quantity: " + get("qty"),
      "Needed by: " + (get("deadline") || "Not specified"),
      "",
      "Details:",
      get("notes") || "None given.",
      "",
      "— Sent from lacamisanegra.com"
    ];

    window.location.href = values.emailHref +
      "?subject=" + encodeURIComponent("Quote request — " + get("service") + " (" + get("qty") + ")") +
      "&body=" + encodeURIComponent(lines.join("\n"));

    note.textContent = "Your email app should be opening. Attach your artwork before you send.";
  });
}

/* -------------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof ensureShirtDefs === "function") ensureShirtDefs();
  /* The hero demo and the customizer both draw the full garment set. */
  if (typeof ensureGarmentDefs === "function") ensureGarmentDefs();
  fillFields();
  initNav();
  initHeaderSearch();
  initHeroVideo();
  initHeroCollage();
  initHeroDemo();
  initIdeas();
  initPortfolio();
  initFaq();
  initStructuredData();
  initCompare();
  initCatalog();
  initProductPage();
  initQuoteForm();

  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Home page featured grid — first product of each category, then fill. */
  const feat = document.getElementById("featured");
  if (feat) {
    const picked = CATEGORIES.map(function (c) {
      return PRODUCTS.find(function (p) { return p.cat === c.id; });
    }).filter(Boolean);
    PRODUCTS.forEach(function (p) {
      if (picked.length < 6 && picked.indexOf(p) === -1) picked.push(p);
    });
    feat.innerHTML = picked.slice(0, 6).map(cardHTML).join("");
  }
});
