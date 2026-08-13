/* ==========================================================================
   M-Power Print — saved designs and cart
   --------------------------------------------------------------------------
   Why this is not just localStorage
   ---------------------------------
   A saved design carries its uploaded artwork inline as a base64 data URL.
   One phone photo, downscaled to the engine's 1600px ceiling, is comfortably
   over a megabyte of string. localStorage caps at roughly 5MB for the whole
   origin and throws QuotaExceededError when it is full — so a customer with
   two photos on a design would hit a hard failure at the moment they tried to
   save, which is the worst possible time.

   IndexedDB has no practical ceiling for this and stores structured data
   without stringifying. It is asynchronous and slightly more code, which is
   the entire cost.

   localStorage remains as the fallback for browsers where IndexedDB is
   unavailable or blocked (Safari private mode historically). It stores the
   same records and will fail on large designs — but a working save for small
   designs beats no save at all, and the caller is told when a write fails
   rather than being left to assume it worked.

   Nothing here talks to a server. The site is static; this is browser-local
   until a backend exists. See ORDER SUBMISSION in the customizer notes.
   ========================================================================== */

const CustomizerStore = (function () {

  const DB_NAME = "mpower-designs";
  const DB_VERSION = 1;
  const STORE_DESIGNS = "designs";
  const STORE_CART = "cart";

  /* Mirrors of the same two stores, used only when IndexedDB is unavailable. */
  const LS_DESIGNS = "mpower.designs.v1";
  const LS_CART = "mpower.cart.v1";

  let dbPromise = null;
  let useFallback = false;

  function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) { reject(new Error("no indexedDB")); return; }

      let req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { reject(e); return; }

      req.onupgradeneeded = function () {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_DESIGNS)) {
          db.createObjectStore(STORE_DESIGNS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_CART)) {
          db.createObjectStore(STORE_CART, { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("indexedDB open failed")); };
      /* Private-mode Safari has historically opened the request and then
         never settled it. Without this the first save would hang forever
         with no error to report. */
      window.setTimeout(function () { reject(new Error("indexedDB timed out")); }, 2500);
    }).catch(function (err) {
      useFallback = true;
      console.warn("Saved designs are using localStorage:", err && err.message);
      return null;
    });

    return dbPromise;
  }

  /* ------------------------------------------------------------- fallback */

  function lsRead(key) {
    try { return JSON.parse(window.localStorage.getItem(key) || "[]"); }
    catch (e) { return []; }
  }

  function lsWrite(key, rows) {
    try {
      window.localStorage.setItem(key, JSON.stringify(rows));
      return true;
    } catch (e) {
      /* Almost always QuotaExceededError with artwork attached. Reported
         rather than swallowed so the UI can tell the customer their design
         was not saved instead of letting them believe it was. */
      throw new Error("There is not enough browser storage to save this design. " +
                      "Removing a large uploaded image will help.");
    }
  }

  /* ----------------------------------------------------------------- core */

  function tx(storeName, mode, fn) {
    return openDB().then(function (db) {
      if (!db) return null;                       /* fallback path */
      return new Promise(function (resolve, reject) {
        const t = db.transaction(storeName, mode);
        const store = t.objectStore(storeName);
        const req = fn(store);
        t.oncomplete = function () { resolve(req ? req.result : undefined); };
        t.onerror = function () { reject(t.error); };
        t.onabort = function () { reject(t.error || new Error("write aborted")); };
      });
    });
  }

  function allFrom(storeName, lsKey) {
    return openDB().then(function (db) {
      if (!db) return lsRead(lsKey);
      return new Promise(function (resolve, reject) {
        const t = db.transaction(storeName, "readonly");
        const req = t.objectStore(storeName).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () { return lsRead(lsKey); });
  }

  function putInto(storeName, lsKey, record) {
    return openDB().then(function (db) {
      if (!db) {
        const rows = lsRead(lsKey).filter(function (r) { return r.id !== record.id; });
        rows.push(record);
        lsWrite(lsKey, rows);
        return record.id;
      }
      return tx(storeName, "readwrite", function (store) {
        return store.put(record);
      }).then(function () { return record.id; });
    });
  }

  function removeFrom(storeName, lsKey, id) {
    return openDB().then(function (db) {
      if (!db) {
        lsWrite(lsKey, lsRead(lsKey).filter(function (r) { return r.id !== id; }));
        return;
      }
      return tx(storeName, "readwrite", function (store) { return store.delete(id); });
    });
  }

  function newId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" +
           Math.random().toString(36).slice(2, 7);
  }

  return {

    /* --------------------------------------------------------- designs */

    /* One in-progress design per product, keyed by product id: returning to
       the same product restores what you were doing, and designing a
       different product does not overwrite it. */
    saveDesign: function (state, extra) {
      const record = {
        id: "wip-" + state.product.id,
        kind: "wip",
        savedAt: Date.now(),
        productId: state.product.id,
        productName: state.product.name,
        color: state.color,
        side: state.side,
        designs: state.designs,
        options: (extra && extra.options) || {},
        qty: (extra && extra.qty) || null
      };
      return putInto(STORE_DESIGNS, LS_DESIGNS, record).then(function () { return record; });
    },

    loadDesign: function (productId) {
      return allFrom(STORE_DESIGNS, LS_DESIGNS).then(function (rows) {
        return rows.find(function (r) { return r.id === "wip-" + productId; }) || null;
      });
    },

    clearDesign: function (productId) {
      return removeFrom(STORE_DESIGNS, LS_DESIGNS, "wip-" + productId);
    },

    listDesigns: function () {
      return allFrom(STORE_DESIGNS, LS_DESIGNS).then(function (rows) {
        return rows.sort(function (a, b) { return b.savedAt - a.savedAt; });
      });
    },

    /* ------------------------------------------------------------ cart */

    /* A cart line keeps the whole design, not a reference to it: the customer
       may keep editing the same product afterwards, and the thing they added
       to the cart must not change underneath them. */
    addToCart: function (state, extra) {
      const record = {
        id: newId("item"),
        addedAt: Date.now(),
        productId: state.product.id,
        productName: state.product.name,
        color: state.color,
        options: (extra && extra.options) || {},
        qty: (extra && extra.qty) || 1,
        designs: state.designs,
        /* A flattened preview so the cart can show the design without
           reloading Fabric and re-rendering every line. */
        preview: (extra && extra.preview) || null
      };
      return putInto(STORE_CART, LS_CART, record).then(function () { return record; });
    },

    listCart: function () {
      return allFrom(STORE_CART, LS_CART).then(function (rows) {
        return rows.sort(function (a, b) { return a.addedAt - b.addedAt; });
      });
    },

    removeFromCart: function (id) {
      return removeFrom(STORE_CART, LS_CART, id);
    },

    clearCart: function () {
      return openDB().then(function (db) {
        if (!db) { lsWrite(LS_CART, []); return; }
        return tx(STORE_CART, "readwrite", function (store) { return store.clear(); });
      });
    },

    cartCount: function () {
      return this.listCart().then(function (rows) { return rows.length; });
    },

    /* True once a fallback has actually been selected. The UI uses this to
       warn about storage limits only where they genuinely apply. */
    isFallback: function () { return useFallback; }
  };
})();
