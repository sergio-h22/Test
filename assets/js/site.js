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

  if (HERO_VIDEO.poster) video.poster = HERO_VIDEO.poster;
  video.addEventListener("error", function () { layer.remove(); });
  video.addEventListener("loadeddata", function () {
    layer.hidden = false;
    document.getElementById("hero").classList.add("has-video");
    /* Someone who asked for reduced motion gets a still frame, not a loop. */
    if (!reduced) video.play().catch(function () {});
  });
  video.src = src;
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
