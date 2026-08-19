/* Storefront for the ready-made designs.
 *
 * Browsing is deliberately independent of the customizer: this page never
 * loads Fabric. Previews are SVG (see shopPreviewSVG in shop.js), so a
 * customer can look through the whole line on a phone without paying for the
 * editor runtime. The editor is only reached by choosing to edit a design.
 */
(function () {
  "use strict";

  if (document.body.getAttribute("data-page") !== "shop") return;

  /* Standard garment sizing. These are the sizes the blanks are stocked in,
     not a pricing decision, so they live here as plain data. Adjust the list
     if the shop's stock changes. */
  const SHOP_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

  const grid  = document.getElementById("shopGrid");
  const empty = document.getElementById("shopEmpty");
  const hero  = document.getElementById("heroArt");
  const dlg   = document.getElementById("shopPick");

  const el = {
    title:   document.getElementById("pickTitle"),
    stage:   document.getElementById("pickStage"),
    garments:document.getElementById("pickGarments"),
    colors:  document.getElementById("pickColors"),
    sides:   document.getElementById("pickSides"),
    sideBlk: document.getElementById("pickSideBlock"),
    size:    document.getElementById("pickSize"),
    qty:     document.getElementById("pickQty"),
    price:   document.getElementById("pickPrice"),
    add:     document.getElementById("pickAdd"),
    edit:    document.getElementById("pickEdit"),
    note:    document.getElementById("pickNote"),
    close:   document.getElementById("pickClose")
  };

  /* Current selection inside the dialog. */
  let sel = { design: null, product: null, color: null, side: "front" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function productById(id) {
    return PRODUCTS.filter(function (p) { return p.id === id; })[0] || null;
  }

  /* Garment colours a design can actually be printed on: the intersection of
     the colours the design was drawn for and the colours the blank comes in.
     Without the intersection a design could offer navy on a hi-vis vest. */
  function colorsFor(design, productId) {
    const product = productById(productId);
    const stocked = (product && product.colors) || [];
    return design.colors.filter(function (c) { return stocked.indexOf(c) > -1; });
  }

  function firstColor(design, productId) {
    const list = colorsFor(design, productId);
    return list.length ? list[0] : (design.colors[0] || "Black");
  }

  /* ------------------------------------------------------------------ grid */

  function card(design) {
    const productId = design.garments[0];
    const color = firstColor(design, productId);
    const svg = shopPreviewSVG(design.id, productId, color, "front");
    const both = design.design.back && design.design.back.length;
    return '<article class="shopCard reveal" data-design="' + esc(design.id) + '">' +
        '<button class="shopCard-btn" type="button" data-open="' + esc(design.id) + '">' +
          '<span class="shopCard-art" data-color="' + esc(color) + '">' + svg + "</span>" +
          '<span class="shopCard-meta">' +
            '<span class="shopCard-name">' + esc(design.name) + "</span>" +
            '<span class="shopCard-blurb">' + esc(design.blurb) + "</span>" +
            '<span class="shopCard-tags">' +
              design.tags.map(function (t) { return '<span class="shopTag">' + esc(t) + "</span>"; }).join("") +
              (both ? '<span class="shopTag">Front and back</span>' : "") +
            "</span>" +
          "</span>" +
        "</button>" +
      "</article>";
  }

  function paintGrid() {
    if (typeof SHOP_DESIGNS === "undefined" || !SHOP_DESIGNS.length) {
      /* Clear the placeholder too, or a failed load leaves eight shimmering
         boxes that look like they are still working. */
      grid.removeAttribute("data-skeleton");
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (grid.hasAttribute("data-skeleton")) grid.removeAttribute("data-skeleton");
    grid.innerHTML = SHOP_DESIGNS.map(card).join("");
    /* Tint each preview's cloth. The garment SVG paints from custom properties,
       so the colour is applied to the wrapper rather than baked into the art. */
    Array.prototype.forEach.call(grid.querySelectorAll(".shopCard-art"), function (node) {
      applyGarmentColor(node, node.getAttribute("data-color"));
    });
    revealOnScroll();
  }

  function paintHero() {
    if (!hero) return;
    const d = shopDesign("heavyweight") || SHOP_DESIGNS[0];
    if (!d) return;
    const productId = d.garments[0];
    const color = firstColor(d, productId);
    hero.innerHTML = shopPreviewSVG(d.id, productId, color, "front");
    applyGarmentColor(hero, color);
  }

  /* Entry animation. IntersectionObserver rather than a scroll listener, which
     is the pattern the rest of the site already uses. */
  function revealOnScroll() {
    const items = grid.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add("is-in"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------------- dialog */

  /* value is carried separately from label because a garment chip shows
     "T-Shirts" but must carry the id "t-shirts". */
  function chip(label, value, active, attr) {
    return '<button type="button" class="shopChip' + (active ? " is-on" : "") + '" ' +
           attr + '="' + esc(value) + '" aria-pressed="' + (active ? "true" : "false") + '">' +
           esc(label) + "</button>";
  }

  function paintDialog() {
    const d = sel.design;
    if (!d) return;

    el.title.textContent = d.name;

    el.garments.innerHTML = d.garments.map(function (id) {
      const p = productById(id);
      return p ? chip(p.name, id, id === sel.product, "data-garment-id") : "";
    }).join("");

    const colors = colorsFor(d, sel.product);
    el.colors.innerHTML = colors.map(function (c) {
      return chip(c, c, c === sel.color, "data-color");
    }).join("");

    const hasBack = d.design.back && d.design.back.length;
    el.sideBlk.hidden = !hasBack;
    if (hasBack) {
      el.sides.innerHTML = chip("Front", "front", sel.side === "front", "data-side") +
                           chip("Back",  "back",  sel.side === "back",  "data-side");
    }

    el.stage.innerHTML = shopPreviewSVG(d.id, sel.product, sel.color, sel.side);
    applyGarmentColor(el.stage, sel.color);

    el.edit.href = "design.html?product=" + encodeURIComponent(sel.product) +
                   "&shop=" + encodeURIComponent(d.id) +
                   "&color=" + encodeURIComponent(sel.color);

    /* No prices have been set for the shop. Saying so plainly beats printing a
       number nobody agreed to. */
    el.price.textContent = d.price == null
      ? "Price confirmed with your quote, based on garment and quantity."
      : d.price;
  }

  function openDialog(designId) {
    const d = shopDesign(designId);
    if (!d) return;
    sel.design  = d;
    sel.product = d.garments[0];
    sel.color   = firstColor(d, sel.product);
    sel.side    = "front";
    el.size.innerHTML = SHOP_SIZES.map(function (s) {
      return '<option value="' + esc(s) + '">' + esc(s) + "</option>";
    }).join("");
    el.size.value = "L";
    el.qty.value = 1;
    el.note.textContent = "";
    el.note.classList.remove("is-error");
    paintDialog();
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }

  function closeDialog() {
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  /* -------------------------------------------------------------- add to cart */

  /* The cart draws its thumbnail with <img src="...">, and an <img> renders SVG
     in an isolated context: no <use> into the page's <symbol> defs, no
     inherited custom properties. A preview built the way the on-page one is
     would arrive in the cart as an empty box. So the cart thumbnail is built
     self-contained instead, showing the graphic on a panel in the garment
     colour. The item's own text carries which garment it is. */
  function cartThumb() {
    const d = sel.design;
    const swatch = (typeof GARMENT_COLORS !== "undefined" && GARMENT_COLORS[sel.color])
      ? GARMENT_COLORS[sel.color].cloth[1] : "#2E3033";
    const resolved = shopDesignFor(d.id, sel.color);
    const layers = (resolved && resolved[sel.side]) || [];
    /* A square area matching the print-area proportions keeps the graphic at
       the same relative scale it has on the garment. */
    const area = { x: 60, y: 60, w: 280, h: 280 };
    const body = layers.map(function (l) { return shopLayerSVG(l, area); }).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">' +
        '<rect width="400" height="400" rx="18" fill="' + swatch + '"/>' + body + "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function addToCart() {
    const d = sel.design;
    if (!d || typeof CustomizerStore === "undefined") {
      el.note.textContent = "Cart is unavailable in this browser.";
      el.note.classList.add("is-error");
      return;
    }
    const product = productById(sel.product);
    const qty = Math.max(1, parseInt(el.qty.value, 10) || 1);
    const resolved = shopDesignFor(d.id, sel.color);

    el.add.disabled = true;
    el.note.classList.remove("is-error");
    el.note.textContent = "Adding...";

    CustomizerStore.addToCart(
      { product: product, color: sel.color, designs: resolved },
      {
        qty: qty,
        options: { design: d.name, sizes: el.size.value },
        preview: cartThumb()
      }
    ).then(function () {
      el.note.textContent = "Added to your cart.";
      el.add.disabled = false;
      if (typeof updateCartCount === "function") updateCartCount();
      refreshCartBadge();
    }).catch(function () {
      el.note.textContent = "Could not add that. Please try again.";
      el.note.classList.add("is-error");
      el.add.disabled = false;
    });
  }

  function refreshCartBadge() {
    if (typeof CustomizerStore === "undefined") return;
    CustomizerStore.cartCount().then(function (n) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-cart-count]"), function (b) {
        b.textContent = n;
        b.hidden = !n;
      });
    }).catch(function () {});
  }

  /* ----------------------------------------------------------------- wiring */

  if (grid) {
    grid.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-open]");
      if (btn) openDialog(btn.getAttribute("data-open"));
    });
  }

  el.garments.addEventListener("click", function (e) {
    const b = e.target.closest("[data-garment-id]");
    if (!b) return;
    sel.product = b.getAttribute("data-garment-id");
    /* The new garment may not stock the current colour. */
    if (colorsFor(sel.design, sel.product).indexOf(sel.color) === -1) {
      sel.color = firstColor(sel.design, sel.product);
    }
    paintDialog();
  });

  el.colors.addEventListener("click", function (e) {
    const b = e.target.closest("[data-color]");
    if (!b) return;
    sel.color = b.getAttribute("data-color");
    paintDialog();
  });

  el.sides.addEventListener("click", function (e) {
    const b = e.target.closest("[data-side]");
    if (!b) return;
    sel.side = b.getAttribute("data-side").toLowerCase();
    paintDialog();
  });

  el.add.addEventListener("click", addToCart);
  el.close.addEventListener("click", closeDialog);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(); });

  if (typeof ensureGarmentDefs === "function") ensureGarmentDefs();
  paintHero();
  paintGrid();
  refreshCartBadge();
})();
