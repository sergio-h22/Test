# Drop 01 — campaign imagery

Ten designs, three garments, one campaign. This file is the brief for the
photography that does not exist yet.

## Why there are no images yet

The Higgsfield account has **1.26 credits on the free plan**. A single
generation costs more than that, and this collection needs roughly thirty
images. Nothing was generated, because attempting it would have consumed the
remaining balance and produced nothing usable.

The site does not suffer for it in the meantime: every card and the modal
render the real artwork on the real garment from `collection.js`, so what a
customer sees is accurate, just drawn rather than photographed. When approved
photography arrives it replaces those renders per design, one at a time.

## Hard rule: nothing is generated at request time

Generation happens here, by hand, before anything ships:

```
prompt  ->  Higgsfield  ->  human review  ->  approve  ->  optimise (WebP)
        ->  commit to /photos/drop-01/  ->  set assets.* in collection.js
```

The site only ever loads finished files. No page calls an image API, and no
customer's visit triggers a generation. `collection.js` holds paths, never
prompts, which is what makes that guarantee structural rather than a promise.

## Where approved files go

```
photos/drop-01/<slug>/product.webp    garment alone, studio
photos/drop-01/<slug>/model-front.webp
photos/drop-01/<slug>/model-back.webp   only where the design has a back print
```

Then set them on the matching design:

```js
assets: {
  front: "photos/drop-01/dragon-ascension/product.webp",
  back:  "photos/drop-01/dragon-ascension/model-back.webp",
  model: "photos/drop-01/dragon-ascension/model-front.webp"
}
```

Target 1600px on the long edge, WebP at quality 80, under 200KB. The existing
`<picture>` pattern in `slot()` is the model to follow: WebP source, JPEG
fallback.

## The campaign look, applied to every prompt

Paste this block into every generation so the ten read as one collection:

> Shot on a full-frame camera with an 85mm lens at f/2.8. Soft large-source
> key from camera left with a subtle fill, clean falloff, no hard specular
> hotspots. Neutral colour grade, slightly desaturated, deep but open
> shadows. Heavyweight 240gsm cotton with visible fabric texture and a
> slightly boxy modern fit. The print sits in the weave, following every fold
> and catching light the way the fabric does; it is ink on cloth, not a
> graphic laid over a photograph. Sharp throughout, no motion blur, no
> vignette, no lens flare.

And the negative block:

> No distorted hands, no warped faces, no extra fingers, no melted
> typography, no illegible lettering, no floating graphic, no plastic skin,
> no watermark, no logo other than the printed design, no visible brand tags.

## Per-design prompts

Each entry gives the subject line. Combine it with the campaign look above.
The artwork itself is described so the render matches what
`collection.js` will actually print — a photograph showing something else is
worse than no photograph.

### 1. Dragon Ascension — `dragon-ascension`
Black heavyweight tee. Chest carries a circular crest with a single Japanese
character at its centre, ringed in red, with DRAGON ASCENSION set beneath in
condensed uppercase. Male model, mid-twenties, natural stance, hands at
sides, concrete underpass, overcast daylight.

### 2. Ronin Legacy — `ronin-legacy`
Navy heavyweight tee. Small crossed-bars mark on the left chest in red with
RONIN beneath in wide-tracked caps. Back carries a large struck roundel.
Female model, mid-twenties, three-quarter turn showing the back print,
studio, seamless mid-grey.

### 3. Kaiju Protocol — `kaiju-protocol`
Black heavyweight tee. Wide red warning panel across the chest with KAIJU in
heavy condensed caps knocked out of it, PROTOCOL 03 in small spaced caps
below. Product-only shot, garment laid flat on matte charcoal, raking light
to show weave.

### 4. Sixth Form — `sixth-form`
White heavyweight tee. SIXTH FORM in condensed caps above six stacked
horizontal rules descending in width, the third rule red. Male model, natural
light, plain interior wall, relaxed posture.

### 5. Union Press — `union-press`
Heather grey heavyweight tee. UNION PRESS in condensed caps above a solid
bar, SOUTHERN CALIFORNIA in small spaced caps beneath. Slight vintage
softening on the print edges. Female model, denim, loading-dock daylight.

### 6. Faded Glory — `faded-glory`
Heather grey heavyweight tee. FADED in condensed caps above a solid red block
with GLORY knocked out of it. Product-only shot on a wooden surface, soft
overhead light, natural creases.

### 7. Midnight Velocity — `midnight-velocity`
Black heavyweight long sleeve. Angled chequer band across the chest with a
large 07 beneath, all set six degrees off horizontal. Male model, night,
underlit by a single warm source, urban.

### 8. Celestial Fallen — `celestial-fallen`
Black heavyweight hoodie. Large struck star on the chest, red star inset
within it, CELESTIAL FALLEN in condensed caps beneath. Female model, hood
down, low-key studio, single soft key.

### 9. Neo Tokyo Signal — `neo-tokyo-signal`
Black heavyweight tee. NEO TOKYO in heavy condensed caps interrupted by three
offset red horizontal bars, SIGNAL LOST small and spaced beneath. Male model,
neon-lit street at night, colour restrained rather than saturated.

### 10. Heavyweight Spirit — `heavyweight-spirit`
White heavyweight hoodie. HEAVY over WEIGHT filling the chest in the heaviest
condensed caps available, short red rule beneath. Back reads SPIRIT at full
width. Product-only shot plus a back-facing model shot, studio, seamless
bone-white.

## Review before publishing

Reject and regenerate on any of: unreadable lettering, artwork that does not
match the design as specified, a print that floats rather than sitting in the
weave, distorted hands or faces, a visible third-party logo or garment tag.

The `published` flag in `collection.js` is the gate. A design with unapproved
imagery either stays on its drawn render or is set `published: false`; it does
not go out with a bad photograph.
