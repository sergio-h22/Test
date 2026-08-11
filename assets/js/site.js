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
const SITE_URL = "https://m-powerprint.com/";

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
  const tiles = ["t-shirts", "polos", "hoodies", "stickers", "caps"];

  wrap.innerHTML = tiles.map(function (id, i) {
    const p = productById(id);
    if (!p) return "";
    return slot(p.photo, p.name, i === 0 ? "slot-lg" : "slot-ratio", p.id, p.cat);
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

  root.innerHTML =
    '<div>' + slot(p.photo, p.name, "slot-wide", p.id, p.cat) + '</div>' +
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
        '<a class="btn btn-red" href="index.html?product=' + encodeURIComponent(p.id) + '#quote">Get a quote for this</a>' +
        '<a class="btn btn-white" href="#" data-field="phoneHref">Call <span data-field="phone"></span></a>' +
      '</div>' +
    '</div>';

  fillFields(root);
  productStructuredData(p);

  /* Related products from the same category. */
  const rel = document.getElementById("related");
  if (rel) {
    const others = PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 4);
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

    /* Arriving from a product page preselects that product. */
    const wanted = new URLSearchParams(window.location.search).get("product");
    const p = wanted ? productById(wanted) : null;
    if (p) select.value = p.name;
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
      "— Sent from m-powerprint.com"
    ];

    window.location.href = values.emailHref +
      "?subject=" + encodeURIComponent("Quote request — " + get("service") + " (" + get("qty") + ")") +
      "&body=" + encodeURIComponent(lines.join("\n"));

    note.textContent = "Your email app should be opening. Attach your artwork before you send.";
  });
}

/* -------------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", function () {
  fillFields();
  initNav();
  initHeaderSearch();
  initHeroVideo();
  initHeroCollage();
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
