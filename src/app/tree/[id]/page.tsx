import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  ButtonLink,
  Eyebrow,
  Hash,
  Provisional,
  RarityBadge,
  Section,
  StageBadge,
  StatusDot,
} from "@/components/ui";
import {
  DONATIONS,
  SPECIES,
  STAGES,
  TREES,
  speciesImage,
  treeById,
  type StageId,
} from "@/lib/data";

export function generateStaticParams() {
  return TREES.map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tree = TREES.find((t) => t.id === Number(id));
  if (!tree) return { title: "Tree not found" };
  const species = SPECIES.find((s) => s.id === tree.species)!;
  return {
    title: `Tree #${tree.tokenId} — ${species.name}, ${tree.rarity}`,
    description: `A ${tree.rarity} ${species.name} from the Genesis Forest, minted ${tree.mintedAt}.`,
  };
}

const STAGE_ORDER: StageId[] = ["seed", "sapling", "young", "mature"];

export default async function TreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > TREES.length) notFound();

  const tree = treeById(n);
  const species = SPECIES.find((s) => s.id === tree.species)!;
  const stageIndex = STAGE_ORDER.indexOf(tree.stage);
  const donation = DONATIONS[n % DONATIONS.length];

  const attributes: [string, string][] = [
    ["Species", species.name],
    ["Rarity", tree.rarity],
    ["Forest", tree.forest],
    ["Region", tree.region],
    ["Season", tree.season],
    ["Canopy", tree.canopy],
    ["Trunk", tree.trunk],
    ["Effect", tree.effect],
    ["Collection", "Genesis"],
    ["Mint number", `#${tree.tokenId}`],
  ];

  /* The permanent log. Entries are only shown up to the stage actually reached. */
  const history = [
    {
      title: "Minted",
      date: tree.mintedAt,
      body: `Token #${tree.tokenId} issued to ${tree.owner}. Traits written and frozen in the same transaction.`,
      hash: "0x9c41e7ab35d820f6c9a417e3b58d240f7c19ae63b425d80f7c19ae63b425d80f",
      done: true,
    },
    {
      title: "Reforestation share sent",
      date: donation.date,
      body: `${donation.amountAsset} routed to the reforestation partner as part of batch ${donation.id}.`,
      hash: donation.txHash,
      done: stageIndex >= 1,
    },
    {
      title: "Allocated to a planting site",
      date: donation.status === "pending" ? null : "2026-07-15",
      body: `Partner assigned batch ${donation.id} to ${donation.region}, planting window confirmed.`,
      hash: null,
      done: stageIndex >= 2,
    },
    {
      title: "Planting report filed",
      date: donation.verifiedAt,
      body: "Dated report and site photographs attached to the batch, and to every token funded by it.",
      hash: null,
      done: stageIndex >= 3,
    },
  ];

  return (
    <>
      <Section className="pb-8 pt-32 md:pt-40">
        <Link
          href="/collection"
          className="text-[13px] text-ink-3 underline-offset-4 hover:text-ink hover:underline"
        >
          ← Genesis Forest
        </Link>
      </Section>

      <Section className="pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* artwork */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-[24px] border border-line bg-white">
              <Image
                src={speciesImage(tree.species, "lg")}
                alt={`Tree #${tree.tokenId}`}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 560px"
                className="object-contain p-8"
              />
              <div className="absolute left-5 top-5 flex gap-2">
                <RarityBadge rarity={tree.rarity} />
                <StageBadge stage={tree.stage} />
              </div>
            </div>

            {/* stage rail */}
            <div className="mt-4 rounded-[20px] border border-line bg-white p-5">
              <div className="flex items-center justify-between">
                <Eyebrow>Evolution</Eyebrow>
                <span className="text-[12px] text-ink-3">
                  Stage {stageIndex + 1} of 4
                </span>
              </div>
              <div className="mt-4 flex gap-1.5">
                {STAGE_ORDER.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${
                      i <= stageIndex ? "bg-moss" : "bg-paper-3"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {STAGES.map((s, i) => (
                  <div key={s.id} className={i <= stageIndex ? "" : "opacity-35"}>
                    <div className="text-[14px]" aria-hidden>
                      {s.glyph}
                    </div>
                    <div className="mt-1 text-[11.5px] text-ink-2">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-3">
                {STAGES[stageIndex].blurb}
              </p>
            </div>
          </div>

          {/* details */}
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="display text-[clamp(2.4rem,5.4vw,3.8rem)]">
                Tree #{tree.tokenId}
              </h1>
              <Provisional />
            </div>
            <p className="mt-3 text-[15px] text-ink-2">
              {tree.rarity} {species.name} · <span className="italic">{species.latin}</span>
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line">
              {attributes.map(([k, v]) => (
                <div key={k} className="bg-white p-4">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1.5 text-[14px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {/* impact summary */}
            <div className="mt-4 rounded-[20px] border border-line bg-paper-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <Eyebrow>Impact</Eyebrow>
                <StatusDot status={tree.status} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="display text-[28px]">
                    {donation.treesFunded === null ? "—" : "3"}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
                    trees attributed to this token. Blank until the partner
                    confirms cost per tree in writing.
                  </p>
                </div>
                <div>
                  <div className="display text-[28px]">{donation.region.split(",")[0]}</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
                    planting region for batch {donation.id}.
                  </p>
                </div>
              </div>
            </div>

            {/* ownership + market */}
            <div className="mt-4 rounded-[20px] border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>Current owner</Eyebrow>
                  <p className="num mt-1.5 text-[14px] text-ink">{tree.owner}</p>
                </div>
                <div className="text-right">
                  <Eyebrow>Last sale</Eyebrow>
                  <p className="num mt-1.5 text-[14px] text-ink">—</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/mint" size="sm">
                  Mint your own
                </ButtonLink>
                <button
                  disabled
                  className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-ink-3"
                  title="No contract is deployed yet"
                >
                  View on marketplace
                </button>
                <button
                  disabled
                  className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-ink-3"
                  title="No contract is deployed yet"
                >
                  Transfer
                </button>
              </div>
              <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
                Marketplace actions are inert — nothing is deployed. When they
                work, they hand off to the standard ERC-721 interface; we don&rsquo;t
                custody the token at any point.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── permanent history ───────────────────────────── */}
      <section className="border-t border-line bg-paper-2 px-5 py-24 md:px-8">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-[1fr_1.7fr]">
            <div>
              <Eyebrow>Permanent record</Eyebrow>
              <h2 className="display mt-5 max-w-[12ch] text-[clamp(1.8rem,4vw,3rem)]">
                The part that never transfers.
              </h2>
              <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-ink-2">
                Append-only and keyed to the token id. Selling the tree rewrites
                the owner field and nothing below it.
              </p>
            </div>

            <ol className="relative">
              <div className="absolute bottom-3 left-[7px] top-3 w-px bg-line" />
              {history.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.06}>
                  <li className={`relative pb-8 pl-8 ${h.done ? "" : "opacity-45"}`}>
                    <span
                      className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 ${
                        h.done ? "border-moss bg-moss" : "border-line-2 bg-paper-2"
                      }`}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-[15px] font-medium text-ink">{h.title}</h3>
                      <span className="num text-[12px] text-ink-3">
                        {h.done ? (h.date ?? "—") : "Not yet reached"}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-2">
                      {h.body}
                    </p>
                    {h.hash && h.done && (
                      <p className="mt-2">
                        <Hash value={h.hash} />
                      </p>
                    )}
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── neighbours ──────────────────────────────────── */}
      <Section className="py-20">
        <div className="flex items-center justify-between">
          <Link
            href={`/tree/${Math.max(1, n - 1)}`}
            className="text-[13px] text-ink-2 underline-offset-4 hover:underline"
          >
            ← #{String(Math.max(1, n - 1)).padStart(5, "0")}
          </Link>
          <Link href="/collection" className="text-[13px] text-ink-3 hover:text-ink">
            All trees
          </Link>
          <Link
            href={`/tree/${Math.min(TREES.length, n + 1)}`}
            className="text-[13px] text-ink-2 underline-offset-4 hover:underline"
          >
            #{String(Math.min(TREES.length, n + 1)).padStart(5, "0")} →
          </Link>
        </div>
      </Section>
    </>
  );
}
