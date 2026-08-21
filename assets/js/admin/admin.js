/* Catalogue admin.
 *
 * Everything here runs after a Supabase sign-in and every write goes through
 * row-level security policies that require it (docs/supabase-setup.sql).
 * There is no separate "is this an admin" check in this file because there
 * does not need to be one: an anonymous visitor's client can run this exact
 * code and every write Supabase receives from it will be rejected by policy,
 * the same way this page cannot be secured by hiding its URL.
 *
 * Reads use the same anon key the public site uses; RLS is what makes an
 * authenticated read see draft rows and an anonymous read see only
 * published ones, from one query with no code-side filtering.
 */
(function () {
  "use strict";

  const notConfigured = !SUPABASE_URL || !SUPABASE_ANON_KEY;
  const el = {
    notice:  document.getElementById("adminNotice"),
    login:   document.getElementById("adminLogin"),
    app:     document.getElementById("adminApp"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginNote: document.getElementById("loginNote"),
    whoami: document.getElementById("whoami"),
    signOut: document.getElementById("signOutBtn"),
    newBtn: document.getElementById("newDesignBtn"),
    list: document.getElementById("designList"),
    listStatus: document.getElementById("listStatus"),
    listEmpty: document.getElementById("listEmpty"),
    count: document.getElementById("designCount"),
    modal: document.getElementById("designModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalClose: document.getElementById("modalClose"),
    form: document.getElementById("designForm"),
    name: document.getElementById("fName"),
    slug: document.getElementById("fSlug"),
    description: document.getElementById("fDescription"),
    category: document.getElementById("fCategory"),
    tags: document.getElementById("fTags"),
    garments: document.getElementById("fGarments"),
    colors: document.getElementById("fColors"),
    prices: document.getElementById("fPrices"),
    featured: document.getElementById("fFeatured"),
    published: document.getElementById("fPublished"),
    order: document.getElementById("fOrder"),
    formNote: document.getElementById("formNote"),
    deleteBtn: document.getElementById("deleteBtn"),
    saveBtn: document.getElementById("saveBtn"),
    uploadStatus: document.getElementById("uploadStatus")
  };

  if (notConfigured) { el.notice.hidden = false; return; }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ----------------------------------------------------------- reference */

  const GARMENTS = (typeof COLLECTION_GARMENTS !== "undefined" ? COLLECTION_GARMENTS : ["t-shirts", "hoodies", "long-sleeve"])
    .map(function (id) {
      const p = (typeof PRODUCTS !== "undefined") ? PRODUCTS.filter(function (x) { return x.id === id; })[0] : null;
      return { id: id, name: p ? p.name : id, colors: p ? p.colors : [] };
    });

  /* The three garments share one palette today (verified against
     products.js); built from that data rather than hard-coded, so a future
     garment with a different palette still produces a correct checklist. */
  const ALL_COLORS = Array.from(new Set(GARMENTS.reduce(function (acc, g) { return acc.concat(g.colors); }, [])));

  el.garments.innerHTML = GARMENTS.map(function (g) {
    return '<label class="admin__check"><input type="checkbox" value="' + esc(g.id) + '" data-garment>' +
      '<span>' + esc(g.name) + "</span></label>";
  }).join("");
  el.colors.innerHTML = ALL_COLORS.map(function (c) {
    return '<label class="admin__check"><input type="checkbox" value="' + esc(c) + '" data-color>' +
      '<span>' + esc(c) + "</span></label>";
  }).join("");
  el.category.innerHTML = '<option value="">No category</option>' +
    (typeof COLLECTION_CATEGORIES !== "undefined" ? COLLECTION_CATEGORIES : []).map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.name) + "</option>";
    }).join("");

  /* Price inputs follow whichever garments are checked, so nobody is asked to
     price a garment the design does not even print on. */
  function syncPriceFields() {
    const checked = Array.prototype.map.call(
      el.garments.querySelectorAll('input[data-garment]:checked'), function (i) { return i.value; });
    const existing = {};
    Array.prototype.forEach.call(el.prices.querySelectorAll("input[data-price-for]"), function (i) {
      existing[i.dataset.priceFor] = i.value;
    });
    el.prices.innerHTML = checked.map(function (gid) {
      const g = GARMENTS.filter(function (x) { return x.id === gid; })[0];
      const val = existing[gid] || "";
      return '<label class="admin__price"><span>' + esc(g ? g.name : gid) + '</span>' +
        '<input type="number" min="0" step="0.01" placeholder="0.00" data-price-for="' + esc(gid) + '" value="' + esc(val) + '"></label>';
    }).join("");
  }
  el.garments.addEventListener("change", syncPriceFields);

  el.name.addEventListener("input", function () {
    /* Only auto-fill the slug while editing a design that does not have a
       real one yet; typing a name should not silently overwrite a slug the
       admin already customised. */
    if (el.slug.dataset.auto !== "false") {
      el.slug.value = el.name.value.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
  });
  el.slug.addEventListener("input", function () { el.slug.dataset.auto = "false"; });

  /* -------------------------------------------------------------- upload */

  /* Same downscale-before-upload approach as the customizer's own
     readImageFile(): nobody should upload a 12MB phone photo straight into
     storage when 1600px on the long edge is plenty for a product photo. */
  const UPLOAD_MAX_PX = 1600;
  const uploads = { front: null, back: null, model: null };  // pending Blobs, or "keep" markers
  const existingPaths = { front: "", back: "", model: "" };

  function readAndDownscale(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) { reject(new Error("That file is not an image.")); return; }
      const reader = new FileReader();
      reader.onerror = function () { reject(new Error("That file could not be read.")); };
      reader.onload = function () {
        const img = new Image();
        img.onerror = function () { reject(new Error("That image could not be decoded.")); };
        img.onload = function () {
          const big = Math.max(img.width, img.height);
          const k = big > UPLOAD_MAX_PX ? UPLOAD_MAX_PX / big : 1;
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (blob) {
            if (!blob) { reject(new Error("That image could not be prepared.")); return; }
            resolve({ blob: blob, dataUrl: c.toDataURL("image/jpeg", 0.86) });
          }, "image/jpeg", 0.86);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  ["front", "back", "model"].forEach(function (side) {
    const zone = document.getElementById("up" + side.charAt(0).toUpperCase() + side.slice(1));
    const input = zone.querySelector('input[type="file"]');
    const preview = document.getElementById("prev" + side.charAt(0).toUpperCase() + side.slice(1));

    function handle(file) {
      if (!file) return;
      readAndDownscale(file).then(function (res) {
        uploads[side] = res.blob;
        preview.src = res.dataUrl;
        preview.hidden = false;
        zone.classList.add("has-image");
      }).catch(function (err) {
        el.uploadStatus.textContent = err.message;
      });
    }

    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    input.addEventListener("change", function () { handle(input.files[0]); });
    ["dragover", "dragenter"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("is-over"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("is-over"); });
    });
    zone.addEventListener("drop", function (e) { handle(e.dataTransfer.files[0]); });
  });

  function uploadOne(side, designSlug) {
    const blob = uploads[side];
    if (!blob) return Promise.resolve(existingPaths[side] || "");
    const path = "designs/" + designSlug + "/" + side + "-" + Date.now() + ".jpg";
    return client.storage.from("designs").upload(path, blob, { contentType: "image/jpeg", upsert: true })
      .then(function (res) {
        if (res.error) throw new Error(res.error.message);
        return path;
      });
  }

  /* ------------------------------------------------------------- listing */

  let cache = [];

  function badge(text, kind) {
    return '<span class="admin__badge admin__badge--' + kind + '">' + esc(text) + "</span>";
  }

  function rowHTML(row) {
    const thumb = row.front_image
      ? '<img src="' + esc(client.storage.from("designs").getPublicUrl(row.front_image).data.publicUrl) + '" alt="" loading="lazy">'
      : '<span class="admin__thumb-empty" aria-hidden="true">—</span>';
    return '<li class="admin__row" data-id="' + esc(row.id) + '">' +
        '<span class="admin__thumb">' + thumb + "</span>" +
        '<span class="admin__row-main">' +
          '<span class="admin__row-name">' + esc(row.name) + "</span>" +
          '<span class="admin__row-meta">' +
            (row.published ? badge("Published", "ok") : badge("Draft", "hold")) +
            (row.featured ? badge("Featured", "warn") : "") +
            '<span class="admin__row-slug">/' + esc(row.slug) + "</span>" +
          "</span>" +
        "</span>" +
        '<button type="button" class="btn btn-white btn-sm" data-edit="' + esc(row.id) + '">Edit</button>' +
      "</li>";
  }

  function loadList() {
    el.listStatus.textContent = "Loading...";
    return client.from("designs").select("*").order("display_order", { ascending: true })
      .then(function (res) {
        if (res.error) { el.listStatus.textContent = "Could not load designs: " + res.error.message; return; }
        cache = res.data || [];
        el.list.innerHTML = cache.map(rowHTML).join("");
        el.listEmpty.hidden = cache.length > 0;
        el.count.textContent = cache.length + (cache.length === 1 ? " design" : " designs");
        el.listStatus.textContent = "";
      });
  }

  /* --------------------------------------------------------------- modal */

  let editingId = null;

  function resetForm() {
    editingId = null;
    el.form.reset();
    el.slug.dataset.auto = "true";
    el.modalTitle.textContent = "Add a design";
    el.deleteBtn.hidden = true;
    el.formNote.textContent = "";
    el.uploadStatus.textContent = "";
    Array.prototype.forEach.call(el.garments.querySelectorAll("input"), function (i) { i.checked = false; });
    Array.prototype.forEach.call(el.colors.querySelectorAll("input"), function (i) { i.checked = false; });
    syncPriceFields();
    ["front", "back", "model"].forEach(function (side) {
      uploads[side] = null; existingPaths[side] = "";
      const p = document.getElementById("prev" + side.charAt(0).toUpperCase() + side.slice(1));
      p.hidden = true; p.src = "";
      document.getElementById("up" + side.charAt(0).toUpperCase() + side.slice(1)).classList.remove("has-image");
    });
  }

  function openNew() {
    resetForm();
    if (el.modal.showModal) el.modal.showModal(); else el.modal.setAttribute("open", "");
    el.name.focus();
  }

  function openEdit(id) {
    const row = cache.filter(function (r) { return r.id === id; })[0];
    if (!row) return;
    resetForm();
    editingId = id;
    el.modalTitle.textContent = "Edit design";
    el.deleteBtn.hidden = false;
    el.name.value = row.name || "";
    el.slug.value = row.slug || ""; el.slug.dataset.auto = "false";
    el.description.value = row.description || "";
    el.category.value = row.category || "";
    el.tags.value = (row.tags || []).join(", ");
    el.order.value = row.display_order == null ? 100 : row.display_order;
    el.featured.checked = !!row.featured;
    el.published.checked = !!row.published;
    (row.garments || []).forEach(function (g) {
      const box = el.garments.querySelector('input[value="' + g + '"]'); if (box) box.checked = true;
    });
    (row.colors || []).forEach(function (c) {
      const box = el.colors.querySelector('input[value="' + CSS.escape(c) + '"]'); if (box) box.checked = true;
    });
    syncPriceFields();
    const prices = row.prices || {};
    Object.keys(prices).forEach(function (gid) {
      const input = el.prices.querySelector('input[data-price-for="' + gid + '"]');
      if (input && prices[gid] != null) input.value = (prices[gid] / 100).toFixed(2);
    });
    ["front", "back", "model"].forEach(function (side) {
      const path = row[side + "_image"];
      existingPaths[side] = path || "";
      if (path) {
        const preview = document.getElementById("prev" + side.charAt(0).toUpperCase() + side.slice(1));
        preview.src = client.storage.from("designs").getPublicUrl(path).data.publicUrl;
        preview.hidden = false;
        document.getElementById("up" + side.charAt(0).toUpperCase() + side.slice(1)).classList.add("has-image");
      }
    });
    if (el.modal.showModal) el.modal.showModal(); else el.modal.setAttribute("open", "");
  }

  function closeModal() {
    if (el.modal.close) el.modal.close(); else el.modal.removeAttribute("open");
  }

  el.newBtn.addEventListener("click", openNew);
  el.modalClose.addEventListener("click", closeModal);
  el.modal.addEventListener("click", function (e) { if (e.target === el.modal) closeModal(); });
  el.list.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-edit]");
    if (btn) openEdit(btn.getAttribute("data-edit"));
  });

  /* ---------------------------------------------------------------- save */

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();

    const garments = Array.prototype.map.call(
      el.garments.querySelectorAll("input:checked"), function (i) { return i.value; });
    const colors = Array.prototype.map.call(
      el.colors.querySelectorAll("input:checked"), function (i) { return i.value; });

    if (!el.name.value.trim()) { el.formNote.textContent = "A name is required."; return; }
    if (!el.slug.value.trim()) { el.formNote.textContent = "A URL slug is required."; return; }
    if (!garments.length) { el.formNote.textContent = "Pick at least one garment."; return; }
    if (!colors.length) { el.formNote.textContent = "Pick at least one colour."; return; }

    const prices = {};
    Array.prototype.forEach.call(el.prices.querySelectorAll("input[data-price-for]"), function (i) {
      const dollars = parseFloat(i.value);
      if (!isNaN(dollars) && dollars > 0) prices[i.dataset.priceFor] = Math.round(dollars * 100);
    });

    el.saveBtn.disabled = true;
    el.formNote.textContent = "";
    el.uploadStatus.textContent = uploads.front || uploads.back || uploads.model ? "Uploading photos..." : "";

    const slugForPath = el.slug.value.trim();
    Promise.all([
      uploadOne("front", slugForPath),
      uploadOne("back", slugForPath),
      uploadOne("model", slugForPath)
    ]).then(function (paths) {
      const record = {
        slug: slugForPath,
        name: el.name.value.trim(),
        description: el.description.value.trim(),
        category: el.category.value,
        tags: el.tags.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean),
        garments: garments,
        colors: colors,
        prices: Object.keys(prices).length ? prices : null,
        featured: el.featured.checked,
        published: el.published.checked,
        display_order: parseInt(el.order.value, 10) || 100,
        front_image: paths[0],
        back_image: paths[1],
        model_image: paths[2],
        updated_at: new Date().toISOString()
      };
      if (editingId) record.id = editingId;

      return client.from("designs").upsert(record).select();
    }).then(function (res) {
      if (res.error) {
        /* The slug carries a unique constraint; give that specific case a
           plain-language answer instead of the raw Postgres message. */
        el.formNote.textContent = /duplicate key/i.test(res.error.message)
          ? "That URL slug is already used by another design."
          : res.error.message;
        return;
      }
      closeModal();
      loadList();
    }).catch(function (err) {
      el.formNote.textContent = err.message || "That could not be saved.";
    }).then(function () {
      el.saveBtn.disabled = false;
      el.uploadStatus.textContent = "";
    });
  });

  el.deleteBtn.addEventListener("click", function () {
    if (!editingId) return;
    if (!window.confirm("Delete this design? Customers will no longer see it. This cannot be undone.")) return;
    el.deleteBtn.disabled = true;
    client.from("designs").delete().eq("id", editingId).then(function (res) {
      if (res.error) { el.formNote.textContent = res.error.message; return; }
      closeModal();
      loadList();
    }).then(function () { el.deleteBtn.disabled = false; });
  });

  /* ----------------------------------------------------------------- auth */

  function showApp(session) {
    el.login.hidden = true;
    el.app.hidden = false;
    el.whoami.textContent = session.user.email;
    loadList();
  }

  function showLogin() {
    el.app.hidden = true;
    el.login.hidden = false;
  }

  el.loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    el.loginNote.textContent = "";
    document.getElementById("loginBtn").disabled = true;
    client.auth.signInWithPassword({
      email: el.loginEmail.value.trim(),
      password: el.loginPassword.value
    }).then(function (res) {
      if (res.error) { el.loginNote.textContent = "Incorrect email or password."; return; }
      // onAuthStateChange below handles showing the app.
    }).then(function () { document.getElementById("loginBtn").disabled = false; });
  });

  el.signOut.addEventListener("click", function () { client.auth.signOut(); });

  client.auth.onAuthStateChange(function (event, session) {
    if (session) showApp(session); else showLogin();
  });

  client.auth.getSession().then(function (res) {
    if (res.data && res.data.session) showApp(res.data.session); else showLogin();
  });
})();
