/* ==========================================================================
   M-Power Print — cart
   --------------------------------------------------------------------------
   Reads the cart out of CustomizerStore and renders it. Every line keeps its
   own copy of the design that was added, so editing the same product
   afterwards does not change what is sitting in the cart.

   Nothing here places an order. The site is static and the shop quotes every
   job individually, so the end of this flow sends the cart to CONFIG.email
   (site.js). Two ways, chosen by CONFIG.quoteEndpoint (site.js):

     empty            — mailto:, with the design spec written into the body
                         and the artwork downloaded for the customer to
                         attach by hand. Works with no setup, cannot carry a
                         real attachment.
     a Formspree/etc.
     URL               — the whole cart POSTs there with every item's artwork
                         attached as a real file, falling back to mailto if
                         the request fails.

   Mirrors ENDPOINT_ADAPTER/MAILTO_ADAPTER in customizer/quote.js, which is
   the same choice for a single design rather than a whole cart.
   ========================================================================== */

(function () {
  const root = document.getElementById("cartRoot");
  if (!root || typeof CustomizerStore === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* A one-line summary of what is actually printed on each side, so a
     customer recognises the line without opening it. */
  function describe(item) {
    const bits = [];
    ["front", "back"].forEach(function (side) {
      const layers = (item.designs && item.designs[side]) || [];
      if (!layers.length) return;
      const texts = layers.filter(function (l) { return l.type === "text" && l.text; })
                          .map(function (l) { return '"' + l.text + '"'; });
      /* Name the source file where there is one. "1 graphic" tells the shop
         nothing; "artwork.pdf p3" tells them exactly which artwork to check
         against if the print file ever needs regenerating. */
      const named = layers.filter(function (l) { return l.sourceName; })
                          .map(function (l) {
                            return l.sourceName + (l.sourcePage ? " p" + l.sourcePage : "");
                          });
      const other = layers.length - texts.length - named.length;
      const parts = texts.slice(0, 2).concat(named.slice(0, 2));
      if (other > 0) parts.push(other + (other === 1 ? " graphic" : " graphics"));
      bits.push(side.charAt(0).toUpperCase() + side.slice(1) + ": " + parts.join(", "));
    });
    return bits.length ? bits.join(" · ") : "No artwork yet";
  }

  function optionLine(item) {
    const o = item.options || {};
    const parts = Object.keys(o).filter(function (k) { return o[k]; })
                               .map(function (k) { return o[k]; });
    if (item.color) parts.unshift(item.color);
    return parts.join(" · ");
  }

  function render(items) {
    if (!items.length) {
      root.innerHTML =
        '<div class="cart-empty">' +
          "<p>Your cart is empty.</p>" +
          '<a class="btn btn-red" href="design.html">Design something</a>' +
        "</div>";
      return;
    }

    root.innerHTML =
      '<ul class="cart-list">' +
        items.map(function (it) {
          const opts = optionLine(it);
          return '<li class="cart-item" data-id="' + esc(it.id) + '">' +
              '<div class="cart-thumb">' +
                (it.preview
                  ? '<img src="' + esc(it.preview) + '" alt="Your design for ' + esc(it.productName) + '">'
                  : '<span class="cart-thumb-none">No preview</span>') +
              "</div>" +
              '<div class="cart-body">' +
                "<h3>" + esc(it.productName) + "</h3>" +
                (opts ? '<p class="cart-opts">' + esc(opts) + "</p>" : "") +
                '<p class="cart-desc">' + esc(describe(it)) + "</p>" +
                '<p class="cart-qty">Quantity: <b>' + esc(it.qty) + "</b></p>" +
              "</div>" +
              '<div class="cart-actions">' +
                '<a class="btn btn-white btn-sm" href="design.html?product=' +
                  encodeURIComponent(it.productId) + '">Edit</a>' +
                /* The print file, offered separately from the preview so
                   nobody sends a screenshot to a press by mistake. Only shown
                   when the item actually carries one: designs added before
                   this existed do not. */
                (it.production
                  ? '<button type="button" class="btn btn-white btn-sm" data-print="' +
                    esc(it.id) + '">Print file</button>'
                  : "") +
                '<button type="button" class="btn btn-white btn-sm" data-remove="' +
                  esc(it.id) + '">Remove</button>' +
              "</div>" +
            "</li>";
        }).join("") +
      "</ul>" +
      '<div class="cart-foot">' +
        '<p class="cart-note" id="cartNote"></p>' +
        '<div class="cart-foot-btns">' +
          '<button type="button" class="btn btn-white" id="clearCart">Empty cart</button>' +
          '<button type="button" class="btn btn-red" id="sendCart">Send for a quote</button>' +
        "</div>" +
      "</div>";
  }

  function refresh() {
    return CustomizerStore.listCart().then(function (items) {
      render(items);
      document.querySelectorAll("[data-cart-count]").forEach(function (n) {
        n.textContent = items.length ? String(items.length) : "";
        n.hidden = !items.length;
      });
      return items;
    }).catch(function () {
      root.innerHTML = '<div class="cart-empty"><p>Your saved designs could not be read ' +
                       "in this browser.</p></div>";
      return [];
    });
  }

  /* The quote body. Deliberately readable as an email rather than a data
     dump — whoever picks this up at the shop should be able to act on it
     without opening a tool. Same principle as customizer/quote.js. */
  /* Hands over the production render rather than the preview. The filename
     carries the product and the pixel size so the shop can tell at a glance
     what it is looking at. */
  function downloadProduction(item) {
    if (!item || !item.production) return;
    const m = item.productionMeta || {};
    const a = document.createElement("a");
    a.href = item.production;
    a.download = [
      "print",
      (item.productId || "design"),
      (m.side || "front"),
      (m.widthPx && m.heightPx ? m.widthPx + "x" + m.heightPx : ""),
      (m.dpi ? m.dpi + "dpi" : "")
    ].filter(Boolean).join("-") + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* attached is true when the artwork is riding along as a real upload
     (the endpoint path) and false when it had to be downloaded for the
     customer to attach by hand (mailto) — the one line that differs between
     the two is which of those actually happened. */
  function buildBody(items, attached) {
    const lines = ["DESIGN REQUEST", ""];
    items.forEach(function (it, i) {
      lines.push((i + 1) + ". " + it.productName);
      if (it.color) lines.push("   Colour: " + it.color);
      Object.keys(it.options || {}).forEach(function (k) {
        if (it.options[k]) lines.push("   " + k + ": " + it.options[k]);
      });
      lines.push("   Quantity: " + it.qty);
      lines.push("   " + describe(it));
      lines.push("");
    });
    if (attached) {
      lines.push("Artwork for each design is attached.");
    } else {
      lines.push("Artwork for each design has been downloaded to my device.");
      lines.push("I will attach it to this email before sending.");
    }
    lines.push("");
    const home = (typeof SITE_URL === "string" ? SITE_URL : "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    lines.push("— Designed at " + (home ? home + "/design.html" : "our design tool"));
    return lines.join("\n");
  }

  function subjectFor(items) {
    return "Design request — " + items.length + (items.length === 1 ? " item" : " items");
  }

  function sendViaMailto(items) {
    downloadPreviews(items);
    const to = (typeof CONFIG !== "undefined" && CONFIG.email) || "";
    window.location.href = "mailto:" + to +
      "?subject=" + encodeURIComponent(subjectFor(items)) +
      "&body=" + encodeURIComponent(buildBody(items, false));
    return Promise.resolve({
      message: "Your artwork has been downloaded and your email app should be opening. Attach the files before you send."
    });
  }

  /* Mirrors ENDPOINT_ADAPTER in customizer/quote.js, extended to carry every
     line in the cart rather than a single design: each item's artwork rides
     as its own attachment (item_N_artwork), named so the shop can match a
     file back to the line it belongs to without opening it first. */
  function sendViaEndpoint(items) {
    const form = new FormData();
    form.append("subject", subjectFor(items));
    form.append("item_count", String(items.length));
    items.forEach(function (it, i) {
      const n = i + 1;
      form.append("item_" + n + "_product", it.productName);
      if (it.color) form.append("item_" + n + "_color", it.color);
      form.append("item_" + n + "_quantity", it.qty);
      Object.keys(it.options || {}).forEach(function (k) {
        if (it.options[k]) form.append("item_" + n + "_option_" + k, it.options[k]);
      });
      /* production is the 300 DPI print-area render the shop actually prints
         from; preview is what the cart shows on screen. Send the one meant
         for the press when it exists. */
      const art = it.production || it.preview;
      if (art) {
        form.append("item_" + n + "_artwork", CustomizerQuote.dataUrlToBlob(art),
                    "design-" + n + "-" + it.productId + ".png");
      }
    });
    form.append("spec", buildBody(items, true));

    return fetch(CONFIG.quoteEndpoint, { method: "POST", body: form, headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("Endpoint returned " + r.status);
        return { message: "Your order is on its way. We'll be in touch with a quote." };
      })
      .catch(function (err) {
        /* Never lose the customer's cart to a network failure — fall back to
           the path that cannot fail, same as the customizer's own flow. */
        console.error("Cart quote endpoint failed, falling back to email:", err);
        return sendViaMailto(items);
      });
  }

  /* mailto cannot carry an attachment — not in the spec, unsupported by every
     browser. So the artwork is downloaded for the customer to attach, exactly
     as the customizer's own quote flow does. */
  function downloadPreviews(items) {
    items.forEach(function (it, i) {
      if (!it.preview) return;
      const a = document.createElement("a");
      a.href = it.preview;
      a.download = "design-" + (i + 1) + "-" + it.productId + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  root.addEventListener("click", function (e) {
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      CustomizerStore.removeFromCart(rm.dataset.remove).then(refresh);
      return;
    }

    const pf = e.target.closest("[data-print]");
    if (pf) {
      CustomizerStore.listCart().then(function (items) {
        downloadProduction(items.filter(function (i) { return i.id === pf.dataset.print; })[0]);
      });
      return;
    }

    if (e.target.id === "clearCart") {
      CustomizerStore.clearCart().then(refresh);
      return;
    }

    if (e.target.id === "sendCart") {
      CustomizerStore.listCart().then(function (items) {
        if (!items.length) return;
        const hasEndpoint = typeof CONFIG !== "undefined" && CONFIG.quoteEndpoint &&
                             typeof CustomizerQuote !== "undefined";
        const send = hasEndpoint ? sendViaEndpoint(items) : sendViaMailto(items);
        send.then(function (result) {
          const note = document.getElementById("cartNote");
          if (note) note.textContent = result.message;
        });
      });
    }
  });

  refresh();
})();
