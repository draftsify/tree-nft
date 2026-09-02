# Tree

Front-end for a collectible NFT project. Each token is a unique digital tree, a
fixed share of every mint is sent to reforestation partners, and each donation
is published with its transaction hash.

**Nothing is deployed.** No contract is live, no mint has happened, no donation
has been made and no partnership agreement exists. Every impact figure on the
site is zero because zero has happened, and the site says so on the page rather
than relegating the disclosure to this file.

What is here: the full interface, the ERC-721 (`contracts/contracts/Tree.sol`),
the fee harvester (`contracts/contracts/ReserveHarvester.sol`) and 22 tests
covering both. What is missing before a mint can happen is in **Where this
stands** below.

---

## Routes

| Route         | Contents                                                                        |
| ------------- | ------------------------------------------------------------------------------- |
| `/`           | Landing page: overview, scroll-driven evolution section, mint economics, species, rarity, FAQ |
| `/collection` | Collection grid with species, rarity and stage filters, plus sorting          |
| `/tree/[id]`  | A single token: attributes, stage progress, and the append-only funding record    |
| `/mint`       | Mint flow: Privy wallet, ERC-20 approve then mint, and the full specification      |
| `/impact`     | Public ledger: live contract reads, the donation route step by step, and method    |
| `/forest`     | Holder view, gated on a connected wallet                                          |
| `/admin`      | Verification console: how a partner report becomes a stage change                 |

## Artwork

Eighteen photographed specimen trees: six species with three silhouettes each,
all shot the same way, isolated and straight on against a seamless white studio
ground. A young oak and an ancient burled one, a dense young pine and a
windswept old one, a weeping cherry and a columnar white one, and so on. They
live in `public/masters/` and are the only source material in the collection.

Each was separated from its background by script: a flood fill from the frame
removes the backdrop and its cast shadow, then alpha is derived from how much
the subject darkens or tints what sits behind it, with the edge colour
unmultiplied so no white fringe survives on a dark ground.

The thousand tokens are composed from those eighteen. `data/trees.json` decides
every token's traits first — the supply table on the site is asserted by
`npm run validate`, not approximated — and the picture follows: season regrades
the foliage, forest sets the ground, effect washes the frame, canopy and trunk
nudge the framing, and stage sets how much of the frame the tree fills.

Artwork is composed on request at `/api/nft/[index]/[stage].png`, with metadata
at `/api/metadata/[index]/[stage].json` in the shape the contract's `tokenURI`
resolves. Both are deterministic and served immutable, so an image is built
once and then cached rather than stored as four thousand committed files.

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

Trait and copy data comes from `src/lib/data.ts`, which reads `data/trees.json`.
Chain state does not: `src/components/ChainImpact.tsx` reads `totalSupply`,
`totalDonated` and `stage()` from the contract through viem, and reports an RPC
failure as an RPC failure rather than as a zero.

Wallets are Privy (`src/components/WalletProvider.tsx`), so an email or Google
sign-in produces an embedded wallet and a dev with nothing installed can still
reach the mint screen.

## Local development

```bash
npm install
npm run dev         # http://localhost:3000
npm run build

npm run traits      # regenerate data/trees.json
npm run validate    # masters present, traits known, distribution exact
npm run provenance  # the hash the contract commits at deployment
```

Contract work lives in `contracts/`:

```bash
cd contracts && npx hardhat test    # 22 tests, Tree.sol and ReserveHarvester.sol
```

The tests are worth reading before the contracts. Several assert absences rather
than behaviour — that no function exists to move the donation recipient, to set
the stage, or to withdraw from the harvester — because those absences are the
part of the design that has to survive later edits.

Deployment is written out step by step in `DEPLOY.md`.

## Where this stands

Settled: Robinhood Chain, ERC-721, 1,000 tokens, 7,777 $TREE per mint, five per
wallet, 60% to reforestation, 6.7% creator fee. All of it is in the contract and
covered by the tests.

Missing before anyone can mint:

- **$TREE is not launched.** `PAYMENT_TOKEN` has no address, so the approve step
  has nothing to approve. This is the first blocker.
- **The contract is not deployed.** `DEPLOY.md` is the runbook. It needs a funded
  deployer wallet and `DONATION_RECIPIENT`, which is the project's own
  reforestation reserve and **not** the charity's address — the file explains
  why at length, and the field is immutable, so read it before filling it in.
- **Cost per tree is unknown**, as no partner has confirmed a figure. The site
  shows a dash rather than an estimate, and no "N trees planted" claim is made
  anywhere.
- **Verification of planting reports** needs a second, independent reader.

So the mint screen can be walked through today, up to the point where it needs a
token contract to talk to. Everything before that — connect, quantity, price,
the wallet limit, the specification — is real.

## Scope

A Tree token is a collectible with a funding record attached. It carries no
yield, no revenue share, no buyback and no claim about resale value. Nothing in
this repository constitutes an offer or financial advice.
