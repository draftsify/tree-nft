"use client";

import Image from "next/image";
import Link from "next/link";
import TreeCard from "@/components/TreeCard";
import { useWallet } from "@/components/WalletProvider";
import {
  Button,
  ButtonLink,
  Eyebrow,
  Provisional,
  Section,
  StatusDot,
} from "@/components/ui";
import { MINT, MY_TREE_IDS, SPECIES, STAGES, TREES } from "@/lib/data";

export default function MyForest() {
  const { connected, address, setOpen } = useWallet();
  const trees = MY_TREE_IDS.map((id) => TREES[id - 1]);

  if (!connected) {
    return (
      <Section className="pb-32 pt-40 md:pt-52">
        <div className="relative overflow-hidden rounded-[28px] bg-paper-2 px-6 py-24 text-center md:px-16">
          <Image
            src="/tree/tree-sm.webp"
            alt=""
            aria-hidden
            width={560}
            height={550}
            className="pointer-events-none absolute -bottom-[22%] left-1/2 w-[min(700px,120%)] -translate-x-1/2 opacity-[0.12]"
          />
          <div className="relative">
            <Eyebrow>My Forest</Eyebrow>
            <h1 className="display mx-auto mt-6 max-w-[14ch] text-[clamp(2rem,5.4vw,3.8rem)]">
              Connect a wallet to see your trees.
            </h1>
            <p className="mx-auto mt-5 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">
              Connecting is read-only and no signature is requested. In this
              prototype it loads three sample tokens so the screen can be
              reviewed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              <Button size="lg" onClick={() => setOpen(true)}>
                Connect wallet
              </Button>
              <ButtonLink href="/collection" variant="outline" size="lg">
                Browse the collection
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: trees.filter((t) => t.stage === s.id).length,
  }));

  return (
    <>
      <Section className="pb-12 pt-36 md:pt-44">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Eyebrow>My Forest</Eyebrow>
              <span className="num text-[12px] text-ink-3">{address}</span>
            </div>
            <h1 className="display mt-6 text-[clamp(2.4rem,6vw,4.4rem)]">
              {trees.length} trees, growing at their own pace.
            </h1>
          </div>
          <ButtonLink href="/mint" variant="outline">
            Mint another
          </ButtonLink>
        </div>
      </Section>

      {/* ── personal impact ─────────────────────────────── */}
      <Section className="pb-14">
        <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-b border-line py-7 pr-6">
            <div className="display text-[36px]">{trees.length}</div>
            <div className="mt-2 text-[13px] font-medium text-ink">trees held</div>
            <p className="mt-1.5 text-[12px] text-ink-3">All Genesis, all numbered.</p>
          </div>
          <div className="border-b border-line py-7 pr-6">
            <div className="display flex items-baseline gap-2 text-[36px]">
              —
              <Provisional />
            </div>
            <div className="mt-2 text-[13px] font-medium text-ink">real trees funded</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
              Blank until a partner confirms cost per tree. It will never be an
              estimate.
            </p>
          </div>
          <div className="border-b border-line py-7 pr-6">
            <div className="num display text-[36px]">
              {(trees.length * MINT.priceEth).toFixed(4)}
            </div>
            <div className="mt-2 text-[13px] font-medium text-ink">ETH contributed</div>
            <p className="mt-1.5 text-[12px] text-ink-3">
              {(trees.length * MINT.priceEth * 0.6).toFixed(4)} ETH of it routed to reforestation.
            </p>
          </div>
          <div className="border-b border-line py-7 pr-6">
            <div className="display text-[36px]">
              {new Set(trees.map((t) => t.region)).size}
            </div>
            <div className="mt-2 text-[13px] font-medium text-ink">regions represented</div>
            <p className="mt-1.5 text-[12px] text-ink-3">
              Across {new Set(trees.map((t) => t.species)).size} species.
            </p>
          </div>
        </div>

        {/* stage strip */}
        <div className="mt-12 border-t border-line pt-6">
          <Eyebrow>Stage spread</Eyebrow>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {stageCounts.map((s) => (
              <div key={s.id} className={s.count ? "" : "opacity-40"}>
                <div className="flex items-baseline gap-2">
                  <span className="num text-[22px] text-ink">{s.count}</span>
                </div>
                <div className="mt-1 text-[13px] text-ink">{s.label}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">{s.unlock}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── holdings ────────────────────────────────────── */}
      <Section className="pb-16">
        <h2 className="display text-[clamp(1.6rem,3.4vw,2.4rem)]">Your trees</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {trees.map((t, i) => (
            <TreeCard key={t.id} tree={t} priority={i < 3} />
          ))}
        </div>
      </Section>

      {/* ── activity ────────────────────────────────────── */}
      <section className="border-t border-line bg-paper-2 px-5 py-20 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <Eyebrow>Activity</Eyebrow>
          <h2 className="display mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)]">
            What changed, and why.
          </h2>

          <div className="mt-8 border-t border-line">
            {trees.map((t) => {
              const species = SPECIES.find((s) => s.id === t.species)!;
              const stage = STAGES.find((s) => s.id === t.stage)!;
              return (
                <Link
                  key={t.id}
                  href={`/tree/${t.id}`}
                  className="grid gap-2 border-b border-line py-5 transition-colors hover:text-ink md:grid-cols-[auto_1fr_auto_auto] md:items-center md:gap-6"
                >
                  <span className="num text-[13px] text-ink">#{t.tokenId}</span>
                  <span className="text-[13.5px] text-ink-2">
                    {species.name} advanced to <span className="text-ink">{stage.label}</span> —{" "}
                    {stage.unlock.toLowerCase()}
                  </span>
                  <StatusDot status={t.status} />
                  <span className="num text-[12px] text-ink-3">{t.mintedAt}</span>
                </Link>
              );
            })}
          </div>

          <p className="mt-4 text-[12px] text-ink-3">
            Sample activity. A live version reads these events from the
            contract&rsquo;s stage-update log rather than from a database.
          </p>
        </div>
      </section>
    </>
  );
}
