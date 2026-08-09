# video/

Drop the hero video files here:

| File | Aspect | Resolution | Target size |
|---|---|---|---|
| `hero.mp4` | 16:9 | 1920×1080 | under 4 MB |
| `hero-mobile.mp4` | 9:16 | 1080×1920 | under 3 MB |
| `hero-poster.jpg` | 16:9 | 1920×1080 | under 200 KB |

Strip the audio track — the video is muted for autoplay, so audio is dead
weight.

Until these exist the hero shows its still design instead. Nothing breaks,
nothing looks unfinished.

Full brief and the generation prompt: [`../docs/hero-video-brief.md`](../docs/hero-video-brief.md)

Once the files are here, switch the slot on by filling in `HERO_VIDEO` near the
top of `assets/js/site.js` — it ships empty so a site without footage makes no
failed requests.
