# Deployment runbook

Everything up to the contract is done and live. What remains needs a funded
wallet, so it is written out here step by step rather than half-executed.

Nothing below is reversible in the ordinary sense. Read the summary the deploy
script prints before confirming: two of the addresses can never be changed.

---

## Before you start

You need:

- A deployment wallet holding a little ETH on Robinhood Chain. Gas for the
  whole sequence is well under $1; $10 is generous.
- The private key of that wallet, in your own shell. **Never paste it into a
  file in this repository, into a commit, or into a chat.**

Everything else is already recorded in `contracts/.env.example`.

## 1. Confirm the immutable addresses

Two values are written into immutable storage and can never be changed
afterwards. Check both against their sources now, not later.

| | Value | Check it against |
| --- | --- | --- |
| Donation recipient | `0x62233D5483515A79ac06CEcEbac7D399fDF8a99b` | https://onetreeplanted.org/pages/donate-crypto |
| Treasury | `0x8E301F169637a79E12Ce67f5f1dA1A1Fb4BE7C87` | your own records |

If the donation address on One Tree Planted's page differs by a single
character, stop. A transfer to the wrong address cannot be undone, and the
contract would keep sending there forever.

## 2. Get the provenance hash

```bash
npm run metadata
```

Prints a `0x…` hash committing the order of the collection. Copy it.

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

## 8. OpenSea

OpenSea indexes Robinhood Chain natively and reads ERC-721 with no submission
step. After the first mint the collection should appear on its own; give it a
few minutes. Editing the collection name, banner and description requires
signing in with the deployer wallet and claiming the collection in OpenSea's
own interface.

Do not trust a collection URL until you have opened it yourself.
