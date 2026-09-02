# Tree

Front-end for a collectible NFT project. Each token is a unique digital tree, a
fixed share of every mint is sent to reforestation partners, and each donation
is published with its transaction hash.

**Nothing is deployed.** No contract is live, no mint has happened, no donation
has been made and no partnership agreement exists. Every impact figure on the
site is zero because zero has happened, and the site says so on the page rather
than relegating the disclosure to this file.

What is here: the full interface and three contracts, with 32 tests over them.

| Contract | What it does |
| --- | --- |
| `Tree.sol` | The ERC-721. Splits every mint inside the mint call. |
| `ReforestationReserve.sol` | Holds the reforestation share. Sells it and bridges it to the charity, both callable by anyone, neither taking a destination. |
| `ReserveHarvester.sol` | Claims Pons creator fees into the reserve, callable by anyone. |

What is missing before a mint can happen is in **Where this stands** below.

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
failure as an RPC failure rather than as a zero. `RouteLedger.tsx` reads the
reserve's `Swapped` and `Bridged` logs, so each row on the impact page exists
because a transaction happened and carries its hash.

Those reads go through Multicall3, which `src/lib/chain.ts` has to name
explicitly or viem throws `ChainDoesNotSupportContract`.

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
cd contracts && npm install
npx hardhat test    # 32 tests over the three contracts
```

### Running a real mint, locally

The one path that cannot be exercised on a real network before $TREE exists is
approve then mint. This runs it end to end against a local node answering as
Robinhood Chain. The keys below are the published Hardhat test accounts and are
not secrets; nothing here touches a real network, and `local-open.ts` refuses
to run against anything but localhost.

```bash
cd contracts
npx hardhat node --chain-id 4663 --port 8546      # leave running

# in a second shell, from contracts/
export RPC_URL=http://127.0.0.1:8546
export DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

node scripts/local-multicall.mjs                  # after every node restart
npx hardhat run scripts/local-token.ts --network robinhood

export PAYMENT_TOKEN=<the address it prints>
export DONATION_RECIPIENT=0x1111111111111111111111111111111111111111
export TREASURY=0xe3fEd943483d4c5D544b234b8311A4D6A08613e3
export PROVENANCE_HASH=$(cd .. && node scripts/provenance.mjs | grep PROVENANCE_HASH= | cut -d= -f2)
export CONFIRM_DEPLOY=yes
npx hardhat run scripts/deploy.ts --network robinhood

export TREE_ADDRESS=<the address it prints>
export OWNER_KEY=$DEPLOYER_KEY
export BUYER_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
npx tsx scripts/local-open.ts
```

Two mints should leave 9,332.4 with the recipient and 6,221.6 with the treasury,
which is the 60/40 split of 15,554, and `tokenURI` should still be the
unrevealed URI because the starting index has not been drawn.

To click through it rather than read it, point `.env.local` at those addresses
and set `NEXT_PUBLIC_LOCAL_WALLET=1`, which swaps Privy for an injected wallet.
That flag is for local work and must not be set in production.

The tests are worth reading before the contracts. Several assert absences rather
than behaviour — that no function exists to move the donation recipient, to set
the stage, or to withdraw from the harvester — because those absences are the
part of the design that has to survive later edits.

Deployment is written out step by step in `DEPLOY.md`.

## Where this stands

Settled: Robinhood Chain, ERC-721, 1,000 tokens, 7,777 $TREE per mint, five per
wallet, 60% to reforestation, 6.7% creator fee. All of it is in the contract and
covered by the tests.

The route from a mint to the charity is five steps, and none of them is a wallet
of ours moving money: the split is enforced by `Tree.sol`, and the fee claim,
the sale, the bridge and the final withdrawal are each callable by anyone, take
no destination, and pay their caller nothing. `/impact` sets out the whole
route with what has to be trusted at each step.

Missing before anyone can mint:

- **$TREE is not launched.** `PAYMENT_TOKEN` has no address, so the approve step
  has nothing to approve. This is the first blocker, and two values that can
  never be changed afterwards — the pool key and the reserve's price floor —
  can only be chosen once the launch has graduated to a pool.
- **Nothing is deployed.** `DEPLOY.md` is the runbook, and its section 0 gives
  the order, which is forced: the collection's donation recipient is immutable,
  so the reserve has to exist before the collection is deployed at it.
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
