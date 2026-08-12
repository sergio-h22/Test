/* ==========================================================================
   M-Power Print — turning a finished design into a quote request
   --------------------------------------------------------------------------
   The delivery problem, stated plainly
   ------------------------------------
   The rest of the site sends quotes with a mailto: link. You cannot attach a
   file to a mailto: — it is not in the spec and no browser supports it. So a
   customer's uploaded artwork physically cannot ride along on that mechanism.

   Rather than pretend otherwise, delivery is an adapter with one interface.
   MAILTO_ADAPTER is wired now: it exports the artwork as a file the customer
   downloads, puts a complete written spec in the email body, and tells them
   to attach the file. It costs nothing and works today.

   ENDPOINT_ADAPTER is the upgrade. Point QUOTE_ENDPOINT at a Formspree or
   Web3Forms URL and real attachments go straight to the shop — no other code
   changes. The choice is one constant, not a rewrite.
   ========================================================================== */

/* Set this to a form endpoint (e.g. "https://formspree.io/f/xxxxxxx") and the
   customizer will POST designs to it with the artwork attached. Left empty,
   the mailto path is used instead. */
const QUOTE_ENDPOINT = "";

const CustomizerQuote = (function () {

  /* Rounds a normalised value to something a human can read in an email.
     Percentages, because "38% across, 22% down" is instantly checkable
     against the preview whereas a float is not. */
  function pct(n) { return Math.round(n * 100) + "%"; }

  /* Describes one layer in words. This is what the shop actually reads, so it
     names things the way a print job does rather than dumping coordinates. */
  function describeLayer(layer, i, area) {
    const lines = [];
    const what = layer.type === "text"
      ? 'Text: "' + layer.text + '"'
      : "Uploaded artwork";

    lines.push("  " + (i + 1) + ". " + what);
    lines.push("     Position: " + pct(layer.x) + " across, " + pct(layer.y) + " down the print area");
    lines.push("     Width:    " + pct(layer.w) + " of the print area (" +
               Math.round(layer.w * area.w) + " of " + area.w + " units)");
    if (layer.angle) lines.push("     Rotation: " + Math.round(layer.angle) + "°");

    if (layer.type === "text") {
      const style = [];
      if (layer.bold) style.push("bold");
      if (layer.italic) style.push("italic");
      lines.push("     Style:    " + (style.length ? style.join(", ") + ", " : "") +
                 (layer.font || "Helvetica") + ", " + (layer.fill || "#16181B"));
    }
    return lines.join("\n");
  }

  function describeSide(state, side) {
    const layers = state.designs[side];
    const area = printAreaFor(state.product.id, side);
    if (!layers.length) return null;

    return [
      side.toUpperCase() + " — " + area.label,
      layers.map(function (l, i) { return describeLayer(l, i, area); }).join("\n")
    ].join("\n");
  }

  /* The full written specification. Deliberately readable as an email rather
     than as a data dump: whoever picks this up at the shop should be able to
     act on it without opening a tool. */
  function buildSpec(state, extra) {
    const parts = [
      "PRODUCT",
      "  " + state.product.name,
      "  Colour: " + state.color,
      "  Quantity: " + extra.qty,
      ""
    ];

    const sides = ["front", "back"]
      .map(function (s) { return describeSide(state, s); })
      .filter(Boolean);

    if (sides.length) {
      parts.push("DESIGN");
      parts.push(sides.join("\n\n"));
      parts.push("");
    }

    parts.push("Positions are given as a fraction of the printable area for");
    parts.push("that garment, so they hold at any print size.");
    parts.push("");

    if (extra.name)    parts.push("Name: " + extra.name);
    if (extra.contact) parts.push("Contact: " + extra.contact);
    parts.push("");
    parts.push("— Designed at m-powerprint.com/design.html");

    return parts.join("\n");
  }

  function subjectFor(state, extra) {
    return "Design request — " + state.product.name +
           " (" + state.color + ", " + extra.qty + ")";
  }

  /* Downloads the flattened artwork so the customer has a file to attach.
     Named after the product so it is obvious what it belongs to once it is
     sitting in a downloads folder next to twelve other things. */
  function downloadArtwork(dataUrl, state) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "m-power-design-" + state.product.id + "-" + state.side + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ----------------------------------------------------------- adapters */

  const MAILTO_ADAPTER = {
    send: function (state, extra, artworkPNG) {
      if (artworkPNG) downloadArtwork(artworkPNG, state);

      const body = buildSpec(state, extra) +
        "\n\nARTWORK\n" +
        "  A PNG of this design has been downloaded to your device.\n" +
        "  Please attach it to this email before sending.\n" +
        "  If you have the original vector or high-resolution file,\n" +
        "  attach that too — it will print sharper.";

      window.location.href = values.emailHref +
        "?subject=" + encodeURIComponent(subjectFor(state, extra)) +
        "&body=" + encodeURIComponent(body);

      return Promise.resolve({
        ok: true,
        message: "Your design has been downloaded and your email app should be opening. " +
                 "Attach the PNG before you send."
      });
    }
  };

  const ENDPOINT_ADAPTER = {
    send: function (state, extra, artworkPNG) {
      const form = new FormData();
      form.append("subject", subjectFor(state, extra));
      form.append("product", state.product.name);
      form.append("color", state.color);
      form.append("quantity", extra.qty);
      if (extra.name)    form.append("name", extra.name);
      if (extra.contact) form.append("contact", extra.contact);
      form.append("spec", buildSpec(state, extra));
      /* The machine-readable form as well, so the design could later be
         reopened in the customizer rather than only read. */
      form.append("design_json", JSON.stringify(state.designs));

      if (artworkPNG) {
        const bin = atob(artworkPNG.split(",")[1]);
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        form.append("artwork", new Blob([buf], { type: "image/png" }),
                    "design-" + state.product.id + ".png");
      }

      return fetch(QUOTE_ENDPOINT, { method: "POST", body: form, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("Endpoint returned " + r.status);
          return { ok: true, message: "Your design is on its way. We'll be in touch with a quote." };
        })
        .catch(function (err) {
          /* Never lose the customer's work to a network failure — fall back
             to the path that cannot fail. */
          console.error("Quote endpoint failed, falling back to email:", err);
          return MAILTO_ADAPTER.send(state, extra, artworkPNG).then(function (r) {
            return { ok: true, message: r.message };
          });
        });
    }
  };

  return {
    send: function (state, extra, artworkPNG) {
      const adapter = QUOTE_ENDPOINT ? ENDPOINT_ADAPTER : MAILTO_ADAPTER;
      return adapter.send(state, extra, artworkPNG);
    },
    buildSpec: buildSpec,
    usingEndpoint: function () { return Boolean(QUOTE_ENDPOINT); }
  };
})();
