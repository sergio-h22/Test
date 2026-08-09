# M-Power Print — website

A small static site: home page, searchable product catalog, and a page for
each of the 22 products. No build step, no dependencies, no backend, no
monthly fee. Upload the folder and it works.

```
index.html          home
products.html       catalog — search + category filters
product.html        product detail, driven by ?id=
assets/css/site.css design system, shared by all pages
assets/js/products.js  ← the catalog. Edit this to change products.
assets/js/illustrations.js  product drawings, used until photos arrive
assets/img/         the fist logo, dark and white versions
assets/js/site.js   config, search, forms
photos/             product and hero images (optional)
video/hero.mp4      the hero video
docs/               hero video brief
```

---

## The two files you'll actually edit

### `assets/js/site.js` — contact details

At the top:

```js
const CONFIG = {
  phone:     "(949) 228-1226",
  email:     "sales@m-powerprint.com",
  email2:    "mikey@m-powerprint.com",
  address:   "Southern California",
  instagram: "",
  hours:     ""
};
```

These feed the header, contact panel, quote form and footer on every page at
once. `instagram` and `hours` are empty so those rows are hidden — fill either
in and its row appears by itself. Blank any field and its row disappears
rather than showing an empty label.

### `assets/js/products.js` — the catalog

One array. Add, edit or delete an entry and the catalog, the home page grid,
the product pages, the category counts and the quote form dropdown all update
together. Each entry:

```js
{
  id: "banners",              // becomes product.html?id=banners — keep unique
  name: "Vinyl Banners",
  cat: "signs",               // must match a CATEGORIES id
  photo: "",                  // "photos/banners.jpg" when you have one
  blurb: "One sentence for the grid card.",
  copy: "A paragraph for the product page.",
  specs: [["Material", "Heavy vinyl"], ["Finishing", "Hemmed edges, grommets"]]
}
```

To add a product, copy an existing block and change the fields. To remove one,
delete its block. Nothing else needs touching.

---

## Still to do

**Photos.** Every product currently shows a drawing, not a photograph — see
"Illustrations" below. Real photos are what make this design work. See
[`photos/README.md`](photos/README.md) — start with the six on the home page.

**Pricing.** Every product says "Quote on request". Nothing on this site
quotes a number you haven't given me. Add real figures to the `specs` array
when you want them shown.

**A 9:16 video cut.** The hero video is installed and playing. Phones get the
same 16:9 file cropped to portrait, which works but isn't ideal. Details in
[`docs/hero-video-brief.md`](docs/hero-video-brief.md).

**The original logo artwork.** The fist logo on the site was recovered from a
photograph of your business card. It came out clean, but vector artwork would
be sharper at large sizes — see [`photos/README.md`](photos/README.md).

---

## Illustrations

`assets/js/illustrations.js` holds a drawing for each of the 22 products,
built from the brand palette. They exist so the catalog looks finished before
photography arrives — they are a bridge, not a substitute.

The order of preference for any product image is:

1. a real photo, once `photo` is set in `products.js`
2. that product's illustration
3. a labelled placeholder

So adding a photo needs no other change: set `photo` and the drawing simply
stops being used for that product. Nothing needs deleting.

---

## How things work

**Search** runs in the browser over the product array — instant, no server.
The header search on any page jumps to the catalog with the query applied. The
catalog's own search filters as you type, and every word has to match, so
"vinyl banner" narrows properly.

**The quote form** opens the customer's email app with every field filled in,
addressed to `sales@m-powerprint.com`. A "Get a quote for this" button on a
product page carries that product through and preselects it. No server, no
signup, nothing to maintain.

If you later want submissions delivered straight to your inbox instead, a free
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
endpoint drops into `initQuoteForm()` in `assets/js/site.js`.

## Publishing

- **Netlify Drop** — [app.netlify.com/drop](https://app.netlify.com/drop),
  drag the whole folder in. Live in seconds, free, HTTPS included.
- **GitHub Pages** — Settings → Pages → deploy from branch, `/ (root)`.

Both have a custom-domain setting for pointing `m-powerprint.com` at it.

Upload the **folder**, not just `index.html` — the catalog needs the `assets/`
files alongside it.

## Design notes

Built to the red-and-white direction supplied as a mockup: black utility
header with the wordmark centred, black nav strip, light page, red as the
single accent, capability cards overlapping the hero, a black trust strip, and
a product grid.

Two things from that mockup were deliberately not copied. Its body text was
scrambled placeholder, so the copy here is written from the business card and
the real service list. And several garments in it carried Nike swooshes — a
generation artifact — so no third-party marks appear anywhere on this site.

The previous dark cyan-on-black design is preserved in git history at commit
`534420f` if it's ever wanted back.

Accessibility floor: visible focus rings, semantic landmarks, a skip link,
labelled form fields, live region on the result count, and no horizontal
scrolling down to 320px.
