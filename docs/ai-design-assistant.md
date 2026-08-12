# AI design assistant — what it would take

The brief asks for an assistant where a customer types *"a funny 30th birthday
shirt for Marcus"* and gets design concepts they can drop straight into the
customizer. It also says, correctly, **not to implement it with fake buttons.**

So: it is buildable, it is genuinely good, and **it cannot ship on this site as
it currently stands.** Here is exactly why, and what changes that.

---

## The blocker

This site is static — HTML, CSS and JavaScript served as files, no server of
its own. That is a real strength: nothing to maintain, nothing to patch, no
monthly bill, and it can be hosted free.

But every image-generation API needs a **secret key**, and on a static site
there is nowhere to put one. Anything the browser can read, a visitor can
read: opening developer tools, or just viewing source, exposes it. A leaked
key gets used by strangers and billed to you until you notice.

There is no clever way around this. Obfuscating the key, splitting it, fetching
it at runtime — all of it ships the secret to the browser eventually. **The key
has to live somewhere the customer's browser cannot reach.**

---

## What makes it possible

One small piece of server, whose only job is to hold the key and pass requests
through. The customer's browser talks to it; it talks to the AI provider.

Three ways to get one, cheapest first:

**1. A serverless function** — Netlify Functions or Cloudflare Workers, ~30
lines. Both have free tiers that comfortably cover a local shop's traffic. If
you deploy to Netlify (which `README.md` already recommends), this is a folder
you drop in beside the site. Nothing else about the site changes.

**2. Higgsfield's own hosted option** — you already have an account. Worth
checking whether their hosted endpoints can be called with a
restricted-by-domain key, which would remove the need for a proxy.

**3. A full backend** — overkill here, and it would forfeit the "no server, no
monthly fee" property that makes this site cheap to own.

**Recommendation: option 1.** It is the smallest change that makes the feature
honest, and it costs nothing at your volume.

---

## What it would cost to run

Two costs, and the second is the one that bites.

**Generation** is per image. A customer who types a prompt, dislikes the
result, and tries eight more variations has spent eight times what you
expected. So it needs a limit — a few generations per visitor per day — which
the proxy is also the right place to enforce. That limit is a business
decision, not a technical one, and I'd want your number rather than a
guessed one.

**Abuse** is the reason the limit matters. A public endpoint that generates
images on demand, with no throttle, is an invitation. The proxy handles rate
limiting, blocks requests that did not come from your domain, and caps spend.

---

## What I'd build, once a proxy exists

In priority order, because the first one is worth more than the rest combined:

1. **Remove background** — a customer uploads a logo on a white square and it
   prints with a white box around it. This is the single most common artwork
   problem a print shop deals with, it is cheap, and the result is
   unambiguously correct or not. Highest value by a distance.
2. **Make print-ready** — flag low-resolution uploads before they reach the
   press, and upscale where it helps. Prevents the bad-proof conversation.
3. **Generate a design** — the headline feature. Prompt in, several concepts
   back, pick one, it lands in the customizer as a normal layer.
4. **Improve image** — sharpen and clean up a photographed or screenshotted
   logo.

The customizer is already built to receive these: every design object is a
layer with a source image, so a generated result drops in exactly where an
uploaded file does. **No customizer changes are needed** — only the proxy and
the buttons that call it.

---

## Meanwhile

The gap this feature fills — *"I don't have artwork"* — is already covered, by
a human. The **"We'll design it for you"** path on the home page and inside the
customizer sends that customer to you with a filled-in brief instead of losing
them.

That is worth keeping even after an AI assistant exists. Plenty of people want
a person to do it, and for a local shop that is a selling point rather than a
shortcoming.

---

## What I need from you to build it

1. Where the site will be deployed (Netlify, Cloudflare Pages, something else)
   — it decides which proxy to write.
2. Which provider — your existing Higgsfield account, or another.
3. Your generations-per-visitor limit.

With those three, the proxy and the four tools above are a contained piece of
work. Without them, anything I put on the page would be a button that cannot
work, which the brief rightly rules out.
