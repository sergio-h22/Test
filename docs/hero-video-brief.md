# Hero video brief

The site has a video slot at the top of the hero, already wired up. It stays
invisible until a real file loads, so the page looks finished either way. Drop
the files in and the hero becomes cinematic with no code changes.

---

## The prompt

Paste this into Sora, Runway, Veo, Kling, or whichever generator you use.

> A blank T-shirt represents an empty canvas. Begin with a simple plain shirt
> suspended in a clean studio space. Slowly reveal the journey from imagination
> to creation: colorful ink particles, light trails, and artistic energy come
> together to form a unique custom design printed onto the fabric. The shirt
> transforms from ordinary to extraordinary, showcasing personalization,
> creativity, and craftsmanship. End with a confident model wearing the
> finished custom T-shirt, smiling and showing the design proudly. Cinematic
> commercial style, realistic fabric movement, premium clothing brand
> aesthetic, smooth transitions, 4K.

### Direction

| | |
|---|---|
| **Duration** | 4–5 seconds |
| **Camera** | Slow push-in with rotation |
| **Style** | Apple / Nike product commercial |
| **Mood** | Premium, creative, trustworthy |
| **Aspect** | 16:9 desktop · 9:16 mobile |

### Worth adding to the prompt

The site is near-black with a cyan accent, and the hero type sits over the
left third of the frame. Two additions will make the footage sit properly in
the page rather than fight it:

- **"dark charcoal studio background, low-key lighting"** — a bright white
  studio will glow through the scrim and hurt the headline's legibility.
- **"subject positioned right of frame, negative space on the left"** — that
  is where the M-POWER PRINT wordmark and buttons sit.

If the ink particles come out cyan-leaning rather than rainbow, the whole page
locks together. Worth one generation to try.

---

## Exporting the files

Generate **two** versions from the same prompt — a 16:9 and a 9:16. Cropping a
16:9 down to phone shape puts the model's head out of frame.

| File | Aspect | Resolution | Target size |
|---|---|---|---|
| `video/hero.mp4` | 16:9 | 1920×1080 | under 4 MB |
| `video/hero-mobile.mp4` | 9:16 | 1080×1920 | under 3 MB |
| `video/hero-poster.jpg` | matches desktop | 1920×1080 | under 200 KB |

**Strip the audio track.** The video is muted — browsers require it for
autoplay — so an audio track is pure download weight.

Size matters more than it looks: this file loads before anyone reads a word,
and a 30 MB hero on a phone connection means people leave before it arrives.
If your export lands over budget, re-encode with H.264 at CRF 26:

```sh
ffmpeg -i input.mp4 -an -c:v libx264 -crf 26 -preset slow -movflags +faststart video/hero.mp4
```

Grab the poster frame from the video itself so the handoff is seamless:

```sh
ffmpeg -i video/hero.mp4 -vframes 1 -q:v 3 video/hero-poster.jpg
```

## Installing them

Put all three files in the `video/` folder, then switch the slot on by
filling in these three lines in `HERO_VIDEO` at the bottom of `index.html`:

```js
const HERO_VIDEO = {
  desktop: "video/hero.mp4",
  mobile:  "video/hero-mobile.mp4",
  poster:  "video/hero-poster.jpg"
};
```

They ship empty on purpose, so a site with no footage yet makes no failed
requests for it. Blank any one of them to turn that piece back off; blank all
three and the hero returns to its still design.

## What the page does with it

- Plays muted, looped, inline — no controls, no sound, no tap needed.
- Picks the 9:16 file under 700px wide, the 16:9 file above.
- Fades a gradient scrim over it so the white headline stays readable.
- Drops the ring motif and gloss sweep back so the type stays loudest.
- Shows the poster frame instead of looping for visitors who have "reduce
  motion" switched on.
- Removes itself silently if a file is missing or fails to load.
