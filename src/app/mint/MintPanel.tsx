"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatUnits, parseEventLogs, type Address } from "viem";
import { useWallet } from "@/components/WalletProvider";
import { Button, Eyebrow, Provisional, RarityBadge } from "@/components/ui";
import { IMPACT, MINT, PAYMENT, SPECIES, TREES, priceLabel, speciesImage } from "@/lib/data";
import { explorerTx } from "@/lib/chain";
import {
  CONTRACT_ADDRESS,
  ERC20_ABI,
  TREE_ABI,
  isDeployed,
  publicClient,
  readChainState,
  type ChainState,
} from "@/lib/contract";

type Phase = "idle" | "approving" | "confirming" | "minting" | "done";

export default function MintPanel() {
  const { connected, fullAddress, setOpen, getWalletClient } = useWallet();
  const [wanted, setWanted] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [minted, setMinted] = useState<number[]>([]);
  const [ack, setAck] = useState(false);
  const [chain, setChain] = useState<ChainState | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [read, setRead] = useState<{
    account: string;
    tokens: bigint;
    nfts: number;
  } | null>(null);

  // Live collection state. Absent a deployment this stays null and the panel
  // shows its pre-launch figures instead.
  const refresh = useCallback(() => {
    readChainState()
      .then(setChain)
      .catch(() => setChain(null));
  }, []);
  useEffect(refresh, [refresh]);

  /**
   * What this wallet holds, which decides whether the mint can succeed at all.
   *
   * Both limits are enforced by the contract, so submitting past either one
   * costs the buyer gas for a transaction that reverts. Reading them here is
   * what turns that into a disabled button and a sentence instead.
   */
  const readHoldings = useCallback(() => {
    // Returning without touching state matters: a synchronous setState here
    // would re-render before the effect settles. Whether the reading belongs
    // to the connected wallet is decided below instead.
    if (!isDeployed || !chain || !fullAddress) return;
    const account = fullAddress as Address;
    publicClient
      .multicall({
        allowFailure: false,
        contracts: [
          {
            address: chain.paymentToken,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [account],
          },
          {
            address: CONTRACT_ADDRESS as Address,
            abi: TREE_ABI,
            functionName: "balanceOf",
            args: [account],
          },
        ],
      })
      .then(([tokens, nfts]) =>
        setRead({ account, tokens: tokens as bigint, nfts: Number(nfts) }),
      )
      // A failed read must not masquerade as an empty wallet, so this leaves
      // holdings unknown and the mint enabled; the contract still refuses.
      .catch(() => setRead(null));
  }, [chain, fullAddress]);
  useEffect(readHoldings, [readHoldings]);

  const price = chain
    ? Number(formatUnits(chain.mintPrice, PAYMENT.decimals))
    : MINT.price;
  const supply = chain?.maxSupply ?? MINT.supply;
  const mintedCount = chain?.totalSupply ?? IMPACT.minted;
  const perWallet = chain?.perWallet ?? MINT.perWallet;
  const live = chain !== null && chain.mintOpen;

  // A reading is only about this wallet if it was taken for this wallet.
  // Switching accounts therefore shows nothing rather than the last one's
  // balance, without an effect having to clear it.
  const holdings =
    read && fullAddress && read.account.toLowerCase() === fullAddress.toLowerCase()
      ? read
      : null;

  const slotsLeft = holdings ? Math.max(0, perWallet - holdings.nfts) : perWallet;
  const maxQty = Math.max(1, Math.min(perWallet, slotsLeft));

  // Holding four already means five cannot be minted, so the quantity is
  // clamped as it is read rather than corrected afterwards.
  const qty = Math.min(wanted, maxQty);
  const total = (qty * price).toLocaleString("en-US");
  const toPartner = Math.round(qty * price * 0.6).toLocaleString("en-US");

  const due = chain ? chain.mintPrice * BigInt(qty) : BigInt(0);
  const held = holdings?.tokens ?? null;
  const shortfall = held !== null && held < due ? due - held : null;
  const blocked = shortfall !== null || slotsLeft === 0;

  async function run() {
    setError(null);
    setTxHash(null);

    // No contract yet: keep the walkthrough, and keep saying it is one.
    if (!isDeployed) {
      setPhase("confirming");
      window.setTimeout(() => setPhase("minting"), 900);
      window.setTimeout(() => {
        const ids = Array.from({ length: qty }, (_, i) => (i % TREES.length) + 1);
        setMinted(ids);
        setPhase("done");
      }, 2600);
      return;
    }

    try {
      const wallet = await getWalletClient();
      if (!wallet) throw new Error("No wallet connected.");
      if (!chain) throw new Error("Could not read the contract.");

      const owner = wallet.account!.address as Address;
      const due = chain.mintPrice * BigInt(qty);

      // Re-checked at the moment of the click rather than trusted from the
      // render, since a balance can move in between.
      const balance = await publicClient.readContract({
        address: chain.paymentToken,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [owner],
      });
      if (balance < due) {
        throw new Error(
          `This wallet holds ${Number(formatUnits(balance, PAYMENT.decimals)).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${PAYMENT.symbol} and the mint costs ${Number(formatUnits(due, PAYMENT.decimals)).toLocaleString("en-US", { maximumFractionDigits: 0 })}.`,
        );
      }

      // An ERC-20 mint needs the spender approved first. Approve exactly what
      // this mint costs rather than an unlimited allowance: a buyer should not
      // have to leave a standing permission behind to buy one token.
      const allowance = await publicClient.readContract({
        address: chain.paymentToken,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [owner, CONTRACT_ADDRESS as Address],
      });

      if (allowance < due) {
        setPhase("approving");
        const approveHash = await wallet.writeContract({
          address: chain.paymentToken,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESS as Address, due],
          chain: wallet.chain,
          account: wallet.account!,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      setPhase("confirming");
      const hash = await wallet.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TREE_ABI,
        functionName: "mint",
        args: [BigInt(qty)],
        chain: wallet.chain,
        account: wallet.account!,
      });

      setTxHash(hash);
      setPhase("minting");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("The transaction reverted.");

      // Token ids come from the receipt rather than from a counter, so a
      // concurrent mint cannot make us show somebody else's token.
      const logs = parseEventLogs({
        abi: TREE_ABI,
        eventName: "Minted",
        logs: receipt.logs,
      });
      setMinted(logs.map((l) => Number(l.args.tokenId)));
      setPhase("done");
      refresh();
      readHoldings();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(
        /user rejected|denied/i.test(message)
          ? "You cancelled the transaction."
          : message.split("\n")[0],
      );
      setPhase("idle");
    }
  }

  const busy = phase === "approving" || phase === "confirming" || phase === "minting";

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      {/* ── the machine ──────────────────────────────── */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-paper-2">
          <Image
            src="/tree/tree.webp"
            alt=""
            aria-hidden
            fill
            priority
            className="scale-[0.86] object-contain"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div>
              <Eyebrow>The Forest</Eyebrow>
              <p className="num mt-1.5 text-[15px] text-ink">
                {mintedCount.toLocaleString("en-US")} /{" "}
                {supply.toLocaleString("en-US")} minted
              </p>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-3">
              <div
                className="h-full rounded-full bg-moss"
                style={{ width: `${(mintedCount / supply) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-moss" />
                  <p className="text-[13px] text-ink-2">
                    {txHash
                      ? "Minted. The reforestation share left in the same transaction."
                      : "Simulation complete. No transaction was sent."}
                  </p>
                </div>
                <h3 className="display mt-4 text-[26px]">
                  {minted.length === 1
                    ? `Token #${String(minted[0]).padStart(5, "0")} is yours.`
                    : `${minted.length} tokens are yours.`}
                </h3>
                <p className="mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-ink-2">
                  {txHash
                    ? `${toPartner} ${PAYMENT.symbol} left for the reforestation reserve in that same transaction, on its way to One Tree Planted. Your trees grow as the collection's total donation crosses each threshold.`
                    : "A token grows as the collection's total donation crosses each threshold, which is a value anyone can read from the contract."}
                </p>
                {txHash && (
                  <p className="mt-3">
                    <a
                      href={explorerTx(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[12px] text-ink underline underline-offset-4 hover:text-moss"
                    >
                      {txHash.slice(0, 12)}…{txHash.slice(-10)}
                    </a>
                  </p>
                )}

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {minted.map((id) => {
                    const t = TREES[id - 1];
                    return (
                      <Link
                        key={id}
                        href={`/tree/${id}`}
                        className="group overflow-hidden rounded-[12px] bg-paper-2"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={speciesImage(t.species)}
                            alt=""
                            fill
                            sizes="140px"
                            className="scale-[0.9] object-contain transition-transform duration-500 group-hover:scale-100"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1 px-1 py-2">
                          <span className="num text-[11px] text-ink">#{t.tokenId}</span>
                          <RarityBadge rarity={t.rarity} />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 flex gap-2">
                  <Link
                    href="/forest"
                    className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-paper hover:bg-moss"
                  >
                    Open My Forest
                  </Link>
                  <button
                    onClick={() => {
                      setPhase("idle");
                      setMinted([]);
                    }}
                    className="inline-flex h-10 items-center rounded-full border border-line px-4 text-[13px] text-ink-2 hover:border-line-2"
                  >
                    Run it again
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <Eyebrow>Quantity</Eyebrow>
                    <div className="mt-3 flex items-center gap-3">
                      <Stepper
                        onClick={() => setWanted(Math.max(1, qty - 1))}
                        disabled={busy || qty <= 1}
                        label="−"
                      />
                      <span className="num w-10 text-center text-[26px] text-ink">{qty}</span>
                      <Stepper
                        onClick={() => setWanted(Math.min(maxQty, qty + 1))}
                        disabled={busy || qty >= maxQty}
                        label="+"
                      />
                      <span className="ml-1 text-[12px] text-ink-3">
                        {holdings && slotsLeft < perWallet
                          ? `${slotsLeft} left of ${perWallet}`
                          : `max ${perWallet}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Eyebrow>Total</Eyebrow>
                    <p className="num mt-3 text-[26px] leading-none text-ink">
                      {total} {PAYMENT.symbol}
                    </p>
                    <p className="mt-1.5 text-[12px] text-ink-3">
                      {priceLabel()} per tree
                    </p>
                  </div>
                </div>

                {holdings && (
                  <div className="mt-6 border-t border-line pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-ink-2">
                        Your balance
                      </span>
                      <span
                        className={`num text-[13px] ${shortfall ? "text-bark" : "text-ink"}`}
                      >
                        {Number(
                          formatUnits(holdings.tokens, PAYMENT.decimals),
                        ).toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        {PAYMENT.symbol}
                      </span>
                    </div>
                    {shortfall !== null && (
                      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                        {Number(
                          formatUnits(shortfall, PAYMENT.decimals),
                        ).toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        {PAYMENT.symbol} short of {qty}{" "}
                        {qty > 1 ? "trees" : "tree"}. Lower the quantity, or get{" "}
                        {PAYMENT.symbol} first — the mint is paid in it, not in
                        ETH.
                      </p>
                    )}
                    {slotsLeft === 0 && (
                      <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                        This wallet already holds {perWallet}, which is the
                        limit the contract enforces. A further mint would be
                        refused on chain.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 border-t border-line pt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-ink-2">
                      To the reforestation reserve
                    </span>
                    <span className="num text-[13px] text-ink">
                      {toPartner} {PAYMENT.symbol}
                    </span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                    60% of the mint, sent in this same transaction. It is then
                    swapped to ETH, bridged to mainnet and donated to One Tree
                    Planted, because a charity address cannot receive{" "}
                    {PAYMENT.symbol}. Every step of that route is published with
                    its hash on the impact page.
                  </p>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="mt-0.5 size-4 accent-[#5b7150]"
                  />
                  <span className="text-[12.5px] leading-relaxed text-ink-2">
                    I understand that this is a collectible with no financial
                    return and that resale value is set by the secondary market.
                  </span>
                </label>

                <div className="mt-5">
                  {connected ? (
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!ack || busy || (isDeployed && !live) || blocked}
                      onClick={run}
                    >
                      {phase === "approving"
                        ? `Approve ${PAYMENT.symbol} in your wallet…`
                        : phase === "confirming"
                          ? "Confirm the mint in your wallet…"
                          : phase === "minting"
                            ? "Minting…"
                            : slotsLeft === 0
                              ? `Wallet limit reached`
                              : shortfall !== null
                                ? `Not enough ${PAYMENT.symbol}`
                                : `Mint ${qty} tree${qty > 1 ? "s" : ""}`}
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
                      Connect wallet to mint
                    </Button>
                  )}
                  {error && (
                    <p className="mt-3 text-center text-[12px] text-bark">{error}</p>
                  )}
                  {txHash && phase === "minting" && (
                    <p className="mt-3 text-center text-[11.5px] text-ink-3">
                      Waiting for confirmation —{" "}
                      <a
                        href={explorerTx(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono underline underline-offset-4"
                      >
                        view on Blockscout
                      </a>
                    </p>
                  )}
                  {!error && !txHash && (
                    <p className="mt-3 text-center text-[11.5px] text-ink-3">
                      {!isDeployed
                        ? "Simulation only. No contract is deployed, so no transaction is sent and nothing is charged."
                        : live
                          ? `${toPartner} ${PAYMENT.symbol} of this leaves for the reforestation reserve in the same transaction.`
                          : "The contract is deployed but the mint is not open yet."}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── the caveats ──────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="border-t border-line pt-5">
          <div className="flex items-center gap-3">
            <Eyebrow>Read before minting</Eyebrow>
            <Provisional>Not live</Provisional>
          </div>
          <ul className="mt-5 flex flex-col gap-4">
            {[
              [
                "No trees-per-mint figure has been set.",
                "One will be published only once a partner confirms cost per tree in writing. Any figure quoted before then is an estimate.",
              ],
              [
                "This is not an investment.",
                "The token carries no yield, revenue share, buyback or price support. Resale value is set by the buyer and may be below the mint price.",
              ],
              [
                "A token may remain a Seed for months.",
                "Stages advance on verified milestones, and planting is seasonal. A batch minted in November may not be planted until spring.",
              ],
              [
                "Traits are assigned at random and are final.",
                "Species and rarity cannot be selected, and nothing can be rerolled after mint.",
              ],
            ].map(([h, p]) => (
              <li key={h} className="border-t border-line pt-4 first:border-0 first:pt-0">
                <p className="text-[14px] font-medium text-ink">{h}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{p}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-line pt-5">
          <Eyebrow>What you can check</Eyebrow>
          <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] leading-relaxed text-ink-2">
            <li>— The contract source and its verified bytecode.</li>
            <li>— Every donation transaction hash, on the impact page.</li>
            <li>— The metadata versions of each token, including superseded ones.</li>
            <li>— Supply per species, read directly from the contract.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
            {SPECIES.map((s) => (
              <span
                key={s.id}
                className="text-[11.5px] text-ink-3"
              >
                {s.name} · {s.supply.toLocaleString("en-US")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Increase" : "Decrease"}
      className="grid size-10 place-items-center rounded-full border border-line bg-paper text-[18px] text-ink transition-colors hover:border-line-2 disabled:opacity-30"
    >
      {label}
    </button>
  );
}
