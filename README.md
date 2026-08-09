# M-Power Print — website

One-page marketing site for M-Power Print. Everything lives in a single
self-contained `index.html`: no build step, no dependencies, no external
requests. Upload that one file anywhere and it works.

Contact details and the service list are live and correct, taken from the
business card. Two things still need your input — see below.

---

## Still to do

### 1. Pricing

Every service says **"Quote on request"**. That is deliberate — no invented
numbers went onto this site. When you want real figures shown, find the
`Pricing` label inside each `.ticket` block and replace the text:

```html
<div><b>Pricing</b><span>Quote on request</span></div>
<!--                     ↑ e.g. "From $45 / 100" -->
```

You can also add more spec columns (minimum quantity, turnaround) the same
way — the row is a grid and will re-flow on its own.

### 2. Photos of real jobs

The six panels in **The Work** are CSS-generated stand-ins. To swap one for a
real photo, put your image in a `photos/` folder next to `index.html`, then
edit that tile:

```html
<figure class="tile" style="margin:0;background-image:url('photos/banner.jpg');background-size:cover">
  <figcaption class="tile-cap"><b>Vinyl banners</b><span>Large format</span></figcaption>
</figure>
```

Delete the `<div class="tile-fill …"></div>` line inside that tile when you add
a photo. Landscape images around 1200×900 work best.

---

## Editing contact details

At the top of the `<script>` near the bottom of `index.html`:

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

These feed the nav, hero, hero spec bar, contact panel, quote form and footer
at once. The phone number becomes a tappable `tel:` link and the Instagram
handle becomes a profile URL automatically, so write them however you want
them to read.

**`instagram` and `hours` are empty, so those rows are hidden.** Fill either
one in and its row appears by itself — no other edits needed. That works for
any field: blank it out and the row disappears rather than showing an empty
label.

Adding a street address is just a matter of putting it in `address`.

## How the quote form works

Submitting it opens the customer's own email app with every field already
filled in and addressed to `sales@m-powerprint.com`. No server, no signup,
nothing to maintain — and customers can attach artwork directly in the reply.

The trade-off: it depends on the customer having a mail app set up. If you
later want submissions delivered straight to the inbox instead, a free
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)
endpoint drops into the `form.addEventListener("submit", …)` handler.

## Publishing it

Any static host works. Two easy options:

- **Netlify Drop** — go to [app.netlify.com/drop](https://app.netlify.com/drop)
  and drag the folder in. Live in seconds, free, gives you an HTTPS URL.
- **GitHub Pages** — in this repo, Settings → Pages → deploy from branch, pick
  the branch and `/ (root)`.

To point `m-powerprint.com` at it, both hosts have a "custom domain" setting
that walks you through the DNS records.

## Notes on the design

The visual direction comes from the business card: glossy black stock, white
skewed wordmark, concentric-ring motif. Two details carry it through:

- **The gloss.** Panels catch a moving highlight that follows your cursor and
  scroll position, the way the laminated card catches light. Gloss finish is a
  thing the shop sells, so the site demonstrates it. It switches off
  automatically for visitors who have "reduce motion" enabled.
- **Job tickets.** Services are laid out as spec rows — what's included,
  artwork accepted, pricing — because that is the document a print shop
  actually runs on, rather than generic feature cards.

The seventeen products on the card are grouped into four tickets: Signs &
Banners, Cards & Marketing, Stickers & Labels, and Custom Apparel. The card's
"and much more!" is carried by the line underneath them.

Accessibility floor: keyboard focus rings on everything, semantic landmarks, a
skip link, labelled form fields, and no horizontal scrolling down to 320px.
