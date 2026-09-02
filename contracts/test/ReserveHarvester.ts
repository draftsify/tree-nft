import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

/**
 * The point of the harvester is that claiming needs no trusted operator, so
 * these tests are mostly about who is allowed to call it and where the money
 * can possibly end up.
 */

const RESERVE = getAddress("0x8E301F169637a79E12Ce67f5f1dA1A1Fb4BE7C87");

async function setup() {
  const { viem } = await network.connect();
  const [owner, stranger] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const escrow = await viem.deployContract("MockEscrow", []);
  const token = await viem.deployContract("MockTree", []);
  const harvester = await viem.deployContract("ReserveHarvester", [
    escrow.address,
    RESERVE,
  ]);

  return { viem, publicClient, owner, stranger, escrow, token, harvester };
}

describe("ReserveHarvester", () => {
  let ctx: Awaited<ReturnType<typeof setup>>;

  beforeEach(async () => {
    ctx = await setup();
  });

  it("lets a complete stranger trigger the harvest", async () => {
    const { escrow, harvester, stranger, publicClient } = ctx;

    await escrow.write.credit([harvester.address], { value: parseEther("1") });
    const before = await publicClient.getBalance({ address: RESERVE });

    // Nobody privileged is involved: this is the whole point.
    await harvester.write.harvest({ account: stranger.account });

    assert.equal(
      (await publicClient.getBalance({ address: RESERVE })) - before,
      parseEther("1"),
    );
  });

  it("pays the reserve, never the caller", async () => {
    const { escrow, harvester, stranger, publicClient } = ctx;

    await escrow.write.credit([harvester.address], { value: parseEther("2") });
    const callerBefore = await publicClient.getBalance({
      address: stranger.account.address,
    });

    await harvester.write.harvest({ account: stranger.account });

    const callerAfter = await publicClient.getBalance({
      address: stranger.account.address,
    });
    assert.ok(
      callerAfter < callerBefore,
      "the caller should only ever be out of pocket for gas",
    );
    assert.equal(await publicClient.getBalance({ address: harvester.address }), 0n);
  });

  it("forwards claimed tokens to the reserve", async () => {
    const { escrow, token, harvester, owner, stranger } = ctx;

    await token.write.mint([owner.account.address, parseEther("500")]);
    await token.write.approve([escrow.address, parseEther("500")]);
    await escrow.write.creditToken([
      harvester.address,
      token.address,
      parseEther("500"),
    ]);

    await harvester.write.harvestToken([token.address], {
      account: stranger.account,
    });

    assert.equal(await token.read.balanceOf([RESERVE]), parseEther("500"));
    assert.equal(await token.read.balanceOf([harvester.address]), 0n);
  });

  it("reverts rather than burning a keeper's gas on nothing", async () => {
    const { harvester, token, stranger } = ctx;

    await assert.rejects(
      harvester.write.harvest({ account: stranger.account }),
      /NothingToHarvest/,
    );
    await assert.rejects(
      harvester.write.harvestToken([token.address], { account: stranger.account }),
      /NothingToHarvest/,
    );
  });

  it("skips empty assets in a batch instead of reverting it", async () => {
    const { escrow, token, harvester, stranger, publicClient } = ctx;

    // Native fees pending, token fees not.
    await escrow.write.credit([harvester.address], { value: parseEther("1") });
    const before = await publicClient.getBalance({ address: RESERVE });

    await harvester.write.harvestAll([[token.address]], {
      account: stranger.account,
    });

    assert.equal(
      (await publicClient.getBalance({ address: RESERVE })) - before,
      parseEther("1"),
      "a scheduled call should not fail because one asset happens to be empty",
    );
  });

  it("keeps the destination immutable", async () => {
    const { harvester } = ctx;
    assert.equal(getAddress(await harvester.read.reserve()), RESERVE);

    const abi = harvester.abi as readonly { name?: string; type: string }[];
    const setters = abi.filter(
      (e) => e.type === "function" && /^set|^withdraw|^rescue|^sweep/.test(e.name ?? ""),
    );
    assert.equal(
      setters.length,
      0,
      "an open harvest is only safe while the destination cannot be changed",
    );
  });

  it("reports what is pending so a keeper can check before paying gas", async () => {
    const { escrow, harvester } = ctx;

    assert.equal(await harvester.read.pendingNative(), 0n);
    await escrow.write.credit([harvester.address], { value: parseEther("3") });
    assert.equal(await harvester.read.pendingNative(), parseEther("3"));
  });
});
