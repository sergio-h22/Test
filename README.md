# M-Power Print — website

One-page marketing site for M-Power Print. Everything lives in a single
self-contained `index.html`: no build step, no dependencies, no external
requests. Upload that one file anywhere and it works.

---

## 1. Put in your real contact details

Open `index.html`, scroll to the bottom, and edit the `CONFIG` block at the top
of the `<script>` tag:

```js
const CONFIG = {
  phone:     "(000) 000-0000",        /* ← PLACEHOLDER */
  email:     "info@mpowerprint.com",  /* ← PLACEHOLDER */
  instagram: "@mpowerprint",          /* ← PLACEHOLDER */
  address:   "City, ST",              /* ← PLACEHOLDER */
  hours:     "Mon–Sat · 9am–6pm"      /* ← PLACEHOLDER */
};
```

Those five values feed the nav, hero, hero spec bar, contact block, quote form
and footer at once. The phone number is turned into a tappable `tel:` link and
the Instagram handle into a profile URL automatically, so write them however
you want them to read.

## 2. Replace the placeholder pricing

**The prices, minimum quantities and turnaround times in the Services section
are made-up defaults.** Find the three `.ticket` blocks in the markup and put
your real numbers in:

| Service | Fields to check |
|---|---|
| Custom Apparel | Methods · Min qty · Turnaround · From |
| Hats & Embroidery | Methods · Min qty · Turnaround · From |
| Paper & Signage | Finishes · Min qty · Turnaround · From |

Do not publish the site until these are accurate.

## 3. Add photos of real jobs

The six panels in **The Work** are CSS-generated stand-ins. To swap one for a
real photo, put your image in a `photos/` folder next to `index.html`, then
edit that tile:

```html
<figure class="tile" style="margin:0;background-image:url('photos/hoodies.jpg');background-size:cover">
  <figcaption class="tile-cap"><b>Team hoodies</b><span>DTF · 24 pcs</span></figcaption>
</figure>
```

Delete the `<div class="tile-fill …"></div>` line inside that tile when you add
a photo. Landscape images around 1200×900 work best.

---

## How the quote form works

Submitting it opens the customer's own email app with every field already
filled in and addressed to your `CONFIG.email`. No server, no signup, nothing
to maintain — and customers can attach artwork directly in the reply.

The trade-off: it depends on the customer having a mail app set up. If you
later want submissions delivered straight to your inbox instead, a free
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
endpoint drops into the `form.addEventListener("submit", …)` handler.

## Publishing it

Any static host works. Two easy options:

- **Netlify Drop** — go to [app.netlify.com/drop](https://app.netlify.com/drop)
  and drag the folder in. Live in seconds, free, gives you an HTTPS URL.
- **GitHub Pages** — in this repo, Settings → Pages → deploy from branch, pick
  the branch and `/ (root)`.

To point a custom domain like `mpowerprint.com` at it, both hosts have a
"custom domain" setting that walks you through the DNS records.

## Notes on the design

The visual direction comes from the business card: glossy black stock, white
skewed wordmark, concentric-ring motif. Two details carry it through:

- **The gloss.** Panels catch a moving highlight that follows your cursor and
  scroll position, the way the laminated card catches light. Gloss finish is a
  thing the shop sells, so the site demonstrates it. It switches off
  automatically for visitors who have "reduce motion" enabled.
- **Job tickets.** Services are laid out as spec rows — method, minimum,
  turnaround, price — because that is the document a print shop actually runs
  on, rather than generic feature cards.

Accessibility floor: keyboard focus rings on everything, semantic landmarks, a
skip link, labelled form fields, and no horizontal scrolling down to 320px.
