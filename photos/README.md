# photos/

Every image on the site is optional. Where a photo is missing you get a
labelled slot instead — a deliberate-looking panel, not a broken image. Add
photos whenever you have them and the slots fill in.

## Product photos

Open `assets/js/products.js`, find the product, and set its `photo` field:

```js
{
  id: "banners", name: "Vinyl Banners", cat: "signs",
  photo: "photos/banners.jpg",        // ← was ""
  ...
}
```

That one edit updates the catalog card, the home page grid, the product page
and any "related products" strip at once.

**Target size:** landscape, around 1200×900, under 300 KB each. Shoot the
product against a plain wall or floor — consistency across the grid matters
more than any single shot being perfect.

The 22 products and the filenames worth using:

| Category | Products |
|---|---|
| Signs & Large Format | `banners` `yard-signs` `foam-boards` `window-vinyls` `posters` `signs` |
| Business Print | `business-cards` `flyers` `postcards` `menus` `letterhead` `envelopes` `catalogs` |
| Stickers & Labels | `stickers` `labels` `magnets` |
| Custom Apparel | `t-shirts` `hoodies` `polos` `caps` `hi-vis` `uniforms` |

Start with the six that show on the home page — banners, business cards,
stickers, t-shirts, yard signs, foam boards. Those carry the first impression.

## Home page hero

Two separate things, both optional.

**Background** — a wide shot of the shop floor or a press mid-run. Add it to
the `.hero-media` div in `index.html`:

```html
<div class="hero-media">
  <img src="photos/shop.jpg" alt="">
  ...
</div>
```

Landscape, at least 1920 wide, under 500 KB. A white text scrim sits over the
left side automatically, so a busy or dark photo still works.

**Collage** — the five slots on the right of the hero. Replace any slot's
inner `<span class="slot-label">…</span>` with an `<img>`:

```html
<div class="slot slot-ratio"><img src="photos/polo.jpg" alt="Embroidered polo"></div>
```

Square crops, around 800×800.

## The before / after shirt

The home page has a draggable slider showing a blank shirt turning into a
printed one. Both sides are drawings right now. To use real photos, put two
shots in this folder and swap each pane's `<svg>` in `index.html` for:

```html
<img src="photos/shirt-blank.jpg" alt="Blank white t-shirt">
<img src="photos/shirt-printed.jpg" alt="The same shirt printed with the M-Power Print logo">
```

**Shoot both from exactly the same spot** — same camera position, same
distance, same lighting, shirt in the same place. The whole effect depends on
the two images lining up as the divider moves. A tripod and one press job is
all it takes: photograph the blank, print it, photograph it again without
moving anything.

## A note on what not to use

Do not use photos of garments carrying another company's logo — a Nike swoosh
on a blank you're selling is someone else's trademark and it does not belong
on your site. Shoot your own blanks, or use licensed stock of unbranded
apparel.
