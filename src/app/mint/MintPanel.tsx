"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useWallet } from "@/components/WalletProvider";
import { Button, Eyebrow, Provisional, RarityBadge } from "@/components/ui";
import { IMPACT, MINT, SPECIES, TREES, speciesImage } from "@/lib/data";

type Phase = "idle" | "confirming" | "minting" | "done";

export default function MintPanel() {
  const { connected, setOpen } = useWallet();
  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [minted, setMinted] = useState<number[]>([]);
  const [ack, setAck] = useState(false);

  const total = (qty * MINT.priceEth).toFixed(4);
  const toPartner = (qty * MINT.priceEth * 0.6).toFixed(4);

  function run() {
    setPhase("confirming");
    // Two fake stages so the wallet-confirm and on-chain waits both show up.
    window.setTimeout(() => setPhase("minting"), 900);
    window.setTimeout(() => {
      const ids = Array.from({ length: qty }, (_, i) => ((IMPACT.minted + i) % TREES.length) + 1);
      setMinted(ids);
      setPhase("done");
    }, 2600);
  }

  const busy = phase === "confirming" || phase === "minting";

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
              <Eyebrow>Genesis Forest</Eyebrow>
              <p className="num mt-1.5 text-[15px] text-ink">
                {IMPACT.minted.toLocaleString("en-US")} / {MINT.supply.toLocaleString("en-US")} minted
              </p>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-3">
              <div
                className="h-full rounded-full bg-moss"
                style={{ width: `${(IMPACT.minted / MINT.supply) * 100}%` }}
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
                    Simulated mint complete — nothing was sent.
                  </p>
                </div>
                <h3 className="display mt-4 text-[26px]">
                  {qty === 1 ? "Your tree is a Seed." : `${qty} trees, all Seeds.`}
                </h3>
                <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-2">
                  It stays a Seed until the reforestation share for this batch
                  settles on-chain. That&rsquo;s the only thing that moves it.
                </p>

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
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={busy || qty <= 1}
                        label="−"
                      />
                      <span className="num w-10 text-center text-[26px] text-ink">{qty}</span>
                      <Stepper
                        onClick={() => setQty((q) => Math.min(MINT.perWallet, q + 1))}
                        disabled={busy || qty >= MINT.perWallet}
                        label="+"
                      />
                      <span className="ml-1 text-[12px] text-ink-3">
                        max {MINT.perWallet}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Eyebrow>Total</Eyebrow>
                    <p className="num mt-3 text-[26px] leading-none text-ink">{total} ETH</p>
                    <p className="mt-1.5 text-[12px] text-ink-3">
                      ≈ ${(qty * MINT.priceUsdApprox).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-ink-2">To the reforestation partner</span>
                    <span className="num text-[13px] text-ink">{toPartner} ETH</span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                    60% of the mint, batched and sent as one transaction whose
                    hash is published on the impact page. The number of trees
                    that buys is not yet known — see the note beside this panel.
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
                    I understand this is a collectible with no financial return,
                    and that resale value is set entirely by other buyers.
                  </span>
                </label>

                <div className="mt-5">
                  {connected ? (
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!ack || busy}
                      onClick={run}
                    >
                      {phase === "confirming"
                        ? "Confirm in your wallet…"
                        : phase === "minting"
                          ? "Minting…"
                          : `Mint ${qty} tree${qty > 1 ? "s" : ""}`}
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
                      Connect wallet to mint
                    </Button>
                  )}
                  <p className="mt-3 text-center text-[11.5px] text-ink-3">
                    Simulation only. No contract, no transaction, no charge.
                  </p>
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
                "No trees-per-mint figure exists yet.",
                "We won't publish one until a partner confirms cost per tree in writing. Anyone quoting you a number today is guessing.",
              ],
              [
                "This is not an investment.",
                "No yield, no revenue share, no buyback, no floor support. If you sell, the price is whatever a buyer offers — possibly less than you paid.",
              ],
              [
                "Your tree may stay a Seed for months.",
                "Stages advance on verified milestones. Planting seasons are seasonal; a batch minted in November may not be planted until spring.",
              ],
              [
                "Traits are random and final.",
                "You cannot choose a species or rarity, and nothing can be rerolled. What the contract assigns is what you get.",
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
            <li>— Each token&rsquo;s metadata versions, including superseded ones.</li>
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
