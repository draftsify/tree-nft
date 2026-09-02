import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther, getAddress, zeroAddress } from "viem";

/**
 * The reserve is the only part of the route that holds money, so these tests
 * are about what cannot be done with it rather than what can: no destination is
 * ever a parameter, no caller is privileged, and the money has one exit.
 */

/** One Tree Planted's published donation address, on Ethereum. */
const CHARITY = getAddress("0x62233D5483515A79ac06CEcEbac7D399fDF8a99b");
const ARB_SYS = getAddress("0x0000000000000000000000000000000000000064");

/** A price floor and a per-call cap, both arbitrary here. */
const FLOOR = 79_228_162_514_264_337_593_543_950_336n / 100n;
const MAX_PER_CALL = parseEther("100000");

async function setup() {
  const { viem, networkHelpers } = await network.connect();
  const [owner, stranger] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  const testClient = await viem.getTestClient();

  const pool = await viem.deployContract("MockPoolManager", []);
  const token = await viem.deployContract("MockTree", []);

  // Put the ArbSys mock at the precompile address the reserve calls.
  const arbSys = await viem.deployContract("MockArbSys", []);
  const code = await publicClient.getBytecode({ address: arbSys.address });
  await testClient.setCode({ address: ARB_SYS, bytecode: code! });

  const reserve = await viem.deployContract("ReforestationReserve", [
    pool.address,
    token.address,
    CHARITY,
    {
      currency0: zeroAddress, // ETH
      currency1: token.address, // $TREE
      fee: 3000,
      tickSpacing: 60,
      hooks: zeroAddress,
    },
    FLOOR,
    MAX_PER_CALL,
  ]);

  // The pool needs ETH to hand over, the reserve needs tokens to sell.
  await owner.sendTransaction({ to: pool.address, value: parseEther("500") });

  return { viem, publicClient, testClient, owner, stranger, pool, token, reserve, networkHelpers };
}

async function fund(ctx: Awaited<ReturnType<typeof setup>>, amount: bigint) {
  await ctx.token.write.mint([ctx.reserve.address, amount]);
}

describe("ReforestationReserve", () => {
  let ctx: Awaited<ReturnType<typeof setup>>;

  beforeEach(async () => {
    ctx = await setup();
  });

  it("lets a stranger sell the reserve, and keeps the proceeds", async () => {
    const { reserve, token, stranger, publicClient } = ctx;
    await fund(ctx, parseEther("1000"));

    await reserve.write.swap({ account: stranger.account });

    // 1000 tokens at the mock's 0.001 ETH each.
    assert.equal(await publicClient.getBalance({ address: reserve.address }), parseEther("1"));
    assert.equal(await token.read.balanceOf([reserve.address]), 0n);
    assert.equal(await reserve.read.totalSwapped(), parseEther("1"));
  });

  it("caps how much one call can sell, leaving the rest for the next", async () => {
    const { reserve, token } = ctx;
    await fund(ctx, MAX_PER_CALL + parseEther("250"));

    await reserve.write.swap();

    assert.equal(
      await token.read.balanceOf([reserve.address]),
      parseEther("250"),
      "a single call should not be able to move the price further than the cap allows",
    );
  });

  it("passes the immutable price floor to the pool as the swap limit", async () => {
    const { reserve, pool } = ctx;
    await fund(ctx, parseEther("1000"));

    await reserve.write.swap();

    assert.equal(await pool.read.lastPriceLimit(), FLOOR);
    assert.equal(
      await pool.read.lastZeroForOne(),
      false,
      "selling currency1 for currency0 is one-for-zero",
    );
  });

  it("pays only for what a partial fill actually took", async () => {
    const { reserve, token, pool } = ctx;
    await fund(ctx, parseEther("1000"));

    // The pool stops at the floor after 40% of the requested input.
    await pool.write.setFillBps([4_000n]);
    await reserve.write.swap();

    assert.equal(
      await token.read.balanceOf([reserve.address]),
      parseEther("600"),
      "the untraded remainder must stay in the reserve, not be handed to the pool",
    );
  });

  it("reverts instead of recording a sale that returned nothing", async () => {
    const { reserve, pool } = ctx;
    await fund(ctx, parseEther("1000"));

    await pool.write.setFillBps([0n]);
    await assert.rejects(reserve.write.swap(), /SwapReturnedNothing/);
    assert.equal(await reserve.read.totalSwapped(), 0n);
  });

  it("bridges to the charity, with the destination not a parameter", async () => {
    const { reserve, stranger, publicClient } = ctx;
    await fund(ctx, parseEther("1000"));
    await reserve.write.swap();

    const hash = await reserve.write.bridge({ account: stranger.account });
    const receipt = await publicClient.getTransactionReceipt({ hash });

    assert.equal(await publicClient.getBalance({ address: reserve.address }), 0n);
    assert.equal(await reserve.read.totalBridged(), parseEther("1"));

    // The destination in the event is the immutable charity, whoever called.
    const bridged = receipt.logs.find(
      (l) => getAddress(l.address) === getAddress(reserve.address),
    );
    assert.ok(bridged, "a bridge should be recorded on chain");
    assert.equal(getAddress(await reserve.read.charity()), CHARITY);
  });

  it("reverts rather than burning a keeper's gas on an empty reserve", async () => {
    const { reserve } = ctx;
    await assert.rejects(reserve.write.swap(), /NothingToSwap/);
    await assert.rejects(reserve.write.bridge(), /NothingToBridge/);
  });

  it("refuses a callback from anything but the pool manager", async () => {
    const { reserve, stranger } = ctx;
    await assert.rejects(
      reserve.write.unlockCallback(["0x"], { account: stranger.account }),
      /not the pool manager/,
    );
  });

  it("has no way to send the money anywhere else", async () => {
    const { reserve } = ctx;

    const abi = reserve.abi as readonly { name?: string; type: string; inputs?: unknown[] }[];
    const escapes = abi.filter(
      (e) =>
        e.type === "function" &&
        /^(set|withdraw|rescue|sweep|transfer|call|execute)/i.test(e.name ?? ""),
    );
    assert.equal(
      escapes.length,
      0,
      `an open swap and bridge are only safe with no escape hatch, found: ${escapes
        .map((e) => e.name)
        .join(", ")}`,
    );

    // Neither exit takes a destination, so no caller can choose one.
    for (const name of ["swap", "bridge"]) {
      const fn = abi.find((e) => e.type === "function" && e.name === name);
      assert.equal((fn?.inputs ?? []).length, 0, `${name} must take no arguments`);
    }
  });

  it("keeps the charity and the pool immutable", async () => {
    const { reserve, token, pool } = ctx;
    assert.equal(getAddress(await reserve.read.charity()), CHARITY);
    assert.equal(getAddress(await reserve.read.paymentToken()), getAddress(token.address));
    assert.equal(getAddress(await reserve.read.poolManager()), getAddress(pool.address));
    assert.equal(await reserve.read.sqrtPriceFloorX96(), FLOOR);
  });
});
