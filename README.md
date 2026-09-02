# Tree

Interface for a collectible-NFT project whose premise is a receipt: you mint a
unique digital tree, a fixed share of the mint is routed to reforestation, and
the donation transaction is published where anyone can check it.

**This repository is the UI only.** No contract is deployed, no wallet
transaction is live, no donation has been made and no charity partnership is
signed. Every number in the app is placeholder data, labelled as such in the
interface rather than only in this file.

---

## What is here

| Route          | What it shows                                                                 |
| -------------- | ----------------------------------------------------------------------------- |
| `/`            | Landing page: thesis, the scroll-driven evolution section, mint economics, species, rarity, FAQ |
| `/collection`  | Genesis Forest grid with species / rarity / stage filters and sorting          |
| `/tree/[id]`   | A single token: attributes, stage rail, and the append-only impact history     |
| `/mint`        | Mint flow with a simulated wallet handshake, plus the full specification       |
| `/impact`      | Public ledger: donations with transaction hashes, project register, method     |
| `/forest`      | Holder view — gated on a (fake) wallet connection                              |
| `/admin`       | The verification console, published deliberately: how a partner report becomes a stage change |

## The artwork

One photographed cast-glass oak, cut out of its studio background with a script
(`flood fill from the frame to take the backdrop and its cast shadow, then alpha
from how much the sculpture darkens or tints what is behind it`). Because the
subject is glass, the alpha is deliberately partial: highlights stay translucent
rather than being punched out as white, so the page shows through the leaves.
Each species is that same file under a hue rotation — see `public/species/`.

The hero and the evolution section slice the cut-out into 16 vertical strips
and drift them independently as you scroll — see `src/components/ScrollTree.tsx`.
Strip geometry is computed in whole pixels from a measured width; percentage
maths leaves sub-pixel gaps that render as pale vertical lines across the canopy.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4, tokens defined in `src/app/globals.css`
- `motion` for scroll-linked and enter animations, `lenis` for smooth scrolling
- Bricolage Grotesque (display) + DM Sans (text)

Everything the app renders comes from `src/lib/data.ts`. Swapping that module
for a contract read and an indexer is the intended next step — no component
knows where its data came from. `src/components/WalletProvider.tsx` is likewise
a stand-in with the smallest surface I could give it, so wagmi or RainbowKit
can replace the file without touching a consumer.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Decisions still open

These are unresolved on purpose, and the UI says so where it matters:

- No cost-per-tree figure, because no partner has confirmed one. The interface
  shows a dash rather than an estimate.
- Chain, mint price and revenue split are drafts pending the contract.
- Royalty rate on secondary sales is not fixed.
- Planting-report verification needs a second, independent reader.

## Not what this is

A Tree is a collectible with a funding record attached. There is no yield, no
revenue share, no buyback and no claim about resale value. Nothing in this
repository should be read as an offer or as financial advice.
