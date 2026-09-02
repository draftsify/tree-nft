# Tree

Front-end for a collectible NFT project. Each token is a unique digital tree, a
fixed share of every mint is sent to reforestation partners, and each donation
is published with its transaction hash.

**This repository contains the interface only.** No contract is deployed, no
mint is live, no donation has been made and no partnership agreement is signed.
Every figure in the application is placeholder data, and the interface labels it
as such rather than relegating the disclosure to this file.

---

## Routes

| Route         | Contents                                                                        |
| ------------- | ------------------------------------------------------------------------------- |
| `/`           | Landing page: overview, scroll-driven evolution section, mint economics, species, rarity, FAQ |
| `/collection` | Genesis Forest grid with species, rarity and stage filters, plus sorting          |
| `/tree/[id]`  | A single token: attributes, stage progress, and the append-only funding record    |
| `/mint`       | Mint flow with a simulated wallet handshake, and the full specification           |
| `/impact`     | Public ledger: donations with transaction hashes, project register, and method     |
| `/forest`     | Holder view, gated on a simulated wallet connection                               |
| `/admin`      | Verification console: how a partner report becomes a stage change                 |

## Artwork

Six specimen trees, each photographed the same way: isolated, straight on,
against a seamless white studio ground. Oak, Pine, Sakura, Maple, Redwood and
Baobab are genuinely different trees rather than one silhouette recoloured.

Each is separated from its background by script: a flood fill from the frame
removes the backdrop and its cast shadow, then alpha is derived from how much
the subject darkens or tints what sits behind it, with the edge colour
unmultiplied so no white fringe survives on a dark ground. See
`public/species/`.

The hero and the evolution section divide the cutout into 16 vertical strips and
drift them independently on scroll (`src/components/ScrollTree.tsx`). Strip
geometry is computed in whole pixels from a measured width, since percentage
values leave sub-pixel gaps that render as pale vertical lines across the canopy.
Each strip is driven by its own MotionValue so that scrolling does not trigger a
React re-render.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, with tokens defined in `src/app/globals.css`
- `motion` for scroll-linked and entrance animation, `lenis` for smooth scrolling
- Bricolage Grotesque for display type, DM Sans for text

All rendered data comes from `src/lib/data.ts`. Replacing that module with a
contract read and an indexer is the intended next step; no component depends on
where its data originates. `src/components/WalletProvider.tsx` is likewise a
stand-in with a deliberately small surface, so that wagmi or RainbowKit can
replace the file without changes to any consumer.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Open decisions

The following are unresolved, and the interface states as much where relevant:

- Cost per tree is unknown, as no partner has confirmed a figure. The interface
  shows a dash rather than an estimate.
- Chain, mint price and revenue split are drafts pending the contract.
- The royalty rate on secondary sales is not fixed.
- Verification of planting reports requires a second, independent reader.

## Scope

A Tree token is a collectible with a funding record attached. It carries no
yield, no revenue share, no buyback and no claim about resale value. Nothing in
this repository constitutes an offer or financial advice.
