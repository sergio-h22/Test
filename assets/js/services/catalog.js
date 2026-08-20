/* The one place the rest of the site asks about the collection.
 *
 * Every read goes through here and every method returns a Promise, even
 * though the data is currently a local array and could be returned
 * synchronously. That is the whole point: when the catalogue moves to
 * Supabase the calls become network calls, and if callers had been reading
 * COLLECTION directly they would all have to change. This way the swap is
 * confined to the adapter below.
 *
 * There is no Supabase client here and no credentials of any kind. A browser
 * bundle is public, so the only key that could ever appear in it is a
 * publishable anon key paired with row-level security; a service-role key in
 * frontend JavaScript would hand the database to anyone who opened the
 * network tab.
 *
 * ---------------------------------------------------------------------------
 * Intended Supabase shape, when it is connected
 * ---------------------------------------------------------------------------
 *
 *   designs            id (text pk, e.g. dragon-ascension-001), slug (unique),
 *                      name, description, category_id (fk), featured (bool),
 *                      published (bool), display_order (int), artwork (jsonb,
 *                      the front/back layer arrays held here), created_at,
 *                      updated_at
 *
 *   categories         id (text pk), name
 *
 *   design_tags        design_id (fk), tag (text)            -- many to many
 *
 *   garments           id (text pk, matches products.js: t-shirts, hoodies,
 *                      long-sleeve), name, print_area (jsonb),
 *                      physical_inches (jsonb)
 *
 *   colors             id (text pk), name, hex, is_dark (bool)
 *
 *   design_garments    design_id (fk), garment_id (fk)       -- what prints on what
 *   design_colors      design_id (fk), color_id (fk)         -- what it suits
 *
 *   product_variants   id (uuid pk), design_id (fk), garment_id (fk),
 *                      color_id (fk), size (text), price_cents (int),
 *                      currency (text), sku (text unique), active (bool)
 *                      -- price lives here because it varies by garment and
 *                         size, never on the design
 *
 *   design_assets      design_id (fk), kind (enum: front|back|model|thumb),
 *                      storage_path (text), width, height, approved (bool)
 *                      -- approved is what keeps an unreviewed AI render off
 *                         the customer-facing site
 *
 *   orders             id, created_at, customer_email, status, totals
 *   order_items        order_id (fk), variant_id (fk), quantity,
 *                      customization_id (fk), preview_path, production_path
 *   customizations     id (uuid pk), design_id (fk), payload (jsonb),
 *                      schema_version (int), created_at
 *                      -- a customer's edit is a NEW row; the design it
 *                         started from is never written to
 *
 *   admin_users        handled by Supabase auth; the admin surface is gated
 *                      on a role claim, and every write policy checks it
 *
 * Row-level security: designs, categories, garments, colors and approved
 * design_assets are readable by anyone. Everything else, and all writes,
 * require the admin role. orders and customizations are readable only by the
 * account that created them.
 * ---------------------------------------------------------------------------
 */
const CatalogService = (function () {
  "use strict";

  /* Swapping this for a Supabase-backed object is the entire migration. Each
     method keeps its signature and its Promise. */
  const localAdapter = {
    listDesigns: function () {
      if (typeof COLLECTION === "undefined") return Promise.resolve([]);
      const rows = COLLECTION
        .filter(function (d) { return d.published; })
        .slice()
        .sort(function (a, b) { return (a.displayOrder || 0) - (b.displayOrder || 0); });
      return Promise.resolve(rows);
    },

    getDesign: function (idOrSlug) {
      return this.listDesigns().then(function (rows) {
        return rows.filter(function (d) {
          return d.id === idOrSlug || d.slug === idOrSlug;
        })[0] || null;
      });
    },

    /* Garment records come from products.js, which is already the catalogue's
       source of truth for everything the shop sells. The collection names the
       three it prints on; it does not re-describe them. */
    listGarments: function (design) {
      const ids = (design && design.garments) || (typeof COLLECTION_GARMENTS !== "undefined" ? COLLECTION_GARMENTS : []);
      const out = ids.map(function (id) {
        const p = (typeof PRODUCTS !== "undefined")
          ? PRODUCTS.filter(function (x) { return x.id === id; })[0] : null;
        return p ? { id: p.id, name: p.name, colors: p.colors || [] } : null;
      }).filter(Boolean);
      return Promise.resolve(out);
    },

    /* Colours a design can actually be printed on: the intersection of what
       the design was drawn for and what the garment is stocked in. Without the
       intersection a design could offer a colour the blank does not come in. */
    listColors: function (design, garmentId) {
      return this.listGarments(design).then(function (garments) {
        const g = garments.filter(function (x) { return x.id === garmentId; })[0];
        const stocked = (g && g.colors) || [];
        const wanted = (design && design.colors) || [];
        return wanted.filter(function (c) { return stocked.indexOf(c) > -1; });
      });
    },

    /* Returns null when no price has been set, which is the honest answer
       today. Callers must render the absence rather than invent a figure.
       Against Supabase this becomes a product_variants lookup. */
    getPrice: function (design, garmentId, colorId, size) {
      if (!design || !design.prices) return Promise.resolve(null);
      const byGarment = design.prices[garmentId];
      if (byGarment == null) return Promise.resolve(null);
      return Promise.resolve(byGarment);
    }
  };

  let adapter = localAdapter;

  return {
    /* The seam. Hand this a Supabase-backed object with the same methods and
       nothing else in the site changes. */
    useAdapter: function (next) { adapter = next || localAdapter; },

    listDesigns:  function () { return adapter.listDesigns(); },
    getDesign:    function (id) { return adapter.getDesign(id); },
    listGarments: function (d) { return adapter.listGarments(d); },
    listColors:   function (d, g) { return adapter.listColors(d, g); },
    getPrice:     function (d, g, c, s) { return adapter.getPrice(d, g, c, s); },

    listCategories: function () {
      return Promise.resolve(typeof COLLECTION_CATEGORIES !== "undefined" ? COLLECTION_CATEGORIES : []);
    },

    /* Resolves the "@ink" / "@accent" tokens against a garment colour. Kept
       here rather than in the renderer because it is a property of the data,
       and the editor needs the same answer when it loads a design. */
    resolveArtwork: function (design, garmentColor) {
      if (!design) return { front: [], back: [] };
      const dark = (typeof COLLECTION_DARK_GARMENT_COLORS !== "undefined"
        ? COLLECTION_DARK_GARMENT_COLORS : ["Black", "Navy"]).indexOf(garmentColor) > -1;
      const ink = dark ? COLLECTION_INK.onDark : COLLECTION_INK.onLight;
      const map = function (layers) {
        return (layers || []).map(function (l) {
          const copy = JSON.parse(JSON.stringify(l));
          if (copy.fill === "@ink") copy.fill = ink;
          else if (copy.fill === "@accent") copy.fill = COLLECTION_INK.accent;
          return copy;
        });
      };
      return { front: map(design.design.front), back: map(design.design.back) };
    }
  };
})();
