# Higgsfield visuals — exact prompts

Every visual the site would benefit from, with the prompt to generate it.

**Nothing here has been generated yet.** Your account is on the free plan with
**8.91 credits**, which is enough to experiment with but not enough for a full
set — a single video typically costs more than the whole balance. So this is
the shopping list, in the order I'd spend on it. Say the word on any line and
I'll run it.

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

## 6. Printing process video (only if you top up credits)

The "watch it get printed" section currently uses CSS/JS animation, which is
free, loads instantly and cannot show anything untrue. A video would be
richer but is the most expensive item here, so it is last.

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
