/* PDF artwork.
 *
 * Print shops receive artwork as PDF more often than as anything else, and
 * until now the editor rejected it outright: the file input accepted images
 * only, and a dropped PDF produced "that file is not an image". The product
 * pages meanwhile advertise PDF, because that is what the shop accepts by
 * email. This closes the gap between the two.
 *
 * pdf.js is large, around 1.7MB across the library and its worker, so it is
 * never part of the page load. It is fetched the first time somebody actually
 * hands the editor a PDF, and anybody who only ever uploads a PNG pays
 * nothing for it. The import is cached, so a second PDF costs nothing either.
 *
 * A rendered page becomes an ordinary image layer. Everything downstream, the
 * canvas, undo, the cart, the production export, treats it exactly like any
 * other uploaded artwork, which is why no other part of the engine had to
 * learn what a PDF is.
 */
const CustomizerPDF = (function () {
  "use strict";

  /* Both paths are relative to the document, not to this file: a dynamic
     import() inside a classic script resolves against the page's base URL.
     Every page that loads the customizer sits at the site root, so these
     match the <script src> paths used in the markup. */
  /* Both URLs are derived from this file's own location rather than written
     as literals.
     
     Two different resolution rules apply here and they disagree. A dynamic
     import() inside a classic script resolves against the script's URL, while
     the worker URL pdf.js is handed resolves against the document. Hard-coding
     either one produces a path that is correct on one page and wrong on
     another, and wrong again once the site is served from a subpath, which it
     is: it is published under /Test/ today. Reading currentScript once, while
     this file is still executing, sidesteps the whole question.
     
     A bare specifier is also not an option: "assets/..." with no leading "./"
     is treated as a package name and refuses to resolve at all. */
  const HERE = (function () {
    const self = document.currentScript && document.currentScript.src;
    /* .../assets/js/customizer/pdf.js -> .../assets/ */
    if (self) return new URL("../../vendor/pdfjs/", self).href;
    /* Only reached if the file is loaded in a way that has no currentScript,
       in which case a document-relative guess is the best available. */
    return new URL("assets/vendor/pdfjs/", document.baseURI).href;
  })();

  const LIB = HERE + "pdf.min.mjs";
  const WORKER = HERE + "pdf.worker.min.mjs";

  /* A PDF page is vector. Rasterising it at the print area's own resolution
     would throw away everything that makes it worth sending, so it is
     rendered at a size that still has detail left when the production export
     scales it to 300 DPI. 2000px on the long edge covers a 12in print at
     ~166 DPI, and the low-resolution warning in the engine will say so
     honestly if the customer scales it up beyond that. */
  const RENDER_LONG_EDGE = 2000;

  /* Refuse anything implausible before pdf.js is even fetched. */
  const MAX_BYTES = 40 * 1024 * 1024;

  let libPromise = null;

  function load() {
    if (libPromise) return libPromise;
    libPromise = import(LIB).then(function (mod) {
      const pdfjs = mod.default || mod;
      /* Without this the worker is looked for beside the page, not beside the
         library, and the whole thing silently falls back to running on the
         main thread. */
      pdfjs.GlobalWorkerOptions.workerSrc = WORKER;
      return pdfjs;
    }).catch(function (err) {
      /* Let the next attempt retry rather than caching the failure forever. */
      libPromise = null;
      /* The customer gets something they can act on; the developer gets the
         real reason, which is otherwise completely hidden by the rewrite. */
      if (window.console && console.error) console.error("pdf.js failed to load:", err);
      throw new Error("The PDF reader could not be loaded. Check your connection and try again.");
    });
    return libPromise;
  }

  /* A PDF's first bytes are always %PDF-. Extension and MIME type are both
     supplied by the client and neither is evidence of anything, so the
     contents get the final say before pdf.js is handed the file. */
  function sniff(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = function () { reject(new Error("That file could not be read.")); };
      reader.onload = function () {
        const head = new Uint8Array(reader.result);
        const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
        if (!isPdf) {
          reject(new Error("That file is named like a PDF but is not one."));
          return;
        }
        resolve(true);
      };
      reader.readAsArrayBuffer(file.slice(0, 5));
    });
  }

  function looksLikePDF(file) {
    if (!file) return false;
    if (file.type === "application/pdf") return true;
    return /\.pdf$/i.test(file.name || "");
  }

  function readBuffer(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = function () { reject(new Error("That file could not be read.")); };
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.readAsArrayBuffer(file);
    });
  }

  /* Opens the document and reports how many pages it has, without rendering
     anything. The UI asks which page to use before any pixels are produced,
     which is the difference between one render and forty. */
  function open(file) {
    if (!looksLikePDF(file)) return Promise.reject(new Error("That file is not a PDF."));
    if (file.size > MAX_BYTES) {
      return Promise.reject(new Error("That PDF is larger than 40MB. Please send it to us by email instead."));
    }
    return sniff(file)
      .then(load)
      .then(function (pdfjs) {
        return readBuffer(file).then(function (bytes) {
          return pdfjs.getDocument({ data: bytes }).promise;
        });
      })
      .then(function (doc) {
        return { doc: doc, pages: doc.numPages, name: file.name || "artwork.pdf" };
      })
      .catch(function (err) {
        if (err && /password/i.test(err.message || "")) {
          throw new Error("That PDF is password protected. Please send an unlocked copy.");
        }
        if (err && err.name === "InvalidPDFException") {
          throw new Error("That PDF appears to be damaged and could not be opened.");
        }
        throw err;
      });
  }

  /* Renders one page to a PNG data URL on a transparent background.
     
     A render task is cancellable and the caller is given the task back, which
     is what makes the ordering problem solvable: if somebody uploads a second
     PDF while the first is still rasterising, the first can be cancelled
     outright rather than being allowed to finish and overwrite the newer one. */
  function renderPage(doc, pageNumber) {
    let task = null;
    const promise = doc.getPage(pageNumber).then(function (page) {
      const base = page.getViewport({ scale: 1 });
      const scale = RENDER_LONG_EDGE / Math.max(base.width, base.height);
      const viewport = page.getViewport({ scale: scale });

      const c = document.createElement("canvas");
      c.width = Math.round(viewport.width);
      c.height = Math.round(viewport.height);

      task = page.render({ canvasContext: c.getContext("2d"), viewport: viewport });
      return task.promise.then(function () {
        const out = {
          src: c.toDataURL("image/png"),
          natural: c.width,
          pageNumber: pageNumber
        };
        /* Release the backing store rather than waiting for the collector;
           these canvases are large. */
        c.width = 0; c.height = 0;
        return out;
      });
    });
    return {
      promise: promise,
      cancel: function () { if (task && task.cancel) task.cancel(); }
    };
  }

  return {
    looksLikePDF: looksLikePDF,
    open: open,
    renderPage: renderPage,
    RENDER_LONG_EDGE: RENDER_LONG_EDGE
  };
})();
