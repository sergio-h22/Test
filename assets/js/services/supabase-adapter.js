/* Supabase-backed catalogue.
 *
 * Read-only: this is the adapter the public site (homepage, shop page) uses
 * to see what the admin tool has published. Nothing here can write. Writes
 * live in admin.js, behind the login gate, which is the whole reason the two
 * are separate files.
 *
 * Self-registers: if SUPABASE_URL and SUPABASE_ANON_KEY are both filled in
 * (services/supabase-config.js), this swaps itself in for the local array the
 * moment it loads. If either is empty, it does nothing and the site keeps
 * reading collection.js exactly as it did before Supabase existed. No page
 * has to know which case it is in.
 */
(function () {
  "use strict";

  if (typeof SUPABASE_URL === "undefined" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  if (typeof supabase === "undefined" || typeof supabase.createClient !== "function") return;
  if (typeof CatalogService === "undefined") return;

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  /* The database speaks snake_case and stores storage paths; the rest of the
     site speaks camelCase and expects assets.front/back/model to already be
     full URLs. That translation happens once, here, so no other file needs
     to know the database's column names. */
  function publicUrl(path) {
    if (!path) return "";
    const r = client.storage.from("designs").getPublicUrl(path);
    return (r && r.data && r.data.publicUrl) || "";
  }

  function fromRow(row) {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || "",
      category: row.category || "",
      tags: row.tags || [],
      garments: (row.garments && row.garments.length) ? row.garments
        : (typeof COLLECTION_GARMENTS !== "undefined" ? COLLECTION_GARMENTS : []),
      colors: row.colors || [],
      prices: row.prices || null,
      featured: !!row.featured,
      published: !!row.published,
      displayOrder: row.display_order == null ? 100 : row.display_order,
      assets: {
        front: publicUrl(row.front_image),
        back: publicUrl(row.back_image),
        model: publicUrl(row.model_image)
      },
      /* Supabase-authored designs are photo products, not hand-built vector
         art: there is no layer editor in the admin form, deliberately, so
         this is always empty for them. A design with a photo renders that
         photo; the vector path in shopRenderPreview() is simply never
         reached for these rows. */
      design: { front: [], back: [] }
    };
  }

  const adapter = {
    listDesigns: function () {
      return client.from("designs").select("*").eq("published", true)
        .order("display_order", { ascending: true })
        .then(function (res) {
          if (res.error) { console.error("Supabase listDesigns:", res.error); return []; }
          return (res.data || []).map(fromRow);
        });
    },

    listFeatured: function () {
      return client.from("designs").select("*")
        .eq("published", true).eq("featured", true)
        .order("display_order", { ascending: true })
        .then(function (res) {
          if (res.error) { console.error("Supabase listFeatured:", res.error); return []; }
          return (res.data || []).map(fromRow);
        });
    },

    getDesign: function (idOrSlug) {
      return client.from("designs").select("*").eq("published", true)
        .or("id.eq." + idOrSlug + ",slug.eq." + idOrSlug)
        .maybeSingle()
        .then(function (res) {
          if (res.error || !res.data) return null;
          return fromRow(res.data);
        });
    },

    /* Garment and colour logic is identical to the local adapter's: it reads
       PRODUCTS, which stays the one source of truth for what a garment is
       called and what it is stocked in, whichever adapter is active. */
    listGarments: function (design) {
      const ids = (design && design.garments) || (typeof COLLECTION_GARMENTS !== "undefined" ? COLLECTION_GARMENTS : []);
      const out = ids.map(function (id) {
        const p = (typeof PRODUCTS !== "undefined")
          ? PRODUCTS.filter(function (x) { return x.id === id; })[0] : null;
        return p ? { id: p.id, name: p.name, colors: p.colors || [] } : null;
      }).filter(Boolean);
      return Promise.resolve(out);
    },

    listColors: function (design, garmentId) {
      return this.listGarments(design).then(function (garments) {
        const g = garments.filter(function (x) { return x.id === garmentId; })[0];
        const stocked = (g && g.colors) || [];
        const wanted = (design && design.colors) || [];
        return wanted.filter(function (c) { return stocked.indexOf(c) > -1; });
      });
    },

    /* prices is {garmentId: cents}, matching the SQL comment in
       docs/supabase-setup.sql. Cents, not dollars, so nothing here does
       fractional currency math; formatting to a display string happens where
       it is shown. */
    getPrice: function (design, garmentId) {
      if (!design || !design.prices) return Promise.resolve(null);
      const cents = design.prices[garmentId];
      return Promise.resolve(cents == null ? null : cents);
    }
  };

  CatalogService.useAdapter(adapter);
})();
