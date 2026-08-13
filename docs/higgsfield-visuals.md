# Higgsfield visuals — prompts and results

Every visual the site would benefit from, with the prompt that makes it.

## Status: all five stills generated

Generated 13 Aug 2026. **Total cost: 0.75 credits** — 0.15 each, far below the
~6 I had budgeted. Balance went 8.91 → **8.16**, so there is plenty left.

| # | Visual | Size | Job ID |
|---|---|---|---|
| 1 | Shop floor | 2048×1152 | `8246a021-12dd-48fe-a8c3-bfd9bedb1ced` |
| 2 | Folded stack | 2048×1536 | `486ee868-e1cc-455d-9337-57ff95d8c1bf` |
| 3 | Press close-up | 2048×1536 | `f8c2f02d-01a5-4c74-9149-0289bd032456` |
| 4 | Storefront banner | 2048×1152 | `bac9990c-f078-428a-bc24-70d1535e3aa6` |
| 5 | Business cards | 2048×1536 | `c97160a7-3847-4471-8a56-3dce2a1fc2d5` |

All 2048px wide, which is more than enough for every slot on the site.

### Two things worth knowing

**Model:** `z_image`. My first choice was Recraft V4.1, which is the stronger
photoreal model, but it returns `minimum_basic_plan_required` on a free plan
regardless of credit balance. `z_image` has no such gate and costs 0.15 a
shot, so a free account can generate freely. If you ever upgrade, regenerating
these on Recraft at 2k is worth doing.

**The files are not in the repo.** This build environment's network policy
blocks Higgsfield's CDN, so I can generate images but cannot download them.
They are rendered in the chat for you to save.

### Putting them in

Download each, save it into `photos/` with the name below, then set the
matching `photo:` field in `products.js` — the `slot()` fallback switches from
the drawing to the photo automatically, no layout changes.

| Save as | Then set |
|---|---|
| `photos/shop.jpg` | `HERO_VIDEO.poster` in `site.js`, or the `.hero-media` img |
| `photos/apparel.jpg` | `photo:` on `t-shirts` |
| `photos/process.jpg` | how-it-works step 3 (needs a small markup edit — ask me) |
| `photos/banners.jpg` | `photo:` on `banners` |
| `photos/business-cards.jpg` | `photo:` on `business-cards` |

**Check each one before you use it.** These are generated, so look for mangled
lettering and anything that reads as fake. Reject on sight rather than
shipping it — see the rule below.

**Do not wire a `photo:` path before the file exists.** A missing file renders
as a broken image, which is worse than the drawing it replaced.

### More, if you want them

At 0.15 credits each your remaining 8.16 buys roughly **50 more images**. Say
what you want and I'll generate it — variations on any of these, the other
product categories, or seasonal versions.

---

## The rule these follow

Higgsfield is used for **marketing imagery only** — the hero, lifestyle shots,
the printing process. It is never used to render a customer's design on a
garment. That job belongs to the customizer, which draws the artwork exactly
where it will print. An AI impression of "a logo on a shirt" would be a
picture of a promise rather than a preview of the order.

Two things to reject on sight in any generation: **fake text** (AI reliably
mangles lettering, and a print shop's marketing showing garbled type is fatal)
and **any third-party logo**. Your existing site already avoids the second —
the design mockups you were sent carried Nike swooshes and none of them made
it in.

---

## 1. Hero background — the shop floor (highest value)

Replaces `video/hero.mp4`, or gives it a poster frame. This is the one that
changes the site's whole first impression.

> Wide cinematic shot of a small commercial screen-printing shop interior,
> mid-morning light through high windows, a manual six-station carousel press
> in the middle ground with a freshly printed shirt on the platen, stacks of
> folded blank tees in muted colours on steel shelving behind, ink buckets and
> squeegees on a worn steel work table in soft foreground blur, shallow depth
> of field, warm neutral colour grade, photojournalistic, natural light only,
> no people, no visible text or logos, 16:9

**Why no people:** faces and hands are where AI generation most visibly fails,
and a shop interior reads as authentic without them.

---

## 2. Folded-stack product shot

For the apparel category card and the top of the catalogue.

> Overhead flat-lay of four neatly folded blank t-shirts stacked in a stepped
> row on a pale concrete surface, colours white, black, navy and heather grey,
> soft even diffused studio light, subtle fabric texture and weave visible,
> minimal shadow, muted neutral palette, no branding, no text, no logos,
> commercial product photography, 4:3

---

## 3. Press mid-run, close

For "how it works" step 3, or the before/after section.

> Extreme close-up of a screen-printing squeegee pulling red ink across a mesh
> screen onto a white cotton t-shirt, ink texture and mesh weave sharp in
> focus, motion suggested but frozen, shallow depth of field, industrial
> lighting, no hands or people in frame, no text, 3:2

---

## 4. Banner on a storefront

For the signs category.

> Exterior daylight photograph of a blank vinyl banner hung across a small
> commercial storefront with grommets and taut edges, plain unmarked banner
> surface, clean modern shopfront, overcast soft light, straight-on
> composition, photorealistic, no text on the banner, no signage, no logos,
> 16:9

**Note the deliberate "blank":** a generated banner with generated text would
show garbled lettering. A clean blank banner is both safer and more useful —
it reads as "your message here".

---

## 5. Business card stack, macro

For the business print category.

> Macro photograph of a stack of blank heavy-stock business cards at a slight
> angle on a dark matte surface, edges crisp and visible showing card
> thickness, one card fanned slightly off the stack, raking light picking up
> the paper texture and a soft spot-gloss sheen, shallow depth of field,
> premium commercial product photography, no text, no logos, 3:2

---

## 6. Printing process video (not generated)

The "watch it get printed" section currently uses CSS/JS animation, which is
free, loads instantly and cannot show anything untrue. Video is priced very
differently from these stills — the five above came to 0.75 credits between
them, where a single clip would take a large share of what is left. Not
generated on my own initiative for that reason; say the word and I'll price it
properly first.

> Slow push-in on a screen-printing carousel as a squeegee pulls ink across a
> screen onto a blank white t-shirt, the platen rotating one station, warm
> workshop light, shallow depth of field, no people, no text, no logos,
> seamless loop, 8 seconds, 16:9

---

## Where each one goes

| Visual | File / place | Replaces |
|---|---|---|
| 1. Shop floor | `video/hero.mp4` or `HERO_VIDEO.poster` in `site.js` | current hero video |
| 2. Folded stack | `photos/apparel.jpg` → `photo:` on an apparel product | its illustration |
| 3. Press close-up | `photos/process.jpg`, how-it-works step 3 | nothing yet |
| 4. Banner | `photos/banners.jpg` → `photo:` on `banners` | its illustration |
| 5. Cards | `photos/business-cards.jpg` → `photo:` on `business-cards` | its illustration |
| 6. Process video | "watch it get printed" section | CSS animation |

Setting `photo:` on any product in `products.js` is all it takes — the
`slot()` fallback chain switches from the drawing to the photo automatically,
with no layout changes. See `photos/README.md`.

---

## What real photography still beats all of this

Generated imagery is a bridge, exactly like the illustrations are. For a local
print shop, **photos of your actual work beat any generated image**, because
they are the proof. The portfolio section (`PORTFOLIO` in `products.js`) is
built and waiting — it hides itself until you add real jobs, and the moment
you add one it appears.

If you shoot nothing else, shoot the before/after pair: one blank garment, one
printed, same camera position, same light. That single pair drives the
strongest section on the home page.
