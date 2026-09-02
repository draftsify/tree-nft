# Deployment runbook

Everything up to the contract is done and live. What remains needs a funded
wallet, so it is written out here step by step rather than half-executed.

Nothing below is reversible in the ordinary sense. Read the summary the deploy
script prints before confirming: two of the addresses can never be changed.

---

## Before you start

You need:

- A deployment wallet holding a little ETH on Robinhood Chain for gas. The
  whole sequence costs well under $1; $10 is generous.
- The $TREE token deployed, and its address. The mint is paid in it, and the
  address is written into an immutable field.
- The private key of that wallet, in your own shell. **Never paste it into a
  file in this repository, into a commit, or into a chat.**

Everything else is already recorded in `contracts/.env.example`.

## 1. Confirm the immutable addresses

Two values are written into immutable storage and can never be changed
afterwards. Check both against their sources now, not later.

| | Value | Check it against |
| --- | --- | --- |
| Reforestation reserve | `DONATION_RECIPIENT` in `.env` | an address you control, ideally a multisig |
| Treasury | `0xe3fEd943483d4c5D544b234b8311A4D6A08613e3` | your own records |
| Payment token | `PAYMENT_TOKEN` in `.env` | the deployed $TREE contract |

**The contract does not pay One Tree Planted directly, and must not be told
to.** The mint settles in $TREE on Robinhood Chain; a charity donation address
accepts what it can realise, which means mainnet ETH. Sending $TREE to
`0x62233D5483515A79ac06CEcEbac7D399fDF8a99b` would be an irreversible transfer
of an asset they cannot use, and the immutable field means it would keep
happening on every mint.

So `DONATION_RECIPIENT` is your own reforestation reserve. One Tree Planted's
address is the end of the route, not the contract's recipient. Verify it at
https://onetreeplanted.org/pages/donate-crypto when you send step 05, not now.

Whatever you set is permanent. If the reserve key is lost, every future mint
pays an address nobody can empty.

## 2. Confirm the provenance hash

```bash
npm run provenance
```

Should print:

```
PROVENANCE_HASH=0x005a832244b4dd8e1e18a9921eeae7a86b50bb066ddaa4bf4da06c056c5bdaa5
```

It covers `data/trees.json` and all eighteen masters by content. If it differs,
something in the collection changed since this was written; find out what before
deploying. The value is already filled into `contracts/.env.example`.

## 3. Deploy

```bash
cd contracts
cp .env.example .env          # then fill DEPLOYER_KEY and PROVENANCE_HASH
npm run deploy
```

The script prints the chain, the deployer, its balance, and every value it is
about to write, with the immutable ones under their own heading. Read that
block. It stops there only in the sense that you can still Ctrl-C.

Record the deployed address.

## 4. Point the site at the contract

```bash
npx vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production --scope draftsifys-projects
# paste the deployed address
npx vercel --prod --yes --scope draftsifys-projects
```

The mint panel switches from simulation to a real transaction as soon as this
variable exists. Nothing else needs changing.

## 5. Set the metadata pointer

From a wallet client, on the deployed contract:

```
setBaseURI("https://tree-nft-beta.vercel.app/api/metadata/")
```

The contract resolves `{baseURI}{artworkIndex}/{stage}.json`, which is exactly
what the route serves.

**Do not call `freezeMetadata()` while the artwork is served from this site.**
Freezing would have the contract promise the artwork can never move, while the
files behind it remain replaceable. Leave it unfrozen until the images live
somewhere content-addressed, and then freeze.

## 6. Verify before opening

Check the collection reads correctly before anyone can pay:

```bash
curl -s https://tree-nft-beta.vercel.app/api/metadata/0/1.json
curl -sI https://tree-nft-beta.vercel.app/api/nft/0/4.png | head -3
```

Then open the mint:

```
setMintOpen(true)
```

## 7. First mint, then stop

Mint exactly one token from a wallet you control. On the transaction, confirm:

- one `Minted` event and one `Donated` event
- an internal transfer of 60% to the donation address
- an internal transfer of 40% to the treasury
- the contract's balance still zero

Only once that transaction looks right should the mint be announced.

## 8. Wire the fee harvester

Once $TREE is launched on Pons, set the launch's fee recipient to a deployed
`ReserveHarvester` rather than to a wallet. Its `harvest()` is callable by
anyone and can only pay the reserve, so fees are collected without a key
sitting online on a schedule and without anyone having to remember.

`pendingNative()` and `pendingToken(address)` let a keeper check before paying
gas; `harvestAll(tokens)` skips whatever is empty rather than reverting, so it
is safe to call on a fixed timer.

## 9. OpenSea

OpenSea indexes Robinhood Chain natively and reads ERC-721 with no submission
step, so there is nothing to file. After the first mint the collection appears
on its own; give it a few minutes.

The name, logo, banner and description come from `contractURI()`, which the
contract already points at `/api/collection` on this site. That means the
listing arrives dressed rather than blank, and no manual claim-and-edit is
needed to get the banner up.

To change the collection copy later, either edit `src/app/api/collection/route.ts`
and redeploy the site, or call `setContractURI` with a different URL. This is
deliberately outside `freezeMetadata`: a banner is not the artwork, and
freezing the artwork should not also freeze a typo in the description.

Claiming the collection in OpenSea's own interface — which does require signing
in with the deployer wallet — is only needed for things `contractURI` cannot
express, such as category, links and payout settings.

Do not trust a collection URL until you have opened it yourself.
