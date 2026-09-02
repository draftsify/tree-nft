import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

const PRICE = parseEther("0.0016");
const PROVENANCE = "0x" + "ab".repeat(32);

/** Thresholds sized so a handful of mints crosses each one in the tests. */
const THRESHOLDS: [bigint, bigint, bigint] = [
  (PRICE * 6000n) / 10000n * 2n,
  (PRICE * 6000n) / 10000n * 4n,
  (PRICE * 6000n) / 10000n * 6n,
];

async function setup() {
  const { viem } = await network.connect();
  const [owner, buyer, other] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  // Distinct addresses that are not any of the signers, so balances are easy
  // to attribute.
  const donation = getAddress("0x62233D5483515A79ac06CEcEbac7D399fDF8a99b");
  const treasury = getAddress("0x1111111111111111111111111111111111111111");

  const tree = await viem.deployContract("TreeGenesis", [
    donation,
    treasury,
    PRICE,
    PROVENANCE,
    THRESHOLDS,
    "ar://unrevealed.json",
    owner.account.address,
    500n,
  ]);

  return { viem, publicClient, owner, buyer, other, tree, donation, treasury };
}

describe("TreeGenesis", () => {
  let ctx: Awaited<ReturnType<typeof setup>>;

  beforeEach(async () => {
    ctx = await setup();
  });

  it("refuses to mint before the owner opens it", async () => {
    const { tree, buyer } = ctx;
    await assert.rejects(
      tree.write.mint([1n], { value: PRICE, account: buyer.account }),
      /MintClosed/,
    );
  });

  it("forwards the donation share inside the mint transaction", async () => {
    const { tree, buyer, publicClient, donation, treasury } = ctx;
    await tree.write.setMintOpen([true]);

    const before = await publicClient.getBalance({ address: donation });
    const treasuryBefore = await publicClient.getBalance({ address: treasury });

    await tree.write.mint([2n], { value: PRICE * 2n, account: buyer.account });

    const paid = PRICE * 2n;
    const expectedDonation = (paid * 6000n) / 10000n;

    assert.equal(
      (await publicClient.getBalance({ address: donation })) - before,
      expectedDonation,
      "recipient should receive 60% in the same transaction",
    );
    assert.equal(
      (await publicClient.getBalance({ address: treasury })) - treasuryBefore,
      paid - expectedDonation,
      "treasury should receive the remainder",
    );
    assert.equal(
      await publicClient.getBalance({ address: tree.address }),
      0n,
      "the contract should never hold mint funds",
    );
    assert.equal(await tree.read.totalDonated(), expectedDonation);
  });

  it("requires exact payment", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    await assert.rejects(
      tree.write.mint([1n], { value: PRICE - 1n, account: buyer.account }),
      /WrongPayment/,
    );
    await assert.rejects(
      tree.write.mint([1n], { value: PRICE + 1n, account: buyer.account }),
      /WrongPayment/,
      "overpayment should revert rather than be kept",
    );
  });

  it("enforces the per-wallet cap across separate transactions", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    await tree.write.mint([5n], { value: PRICE * 5n, account: buyer.account });
    await assert.rejects(
      tree.write.mint([1n], { value: PRICE, account: buyer.account }),
      /WalletLimitReached/,
    );
    assert.equal(await tree.read.totalSupply(), 5n);
  });

  it("advances stage only as donations accumulate, with no setter", async () => {
    const { tree, buyer, other } = ctx;
    await tree.write.setMintOpen([true]);

    assert.equal(await tree.read.stage(), 1);

    await tree.write.mint([2n], { value: PRICE * 2n, account: buyer.account });
    assert.equal(await tree.read.stage(), 2, "two mints should reach stage 2");

    await tree.write.mint([2n], { value: PRICE * 2n, account: other.account });
    assert.equal(await tree.read.stage(), 3);

    // There is no owner path to a stage: the ABI must not expose one.
    const abi = tree.abi as readonly { name?: string; type: string }[];
    const setters = abi.filter(
      (e) => e.type === "function" && /^set.*[Ss]tage/.test(e.name ?? ""),
    );
    assert.equal(setters.length, 0, "no function may set the stage directly");
  });

  it("reports how much is left to the next stage", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);

    const before = await tree.read.toNextStage();
    assert.equal(before, THRESHOLDS[0]);

    await tree.write.mint([1n], { value: PRICE, account: buyer.account });
    const donated = await tree.read.totalDonated();
    assert.equal(await tree.read.toNextStage(), THRESHOLDS[0] - donated);
  });

  it("serves the unrevealed URI until the offset is drawn", async () => {
    const { tree, buyer } = ctx;
    await tree.write.setMintOpen([true]);
    await tree.write.mint([1n], { value: PRICE, account: buyer.account });

    assert.equal(await tree.read.tokenURI([1n]), "ar://unrevealed.json");
    await assert.rejects(tree.write.setStartingIndex(), /SupplyExhausted/);
  });

  it("lets the owner freeze the metadata pointer permanently", async () => {
    const { tree } = ctx;
    await tree.write.setBaseURI(["ar://manifest/"]);
    await tree.write.freezeMetadata();
    await assert.rejects(
      tree.write.setBaseURI(["ar://elsewhere/"]),
      /MetadataIsFrozen/,
    );
  });

  it("keeps the donation recipient immutable", async () => {
    const { tree, donation } = ctx;
    assert.equal(getAddress(await tree.read.donationRecipient()), donation);

    const abi = tree.abi as readonly { name?: string; type: string }[];
    const setters = abi.filter(
      (e) =>
        e.type === "function" &&
        /recipient|donation/i.test(e.name ?? "") &&
        /^set/.test(e.name ?? ""),
    );
    assert.equal(setters.length, 0, "no function may redirect the donation");
  });

  it("cannot be sent ETH directly, so funds cannot pile up in it", async () => {
    const { tree, buyer } = ctx;

    // No receive() and no fallback: an accidental transfer bounces instead of
    // sitting in the contract waiting for someone to move it.
    await assert.rejects(
      buyer.sendTransaction({ to: tree.address, value: parseEther("0.01") }),
      /revert|selector/i,
    );

    // The sweep exists only for ETH forced in by selfdestruct or block reward,
    // and says so when there is none.
    await assert.rejects(tree.write.sweepToDonation(), /NothingToSweep/);
  });

  it("stops at max supply", async () => {
    const { tree } = ctx;
    assert.equal(await tree.read.MAX_SUPPLY(), 10000n);
    assert.equal(await tree.read.remaining(), 10000n);
  });
});
