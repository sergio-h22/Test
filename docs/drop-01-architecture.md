# Drop 01 — how the collection is put together

What exists today, and what a Supabase migration would actually involve.

## The shape

```
collection.js          the ten designs: identity, artwork, what they print on
services/catalog.js    the only way anything reads them
showcase.js            homepage section, carousel, modal
customizer/ui.js       reads ?collection= and opens the design as a copy
```

Nothing about a design is written twice. The homepage markup contains no
design names, no image paths and no prices; it contains an empty `<ul>` that
`showcase.js` fills from the service. Publishing an eleventh design is an
entry in `collection.js` and nothing else.

## Why every read is a Promise

`CatalogService` returns Promises even though the data is a local array it
could return synchronously. That is the whole point of the file. When the
catalogue moves to Supabase those calls become network calls, and callers that
already await them do not change. Callers reading `COLLECTION` directly would
all have had to be rewritten.

The migration is one object:

```js
CatalogService.useAdapter(supabaseAdapter);   // same five methods, same shapes
```

## Data model

`services/catalog.js` carries the full intended table layout in its header
comment, kept beside the code it describes rather than drifting in a separate
document. The short version:

```
designs ── design_garments ── garments
   │             │
   │        product_variants ── colors      price lives here, per garment
   │             │                          and size, never on the design
   ├── design_assets                        approved flag gates publication
   └── customizations                       one row per customer edit
```

Two decisions worth keeping:

**Price belongs to the variant.** A design does not have a price; a hoodie in
black in large has a price. `getPrice(design, garment, color, size)` already
takes all four arguments even though it currently consults a single object,
so the signature survives the migration.

**A customer edit is a new row.** `customizations` references the design it
started from and never writes to it. That is enforced today too: the editor
receives a deep copy from `resolveArtwork()`, so one customer's changes cannot
reach `collection.js` or any other customer. There is a test for it.

## Security

No Supabase client and no credentials appear anywhere in this repository. A
browser bundle is public; the only key that could ever live in one is a
publishable anon key paired with row-level security. A service-role key in
frontend JavaScript hands over the database to anyone who opens the network
tab.

Read access: designs, categories, garments, colors and **approved** assets are
public. Everything else, and every write, requires the admin role. Orders and
customizations are readable only by the account that created them.

## Admin, when it is built

The fields the dashboard edits already exist on every design, which is what
makes the dashboard a form over this data rather than a rewrite:

| Field | What it controls |
|---|---|
| `name`, `description` | what the card and modal say |
| `slug` | the URL |
| `category`, `tags` | filtering, and the category shown on the card |
| `garments` | which of the three it prints on |
| `colors` | intersected with what each garment is stocked in |
| `prices` | per garment; `null` today, and rendered as absent |
| `assets.front/back/model` | approved photography, once it exists |
| `featured` | eligible for the homepage |
| `displayOrder` | the order it appears in |
| `published` | whether customers see it at all |

`listDesigns()` already filters on `published` and sorts on `displayOrder`, so
unpublishing a design removes it from the homepage with no code change.

The admin surface must sit behind authentication before it exists at all. An
unprotected page that can edit prices and publish products is worse than no
admin page: the site currently has no write path a stranger can reach, and
adding one carelessly would create the first.

## Assets: marketing and production are different files

Marketing images are compressed WebP for the homepage and modal. The
production file is generated separately by `exportProduction()` at 300 DPI,
transparent, print area only. They are never the same file. Sending a
compressed marketing image to a press is the mistake this separation exists to
prevent.

## What is not built

- Supabase itself. No project, no credentials, no client.
- The admin dashboard. The data model is ready; the authenticated surface is not.
- Prices. `prices: null` on all ten. The UI renders the absence honestly.
- Campaign photography. See `drop-01-campaign-prompts.md`; the account has
  1.26 credits and needs roughly thirty images.
- Payments. Checkout is still the existing quote flow.
