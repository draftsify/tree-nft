import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

/** 7,777 $TREE, eighteen decimals. */
const PRICE = parseEther("7777");
const PROVENANCE = "0x" + "ab".repeat(32);
const COLLECTION_URI = "https://tree-nft-beta.vercel.app/api/collection";
const UNREVEALED = "https://tree-nft-beta.vercel.app/api/metadata/unrevealed.json";

/** Thresholds sized so a handful of mints crosses each one in the tests. */
const DONATION_PER_MINT = (PRICE * 6000n) / 10000n;
const THRESHOLDS: [bigint, bigint, bigint] = [
  DONATION_PER_MINT * 2n,
  DONATION_PER_MINT * 4n,
  DONATION_PER_MINT * 6n,
];

async function setup() {
  const { viem } = await network.connect();
  const [owner, buyer, other, stranger] = await viem.getWalletClients();

  const donation = getAddress("0x62233D5483515A79ac06CEcEbac7D399fDF8a99b");
  const treasury = getAddress("0x8E301F169637a79E12Ce67f5f1dA1A1Fb4BE7C87");

  const token = await viem.deployContract("MockTree", []);
  const tree = await viem.deployContract("Tree", [
    token.address,
    donation,
    treasury,
    PRICE,
    PROVENANCE,
    THRESHOLDS,
    UNREVEALED,
    COLLECTION_URI,
    owner.account.address,
    670n,
  ]);

  // Fund and approve the buyers. The stranger is funded but never approves.
  for (const w of [buyer, other]) {
    await token.write.mint([w.account.address, PRICE * 20n]);
    await token.write.approve([tree.address, PRICE * 20n], { account: w.account });
  }
  await token.write.mint([stranger.account.address, PRICE * 2n]);

  return { viem, owner, buyer, other, stranger, tree, token, donation, treasury };
}

describe("Tree", () => {
  let ctx: Awaited<ReturnType<typeof setup>>;

  beforeEach(async () => {
    ctx = await setup();
  });

  it("refuses to mint before the owner opens it", async () => {
    const { tree, buyer } = ctx;
    await assert.rejects(tree.write.mint([1n], { account: buyer.account }), /MintClosed/);
  });

  it("forwards the donation share inside the mint transaction", async () => {
    const { tree, token, buyer, donation, treasury } = ctx;
    await tree.write.setMintOpen([true]);

    await tree.write.mint([2n], { account: buyer.account });

    const paid = PRICE * 2n;
    const expectedDonation = (paid * 6000n) / 10000n;

    assert.equal(
      await token.read.balanceOf([donation]),
      expectedDonation,
      "recipient should receive 60% in the same transaction",
    );
    assert.equal(
      await token.read.balanceOf([treasury]),
      paid - expectedDonation,
      "treasury should receive the remainder",
    );
    assert.equal(
      await token.read.balanceOf([tree.address]),
      0n,
      "the contract should never hold mint funds",
    );
    assert.equal(await tree.read.totalDonated(), expectedDonation);
  });

  it("pulls nothing without an approval", async () => {
    const { tree, stranger } = ctx;
    await tree.write.setMintOpen([true]);
    await assert.rejects(
      tree.write.mint([1n], { account: stranger.account }),
      /allowance|ERC20|revert/i,
    );
  });

  it("pulls exactly the price and no more", async () => {
    const { tree, token, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    const before = await token.read.balanceOf([buyer.account.address]);
    await tree.write.mint([3n], { account: buyer.account });
    const after = await token.read.balanceOf([buyer.account.address]);

    assert.equal(before - after, PRICE * 3n);
  });

  it("enforces the per-wallet cap across separate transactions", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    await tree.write.mint([5n], { account: buyer.account });
    await assert.rejects(
      tree.write.mint([1n], { account: buyer.account }),
      /WalletLimitReached/,
    );
    assert.equal(await tree.read.totalSupply(), 5n);
  });

  it("advances stage only as donations accumulate, with no setter", async () => {
    const { tree, buyer, other } = ctx;
    await tree.write.setMintOpen([true]);

    assert.equal(await tree.read.stage(), 1);
    await tree.write.mint([2n], { account: buyer.account });
    assert.equal(await tree.read.stage(), 2, "two mints should reach stage 2");
    await tree.write.mint([2n], { account: other.account });
    assert.equal(await tree.read.stage(), 3);

    const abi = tree.abi as readonly { name?: string; type: string }[];
    const setters = abi.filter(
      (e) => e.type === "function" && /^set.*[Ss]tage/.test(e.name ?? ""),
    );
    assert.equal(setters.length, 0, "no function may set the stage directly");
  });

  it("reports how much is left to the next stage", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    assert.equal(await tree.read.toNextStage(), THRESHOLDS[0]);
    await tree.write.mint([1n], { account: buyer.account });
    const donated = await tree.read.totalDonated();
    assert.equal(await tree.read.toNextStage(), THRESHOLDS[0] - donated);
  });

  it("serves the unrevealed URI until the offset is drawn", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);
    await tree.write.mint([1n], { account: buyer.account });

    assert.equal(await tree.read.tokenURI([1n]), UNREVEALED);
    await assert.rejects(tree.write.setStartingIndex(), /SupplyExhausted/);
  });

  it("keeps the recipient and the payment asset immutable", async () => {
    const { tree, token, donation } = ctx;
    assert.equal(getAddress(await tree.read.donationRecipient()), donation);
    assert.equal(getAddress(await tree.read.paymentToken()), getAddress(token.address));

    const abi = tree.abi as readonly { name?: string; type: string }[];
    const setters = abi.filter(
      (e) =>
        e.type === "function" &&
        /^set/.test(e.name ?? "") &&
        /recipient|donation|treasury|paymentToken/i.test(e.name ?? ""),
    );
    assert.equal(setters.length, 0, "no function may redirect or redenominate");
  });

  it("cannot be sent ETH, so no stray balance can build up in it", async () => {
    const { tree, buyer } = ctx;
    await assert.rejects(
      buyer.sendTransaction({ to: tree.address, value: parseEther("0.01") }),
      /revert|selector/i,
    );
    await assert.rejects(tree.write.sweepToDonation(), /NothingToSweep/);
  });

  it("sweeps stray payment tokens to the recipient, not the treasury", async () => {
    const { tree, token, buyer, donation, treasury } = ctx;

    await token.write.transfer([tree.address, PRICE], { account: buyer.account });
    await tree.write.sweepToDonation();

    assert.equal(await token.read.balanceOf([donation]), PRICE);
    assert.equal(await token.read.balanceOf([treasury]), 0n);
    assert.equal(await token.read.balanceOf([tree.address]), 0n);
  });

  it("stops at max supply", async () => {
    const { tree } = ctx;
    assert.equal(await tree.read.MAX_SUPPLY(), 1000n);
    assert.equal(await tree.read.remaining(), 1000n);
  });

  it("exposes the collection name and contract-level metadata", async () => {
    const { tree } = ctx;
    assert.equal(await tree.read.name(), "Trees");
    assert.equal(await tree.read.symbol(), "TREE");
    assert.equal(await tree.read.contractURI(), COLLECTION_URI);
  });

  it("sets the creator fee to 6.7%", async () => {
    const { tree, owner } = ctx;
    const [receiver, amount] = (await tree.read.royaltyInfo([1n, 10_000n])) as [
      string,
      bigint,
    ];
    assert.equal(getAddress(receiver), getAddress(owner.account.address));
    assert.equal(amount, 670n, "6.7% of a 10,000 sale is 670");
  });

  it("lets collection copy change but keeps it out of the artwork freeze", async () => {
    const { tree } = ctx;
    await tree.write.setBaseURI(["https://example.test/meta/"]);
    await tree.write.freezeMetadata();

    await assert.rejects(
      tree.write.setBaseURI(["https://elsewhere.test/"]),
      /MetadataIsFrozen/,
    );
    // A banner is not the artwork, so this stays editable on purpose.
    await tree.write.setContractURI(["https://example.test/collection"]);
    assert.equal(await tree.read.contractURI(), "https://example.test/collection");
  });
});
