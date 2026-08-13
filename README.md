# M-Power Print — website

A small static site: home page, searchable product catalog, and a page for
each of the 21 products. No build step, no dependencies, no backend, no
monthly fee. Upload the folder and it works.

```
index.html          home
products.html       catalog — search + category filters
product.html        product detail, driven by ?id=
design.html         the customizer — pick, upload, position, quote
assets/css/site.css design system, shared by all pages
assets/js/products.js  ← the catalog. Edit this to change products.
assets/js/illustrations.js  product drawings, used until photos arrive
assets/js/garments.js       garment art + print areas for the customizer
assets/js/customizer/       the customizer: engine, ui, quote
assets/vendor/              Fabric.js (MIT)
assets/img/         the fist logo, dark and white versions
assets/js/site.js   config, FAQ, search, forms, structured data
assets/img/         logo, favicon, link-preview card
photos/             product and hero images (optional)
video/hero.mp4      the hero video
404.html            branded not-found page
sitemap.xml         24 URLs — regenerate if you add products
robots.txt          points crawlers at the sitemap
docs/               hero video brief
```

---

## The two files you'll actually edit

### `assets/js/site.js` — contact details

At the top:

```js
const CONFIG = {
  phone:     "(949) 228-1226",
  email:     "sales@lacamisanegra.com",
  email2:    "mikey@lacamisanegra.com",
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

**Two FAQ answers.** "How long does a job take?" and "Is there a minimum
order?" both say `TODO` in the `FAQ` array in `assets/js/site.js`. Replace them
with your real turnaround and minimums — those two questions stall more orders
than anything else on the site.

**Your real domain.** `SITE_URL` at the top of `assets/js/site.js`, plus
`sitemap.xml` and `robots.txt`, all assume `https://lacamisanegra.com/`. If you
deploy somewhere else, change it in those three places.

**The original logo artwork.** The fist logo on the site was recovered from a
photograph of your business card. It came out clean, but vector artwork would
be sharper at large sizes — see [`photos/README.md`](photos/README.md).

---

## Illustrations

`assets/js/illustrations.js` holds a drawing for each of the 21 products,
built from the brand palette. They exist so the catalog looks finished before
photography arrives — they are a bridge, not a substitute.

The order of preference for any product image is:

1. a real photo, once `photo` is set in `products.js`
2. that product's illustration
3. a labelled placeholder

So adding a photo needs no other change: set `photo` and the drawing simply
stops being used for that product. Nothing needs deleting.

---

## The color customizer

Apparel products (t-shirts, hoodies, polos, hi-vis, uniforms) show a `colors`
array in `products.js`:

```js
colors: ["White", "Black", "Red", "Navy", "Heather Grey"]
```

Add or remove a color there and its swatch appears or disappears on that
product's page — no other file needs touching. `assets/js/illustrations.js`
holds the hex values each swatch name maps to, in `GARMENT_COLORS` (the fabric
shading) and `SWATCH_HEX` (the flat dot color for the button itself).

**T-shirts get a live preview** — the swatch actually recolors the shirt on
screen, with the real logo composited on top. The other four apparel products
show the same swatches, but picking one doesn't repaint their icon: those are
flat line-art illustrations, and tinting a stroke-based icon by swatch would
read as a broken color shift rather than "the garment in that color," so it
isn't attempted. The choice still gets captured — a line under the swatches
confirms it, and it's carried into the quote either way.

Whichever swatch is selected rides along into the quote form automatically:
the "Get a quote in this color" button appends the color to the URL, and the
form pre-fills it into the notes field so it lands in the emailed request.

Products outside apparel (signs, business print, stickers) don't get
swatches — "pick a color" isn't a real choice for a banner or a business
card, so those keep the plain "Get a quote for this" button.

---

## Design your own (the customizer)

`design.html` is the customizer: pick a garment, pick a colour, upload artwork
or add text, position it inside the printable area, design front and back, and
send the result as a quote.

Three files, deliberately separate:

```
assets/js/customizer/engine.js   the canvas and the design state
assets/js/customizer/ui.js       the controls. Holds no state of its own.
assets/js/customizer/quote.js    turning a design into a quote request
assets/vendor/fabric.min.js      Fabric.js (MIT), loaded only on design.html
```

**Positions are stored as a fraction of the print area, not in pixels.** That
is what lets someone switch t-shirt → hoodie without re-uploading: the print
areas are different rectangles, but the fractions still mean something, so the
design re-lays-out instead of landing in the wrong place.

**Adding a product to the customizer** needs no customizer code. In
`products.js` set `customizable: true` and point `art` at a garment shape; in
`garments.js` add the shape and its `PRINT_AREAS` entry. That's it.

### Where uploaded artwork goes — read this one

You cannot attach a file to a `mailto:` link. It is not part of the spec and no
browser supports it, so artwork physically cannot ride along on the mechanism
the rest of the site uses for quotes.

Delivery is therefore an adapter, and right now it uses the free path: the
design is exported as a PNG the customer downloads, and the email carries a
full written spec — product, colour, quantity, and every layer's position, size
and rotation as percentages.

**To get real attachments in your inbox instead**, sign up for
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) and put
the endpoint in one constant:

```js
// assets/js/customizer/quote.js
const QUOTE_ENDPOINT = "https://formspree.io/f/your-id-here";
```

Nothing else changes. If the endpoint ever fails, it falls back to email rather
than losing the customer's work.

---

## Our work (the portfolio)

`PORTFOLIO` at the bottom of `products.js` is empty, and while it is empty the
"Our work" section **removes itself from the page entirely** — no placeholder
tiles. A print shop showing a grid of "photo coming soon" boxes is worse off
than one showing no portfolio at all.

Add one entry with a `photo` and the section appears. Give an entry a `before`
photo as well and its card becomes a drag-to-compare, the same as the shirt on
the home page.

This is the highest-value thing you can add to the site. Photos of your actual
jobs beat every drawing and every generated image on here, because they are the
proof.

---

## Two documents worth reading

- [`docs/higgsfield-visuals.md`](docs/higgsfield-visuals.md) — the exact prompt
  for every marketing image the site would benefit from, in the order I'd
  spend credits on them. Nothing generated yet.
- [`docs/ai-design-assistant.md`](docs/ai-design-assistant.md) — why the AI
  design assistant can't ship on a static site, and the small piece of
  infrastructure that would change that.

---

## Getting found on Google

The site publishes structured data so search engines understand what the
business is, rather than guessing from the text:

| Page | What it declares |
|---|---|
| Home | `LocalBusiness`, `WebSite` (with site search), `FAQPage` |
| Catalog | `ItemList` of all 21 products |
| Each product | `Service` + `BreadcrumbList` |

It is generated in `assets/js/site.js` from the same `CONFIG` and `PRODUCTS`
data the page renders from, so it can never drift out of sync with what
visitors actually see.

**One limit worth knowing.** Because no street address is published, the site
can't appear in Google's local map pack — that needs a verifiable address on a
Google Business Profile. The `areaServed` field carries "Southern California"
instead, which helps ordinary search results but not maps. Adding even just a
city would recover most of the difference.

Products are modelled as `Service` rather than `Product` on purpose: a
`Product` with no price reports a missing-offer error, and everything here is
quote-on-request.

## How things work

**Search** runs in the browser over the product array — instant, no server.
The header search on any page jumps to the catalog with the query applied. The
catalog's own search filters as you type, and every word has to match, so
"vinyl banner" narrows properly.

**The sticky call bar** appears on phones only, pinned to the bottom, because
the phone is how a local shop actually gets work and the number was otherwise
below the fold.

**The hero video** is fetched only once the hero scrolls into view, and is
skipped entirely when the browser reports Save-Data or a 2G/3G connection. It
used to download 2.6 MB on every visit before anything else loaded.

**The quote form** opens the customer's email app with every field filled in,
addressed to `sales@lacamisanegra.com`. A "Get a quote for this" button on a
product page carries that product through and preselects it. No server, no
signup, nothing to maintain.

If you later want submissions delivered straight to your inbox instead, a free
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
endpoint drops into `initQuoteForm()` in `assets/js/site.js`.

## Publishing

- **Netlify Drop** — [app.netlify.com/drop](https://app.netlify.com/drop),
  drag the whole folder in. Live in seconds, free, HTTPS included.
- **GitHub Pages** — Settings → Pages → deploy from branch, `/ (root)`.

Both have a custom-domain setting for pointing `lacamisanegra.com` at it.

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
